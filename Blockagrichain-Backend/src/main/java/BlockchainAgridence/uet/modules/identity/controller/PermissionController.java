package BlockchainAgridence.uet.modules.identity.controller;

import BlockchainAgridence.uet.modules.identity.dto.response.PermissionResponse;
import BlockchainAgridence.uet.modules.identity.service.PermissionService;
import BlockchainAgridence.uet.shared.ApiResponse;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/permissions")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class PermissionController {

    PermissionService permissionService;

    @PreAuthorize("hasAuthority('SYSTEM_PERMISSION_VIEW')")
    @GetMapping
    public ApiResponse<List<PermissionResponse>> getAllPermissions() {
        return ApiResponse.<List<PermissionResponse>>builder()
                .code(1000)
                .message("Lấy danh sách permission thành công")
                .body(permissionService.getAllPermissions())
                .build();
    }
}
