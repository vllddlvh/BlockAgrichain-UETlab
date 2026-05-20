package BlockchainAgridence.uet.modules.auth.controller;

import BlockchainAgridence.uet.modules.auth.dto.request.AuthenticationRequest;
import BlockchainAgridence.uet.modules.auth.dto.response.AuthenticationResponse;
import BlockchainAgridence.uet.modules.auth.service.AuthenticationService;
import BlockchainAgridence.uet.shared.ApiResponse;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import BlockchainAgridence.uet.modules.auth.dto.request.IntrospectRequest;
import BlockchainAgridence.uet.modules.auth.dto.request.LogoutRequest;
import BlockchainAgridence.uet.modules.auth.dto.request.RefreshRequest;
import BlockchainAgridence.uet.modules.auth.dto.response.IntrospectResponse;
import com.nimbusds.jose.JOSEException;
import java.text.ParseException;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AuthenticationController {

    AuthenticationService authenticationService;

    @PostMapping("/login")
    public ApiResponse<AuthenticationResponse> login(@RequestBody AuthenticationRequest request) {
        return ApiResponse.<AuthenticationResponse>builder()
                .code(1000)
                .message("Đăng nhập thành công")
                .body(authenticationService.login(request))
                .build();
    }

    @PostMapping("/logout")
    public ApiResponse<Void> logout(@RequestBody LogoutRequest request) throws ParseException, JOSEException {
        authenticationService.logout(request);
        return ApiResponse.<Void>builder()
                .code(1000)
                .message("Đăng xuất thành công")
                .build();
    }

    @PostMapping("/refresh")
    public ApiResponse<AuthenticationResponse> refresh(@RequestBody RefreshRequest request) {
        return ApiResponse.<AuthenticationResponse>builder()
                .code(1000)
                .message("Làm mới token thành công")
                .body(authenticationService.refreshToken(request))
                .build();
    }

    @PostMapping("/introspect")
    public ApiResponse<IntrospectResponse> introspect(@RequestBody IntrospectRequest request) throws ParseException, JOSEException {
        return ApiResponse.<IntrospectResponse>builder()
                .code(1000)
                .body(authenticationService.introspect(request))
                .build();
    }
}
