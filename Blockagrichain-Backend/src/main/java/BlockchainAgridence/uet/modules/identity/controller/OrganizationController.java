package BlockchainAgridence.uet.modules.identity.controller;


import BlockchainAgridence.uet.modules.identity.dto.request.OrgRegistrationRequest;
import BlockchainAgridence.uet.modules.identity.dto.request.OrgUpdateRequest;
import BlockchainAgridence.uet.modules.identity.dto.response.OrgDocumentResponse;
import BlockchainAgridence.uet.modules.identity.dto.response.OrgResponse;
import BlockchainAgridence.uet.modules.identity.entity.OrgStatus;
import BlockchainAgridence.uet.modules.identity.service.OrganizationService;
import BlockchainAgridence.uet.shared.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/organizations")
@RequiredArgsConstructor
public class OrganizationController {

    private final OrganizationService orgService;

    // API Đăng ký Tổ chức (Kèm tạo tài khoản Admin) - PermitAll
    @PostMapping("/register")
    public ApiResponse<OrgResponse> register(@RequestBody @Valid OrgRegistrationRequest request) {
        return ApiResponse.<OrgResponse>builder()
                .code(1000)
                .message("Đăng ký tổ chức thành công. Vui lòng chờ phê duyệt.")
                .body(orgService.registerOrganization(request))
                .build();
    }

    // API Lấy danh sách tất cả tổ chức (Dành cho SYSTEM_ADMIN)
    @PreAuthorize("hasAuthority('SYSTEM_ORG_VIEW_ALL')")
    @GetMapping
    public ApiResponse<List<OrgResponse>> getAllOrganizations() {
        return ApiResponse.<List<OrgResponse>>builder()
                .code(1000)
                .message("Lấy danh sách tổ chức thành công")
                .body(orgService.getAllOrganizations())
                .build();
    }

    // API Lấy thông tin chi tiết một tổ chức
    @PreAuthorize("isAuthenticated()")
    @GetMapping("/{id}")
    public ApiResponse<OrgResponse> getOrganizationById(@PathVariable UUID id) {
        return ApiResponse.<OrgResponse>builder()
                .code(1000)
                .message("Lấy thông tin tổ chức thành công")
                .body(orgService.getOrganizationById(id))
                .build();
    }

    // API Cập nhật thông tin tổ chức (Cho ORG_ADMIN hoặc SYSTEM_ADMIN)
    @PreAuthorize("hasAuthority('ORG_UPDATE')")
    @PutMapping("/{id}")
    public ApiResponse<OrgResponse> updateOrganization(
            @PathVariable UUID id,
            @RequestBody @Valid OrgUpdateRequest request) {
        return ApiResponse.<OrgResponse>builder()
                .code(1000)
                .message("Cập nhật thông tin tổ chức thành công")
                .body(orgService.updateOrganization(id, request))
                .build();
    }

    // API Cập nhật trạng thái tổ chức (Duyệt / Khóa) - Dành cho SYSTEM_ADMIN
    // Sử dụng @RequestParam để truyền trạng thái (VD: /api/v1/organizations/{id}/status?status=VERIFIED)
    @PreAuthorize("hasAuthority('SYSTEM_ORG_MANAGE_STATUS')")
    @PatchMapping("/{id}/status")
    public ApiResponse<OrgResponse> updateOrganizationStatus(
            @PathVariable UUID id,
            @RequestParam("status") OrgStatus status) {
        return ApiResponse.<OrgResponse>builder()
                .code(1000)
                .message("Cập nhật trạng thái tổ chức thành công")
                .body(orgService.updateOrganizationStatus(id, status))
                .build();
    }

    // API Thêm chứng chỉ / tài liệu mới cho tổ chức
    @PreAuthorize("hasAuthority('ORG_UPDATE') or hasAuthority('SYSTEM_ORG_UPDATE')")
    @PostMapping("/{id}/documents")
    public ApiResponse<OrgDocumentResponse> addDocument(
            @PathVariable UUID id,
            @RequestBody @Valid BlockchainAgridence.uet.modules.identity.dto.request.OrgDocumentCreateRequest request) {
        return ApiResponse.<OrgDocumentResponse>builder()
                .code(1000)
                .message("Thêm tài liệu/chứng chỉ thành công")
                .body(orgService.addDocumentToOrganization(id, request))
                .build();
    }
}