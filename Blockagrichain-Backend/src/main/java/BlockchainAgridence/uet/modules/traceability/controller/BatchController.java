package BlockchainAgridence.uet.modules.traceability.controller;


import BlockchainAgridence.uet.modules.traceability.dto.request.BatchCreateRequest;
import BlockchainAgridence.uet.modules.traceability.dto.request.BatchEventRequest;
import BlockchainAgridence.uet.modules.traceability.dto.response.BatchEventResponse;
import BlockchainAgridence.uet.modules.traceability.dto.response.BatchResponse;
import BlockchainAgridence.uet.modules.traceability.entity.BatchStatus;
import BlockchainAgridence.uet.modules.traceability.service.BatchService;
import BlockchainAgridence.uet.shared.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/batches")
@RequiredArgsConstructor
public class BatchController {

    private final BatchService batchService;


    // CÁC API NỘI BỘ TỔ CHỨC (CẦN XÁC THỰC & PHÂN QUYỀN RBAC)
    @PostMapping
    @PreAuthorize("hasAuthority('BATCH_CREATE')") // Bảo mật: Chỉ user có quyền mới được tạo
    public ApiResponse<BatchResponse> createBatch(
            @RequestBody @Valid BatchCreateRequest request) {

        return ApiResponse.<BatchResponse>builder()
                .code(1000)
                .message("Tạo lô hàng thành công")
                .body(batchService.createBatch(request))
                .build();
    }

    @PostMapping("/{batchId}/events")
    @PreAuthorize("hasAuthority('BATCH_UPDATE')") // Bảo mật: Chỉ nhân viên kho/cán bộ mới được bắn sự kiện
    public ApiResponse<BatchEventResponse> appendEvent(
            @PathVariable UUID batchId,
            @RequestBody @Valid BatchEventRequest request) {

        return ApiResponse.<BatchEventResponse>builder()
                .code(1000)
                .message("Ghi nhận nhật ký thành công")
                .body(batchService.appendEvent(batchId, request))
                .build();
    }

    @PatchMapping("/{batchId}/status")
    @PreAuthorize("hasAuthority('BATCH_UPDATE')") // Bảo mật: Chỉ người có quyền mới được chuyển trạng thái
    public ApiResponse<BatchResponse> updateBatchStatus(
            @PathVariable UUID batchId,
            @RequestParam("status") BatchStatus newStatus) {

        return ApiResponse.<BatchResponse>builder()
                .code(1000)
                .message("Cập nhật trạng thái lô hàng thành công")
                .body(batchService.updateBatchStatus(batchId, newStatus))
                .build();
    }


    // CÁC API PUBLIC (KHÔNG CẦN XÁC THỰC - DÙNG CHO APP QUÉT MÃ QR)
    @GetMapping("/{batchId}")
    // LƯU Ý: Phải mở PermitAll() cho endpoint này trong SecurityConfig của bạn
    public ApiResponse<BatchResponse> getBatchDetail(@PathVariable UUID batchId) {
        return ApiResponse.<BatchResponse>builder()
                .code(1000)
                .message("Lấy chi tiết lô hàng thành công")
                .body(batchService.getBatchDetail(batchId))
                .build();
    }

    @GetMapping("/{batchId}/events")
    // LƯU Ý: Phải mở PermitAll() cho endpoint này trong SecurityConfig của bạn
    public ApiResponse<List<BatchEventResponse>> getBatchEvents(@PathVariable UUID batchId) {
        return ApiResponse.<List<BatchEventResponse>>builder()
                .code(1000)
                .message("Lấy danh sách sự kiện truy xuất thành công")
                .body(batchService.getBatchEvents(batchId))
                .build();
    }
}