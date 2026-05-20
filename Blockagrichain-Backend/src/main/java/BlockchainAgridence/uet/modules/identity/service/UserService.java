package BlockchainAgridence.uet.modules.identity.service;


import BlockchainAgridence.uet.exception.AppException;
import BlockchainAgridence.uet.exception.ErrorCode;
import BlockchainAgridence.uet.modules.identity.dto.request.RoleAssignmentRequest;
import BlockchainAgridence.uet.modules.identity.dto.request.UserCreateRequest;
import BlockchainAgridence.uet.modules.identity.dto.response.UserResponse;
import BlockchainAgridence.uet.modules.identity.entity.Role;
import BlockchainAgridence.uet.modules.identity.entity.User;
import BlockchainAgridence.uet.modules.identity.mapper.UserMapper;
import BlockchainAgridence.uet.modules.identity.repository.RoleRepository;
import BlockchainAgridence.uet.modules.identity.repository.UserRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import BlockchainAgridence.uet.shared.utils.SecurityUtils;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class UserService {

    UserRepository userRepository;
    RoleRepository roleRepository;
    UserMapper userMapper;
    PasswordEncoder passwordEncoder;

    @Transactional
    public UserResponse createUser(UserCreateRequest request) {
        log.info("Bắt đầu tạo tài khoản nhân viên với email: {}", request.getEmail());

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new AppException(ErrorCode.USER_EMAIL_EXISTED);
        }

        User user = userMapper.toEntity(request);

        // Băm mật khẩu trước khi lưu
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));

        // Lấy orgId của Admin đang đăng nhập và gán cho nhân viên mới
        // (Đảm bảo HR công ty nào chỉ tạo được nhân viên cho công ty đó)
        UUID currentOrgId = SecurityUtils.getCurrentUserOrgId();
        user.setOrgId(currentOrgId);

        // Map Roles nếu có truyền lên
        if (request.getRoleCodes() != null && !request.getRoleCodes().isEmpty()) {
            List<Role> roles = roleRepository.findAllByCodeIn(request.getRoleCodes());
            user.setRoles(new HashSet<>(roles));
        }

        user = userRepository.save(user);
        return userMapper.toResponse(user);
    }

    @Transactional(readOnly = true)
    public List<UserResponse> getMyOrganizationUsers() {
        UUID currentOrgId = SecurityUtils.getCurrentUserOrgId();

        // Multi-tenancy: Chỉ lấy user thuộc cùng Org
        return userRepository.findAllByOrgId(currentOrgId).stream()
                .map(userMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public UserResponse getMyProfile() {
        UUID currentUserId = SecurityUtils.getCurrentUserId();

        User user = userRepository.findById(currentUserId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        return userMapper.toResponse(user);
    }

    @Transactional
    public UserResponse assignRoles(UUID userId, RoleAssignmentRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        List<Role> roles = roleRepository.findAllByCodeIn(request.getRoleCodes());
        if (roles.size() != request.getRoleCodes().size()) {
            throw new AppException(ErrorCode.ROLE_NOT_FOUND);
        }

        user.setRoles(new HashSet<>(roles));
        user = userRepository.save(user);

        return userMapper.toResponse(user);
    }

    @Transactional
    public void deleteUser(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        // Hàm này sẽ tự động kích hoạt @SQLDelete trong Entity User để update is_deleted = true
        userRepository.delete(user);
    }
}