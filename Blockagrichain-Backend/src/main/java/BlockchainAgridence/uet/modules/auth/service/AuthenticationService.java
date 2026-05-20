package BlockchainAgridence.uet.modules.auth.service;

import BlockchainAgridence.uet.exception.AppException;
import BlockchainAgridence.uet.exception.ErrorCode;
import BlockchainAgridence.uet.modules.auth.dto.request.AuthenticationRequest;
import BlockchainAgridence.uet.modules.auth.dto.request.IntrospectRequest;
import BlockchainAgridence.uet.modules.auth.dto.request.LogoutRequest;
import BlockchainAgridence.uet.modules.auth.dto.request.RefreshRequest;
import BlockchainAgridence.uet.modules.auth.dto.response.AuthenticationResponse;
import BlockchainAgridence.uet.modules.auth.dto.response.IntrospectResponse;
import BlockchainAgridence.uet.modules.auth.entity.RefreshToken;
import BlockchainAgridence.uet.modules.auth.entity.TokenBlacklist;
import BlockchainAgridence.uet.modules.auth.repository.RefreshTokenRepository;
import BlockchainAgridence.uet.modules.auth.repository.TokenBlacklistRepository;
import BlockchainAgridence.uet.modules.identity.entity.User;
import BlockchainAgridence.uet.modules.identity.repository.UserRepository;
import com.nimbusds.jose.*;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jose.crypto.MACVerifier;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.CollectionUtils;

