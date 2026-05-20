package BlockchainAgridence.uet.modules.identity.controller;

import BlockchainAgridence.uet.modules.identity.dto.response.RoleResponse;
import BlockchainAgridence.uet.modules.identity.service.RoleService;
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
@RequestMapping("/api/v1/roles")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class RoleController {

    RoleService roleService;

    @PreAuthorize("hasAuthority('ROLE_VIEW')")
    @GetMapping
    public ApiResponse<List<RoleResponse>> getAllRoles() {
        return ApiResponse.<List<RoleResponse>>builder()
                .code(1000)
                .message("Lấy danh sách vai trò thành công")
                .body(roleService.getAllRoles())
                .build();
    }
}
