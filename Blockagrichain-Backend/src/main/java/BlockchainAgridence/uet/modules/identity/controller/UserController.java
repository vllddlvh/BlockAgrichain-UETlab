package BlockchainAgridence.uet.modules.identity.controller;


import BlockchainAgridence.uet.modules.identity.dto.request.RoleAssignmentRequest;
import BlockchainAgridence.uet.modules.identity.dto.request.UserCreateRequest;
import BlockchainAgridence.uet.modules.identity.dto.response.UserResponse;
import BlockchainAgridence.uet.modules.identity.service.UserService;
import BlockchainAgridence.uet.shared.ApiResponse;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class UserController {

    UserService userService;

    // 1. Tạo nhân viên mới
    @PreAuthorize("hasAuthority('USER_CREATE')")
    @PostMapping
    public ApiResponse<UserResponse> createUser(@RequestBody @Valid UserCreateRequest request) {
        return ApiResponse.<UserResponse>builder()
                .code(1000)
                .message("Tạo tài khoản nhân viên thành công")
                .body(userService.createUser(request))
                .build();
    }

    // 2. Lấy danh sách nhân viên trong cùng tổ chức
    @PreAuthorize("hasAuthority('USER_VIEW')")
    @GetMapping
    public ApiResponse<List<UserResponse>> getMyOrganizationUsers() {
        return ApiResponse.<List<UserResponse>>builder()
                .code(1000)
                .message("Lấy danh sách nhân viên thành công")
                .body(userService.getMyOrganizationUsers())
                .build();
    }

    // 3. Xem hồ sơ cá nhân của người đang đăng nhập
    @PreAuthorize("isAuthenticated()")
    @GetMapping("/me")
    public ApiResponse<UserResponse> getMyProfile() {
        return ApiResponse.<UserResponse>builder()
                .code(1000)
                .message("Lấy thông tin cá nhân thành công")
                .body(userService.getMyProfile())
                .build();
    }

    // 4. Gán/Cập nhật Vai trò (Role) cho nhân viên
    @PreAuthorize("hasAuthority('USER_ASSIGN_ROLE')")
    @PutMapping("/{id}/roles")
    public ApiResponse<UserResponse> assignRoles(
            @PathVariable UUID id,
            @RequestBody @Valid RoleAssignmentRequest request) {

        return ApiResponse.<UserResponse>builder()
                .code(1000)
                .message("Cập nhật phân quyền thành công")
                .body(userService.assignRoles(id, request))
                .build();
    }

    // 5. Xóa (Soft Delete) nhân viên
    @PreAuthorize("hasAuthority('USER_DELETE')")
    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteUser(@PathVariable UUID id) {
        userService.deleteUser(id);
        return ApiResponse.<Void>builder()
                .code(1000)
                .message("Đã vô hiệu hóa tài khoản nhân viên")
                .build();
    }
}