import java.text.ParseException;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.StringJoiner;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class AuthenticationService {

    UserRepository userRepository;
    PasswordEncoder passwordEncoder;
    TokenBlacklistRepository tokenBlacklistRepository;
    RefreshTokenRepository refreshTokenRepository;

    @NonFinal
    @Value("${jwt.signerKey}")
    protected String SIGNER_KEY;

    @NonFinal
    @Value("${jwt.valid-duration}")
    protected long VALID_DURATION;

    @NonFinal
    @Value("${jwt.refreshable-duration}")
    protected long REFRESHABLE_DURATION;

    public IntrospectResponse introspect(IntrospectRequest request) throws JOSEException, ParseException {
        var token = request.getToken();
        boolean isValid = true;

        try {
            verifyToken(token);
        } catch (AppException e) {
            isValid = false;
        }

        return IntrospectResponse.builder().valid(isValid).build();
    }

    @Transactional
    public AuthenticationResponse login(AuthenticationRequest request) {
        // 1. Tìm user theo email
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        // 2. So sánh mật khẩu
        boolean authenticated = passwordEncoder.matches(request.getPassword(), user.getPasswordHash());

        if (!authenticated) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }

        // 3. Generate Access Token & Refresh Token
        String accessToken = generateToken(user);
        String refreshTokenStr = UUID.randomUUID().toString(); // Dùng UUID làm Refresh Token

        // 4. Save Refresh Token to DB
        RefreshToken refreshToken = RefreshToken.builder()
                .user(user)
                .token(refreshTokenStr)
                .expiryDate(LocalDateTime.now().plus(REFRESHABLE_DURATION, ChronoUnit.SECONDS))
                .isRevoked(false)
                .build();
        
        refreshTokenRepository.save(refreshToken);

        return AuthenticationResponse.builder()
                .token(accessToken)
                .refreshToken(refreshTokenStr)
                .authenticated(true)
                .build();
    }

    @Transactional
    public void logout(LogoutRequest request) throws ParseException, JOSEException {
        try {
            var signToken = verifyToken(request.getToken());

            String tokenString = request.getToken();
            Date expiryTime = signToken.getJWTClaimsSet().getExpirationTime();

            // Đưa token vào danh sách đen
            TokenBlacklist tokenBlacklist = TokenBlacklist.builder()
                    .token(tokenString)
                    .expiryDate(expiryTime.toInstant().atZone(ZoneId.systemDefault()).toLocalDateTime())
                    .build();

            tokenBlacklistRepository.save(tokenBlacklist);
        } catch (AppException exception) {
            log.info("Token already expired or invalid");
        }
    }

    @Transactional
    public AuthenticationResponse refreshToken(RefreshRequest request) {
        // 1. Tìm Refresh Token trong DB
        RefreshToken refreshToken = refreshTokenRepository.findByToken(request.getRefreshToken())
                .orElseThrow(() -> new AppException(ErrorCode.UNAUTHENTICATED));

        // 2. Kiểm tra tính hợp lệ (đã bị revoke hoặc hết hạn chưa)
        if (refreshToken.getIsRevoked() || refreshToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            refreshToken.setIsRevoked(true); // Đánh dấu revoke đề phòng nó chỉ mới bị hết hạn
            refreshTokenRepository.save(refreshToken);
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }

        // 3. Áp dụng Refresh Token Rotation: Revoke token cũ này đi
        refreshToken.setIsRevoked(true);
        refreshTokenRepository.save(refreshToken);

        // 4. Cấp phát cặp Access/Refresh Token hoàn toàn mới
        User user = refreshToken.getUser();
        String newAccessToken = generateToken(user);
        String newRefreshTokenStr = UUID.randomUUID().toString();

        RefreshToken newRefreshToken = RefreshToken.builder()
                .user(user)
                .token(newRefreshTokenStr)
                .expiryDate(LocalDateTime.now().plus(REFRESHABLE_DURATION, ChronoUnit.SECONDS))
                .isRevoked(false)
                .build();

        refreshTokenRepository.save(newRefreshToken);

        return AuthenticationResponse.builder()
                .token(newAccessToken)
                .refreshToken(newRefreshTokenStr)
                .authenticated(true)
                .build();
    }

    private String generateToken(User user) {
        JWSHeader header = new JWSHeader(JWSAlgorithm.HS512);

        JWTClaimsSet.Builder builder = new JWTClaimsSet.Builder()
                .subject(user.getEmail()) // Dùng email làm định danh chính
                .issuer("blockchain-agridence.uet.edu.vn")
                .issueTime(new Date())
                .expirationTime(new Date(
                        Instant.now().plus(VALID_DURATION, ChronoUnit.SECONDS).toEpochMilli()))
                .jwtID(UUID.randomUUID().toString())
                .claim("scope", buildScope(user))
                .claim("userId", user.getId().toString());

        if (user.getOrgId() != null) {
            builder.claim("orgId", user.getOrgId().toString());
        }

        JWTClaimsSet jwtClaimsSet = builder.build();

        Payload payload = new Payload(jwtClaimsSet.toJSONObject());

        JWSObject jwsObject = new JWSObject(header, payload);

        try {
            jwsObject.sign(new MACSigner(SIGNER_KEY.getBytes()));
            return jwsObject.serialize();
        } catch (JOSEException e) {
            log.error("Cannot create token", e);
            throw new RuntimeException(e);
        }
    }

    private SignedJWT verifyToken(String token) throws JOSEException, ParseException {
        JWSVerifier verifier = new MACVerifier(SIGNER_KEY.getBytes());

        SignedJWT signedJWT = SignedJWT.parse(token);

        Date expiryTime = signedJWT.getJWTClaimsSet().getExpirationTime();
        var verified = signedJWT.verify(verifier);

        if (!(verified && expiryTime.after(new Date()))) throw new AppException(ErrorCode.UNAUTHENTICATED);

        // Kiểm tra xem token này có nằm trong danh sách đen không
        if (tokenBlacklistRepository.existsByToken(token))
            throw new AppException(ErrorCode.UNAUTHENTICATED);

        return signedJWT;
    }

    private String buildScope(User user) {
        StringJoiner stringJoiner = new StringJoiner(" ");

        if (!CollectionUtils.isEmpty(user.getRoles()))
            user.getRoles().forEach(role -> {
                // Nối prefix ROLE_ vào tên của Role code
                stringJoiner.add("ROLE_" + role.getCode()); 
                if (!CollectionUtils.isEmpty(role.getPermissions()))
                    role.getPermissions().forEach(permission -> stringJoiner.add(permission.getCode()));
            });

        return stringJoiner.toString();
    }
}
