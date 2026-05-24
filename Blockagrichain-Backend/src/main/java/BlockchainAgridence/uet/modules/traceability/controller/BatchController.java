package BlockchainAgridence.uet.modules.traceability.controller;


import BlockchainAgridence.uet.modules.traceability.dto.request.BatchCreateRequest;
import BlockchainAgridence.uet.modules.traceability.dto.request.BatchEventRequest;
import BlockchainAgridence.uet.modules.traceability.dto.request.BlockchainAnchorConfirmRequest;
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


    // --- INTERNAL APIs (require auth + role) ---

    // Only FARM_ADMIN creates new batches (farmers own the production origin)
    @PostMapping
    @PreAuthorize("hasAnyRole('ORG_ADMIN', 'FARM_ADMIN')")
    public ApiResponse<BatchResponse> createBatch(
            @RequestBody @Valid BatchCreateRequest request) {

        return ApiResponse.<BatchResponse>builder()
                .code(1000)
                .message("Tạo lô hàng thành công")
                .body(batchService.createBatch(request))
                .build();
    }

    // Any authenticated staff/admin of the owning org can append events
    @PostMapping("/{batchId}/events")
    @PreAuthorize("hasAnyRole('ORG_ADMIN', 'FARM_ADMIN', 'TRANSPORT_ADMIN', 'RETAIL_ADMIN', 'STAFF')")
    public ApiResponse<BatchEventResponse> appendEvent(
            @PathVariable UUID batchId,
            @RequestBody @Valid BatchEventRequest request) {

        return ApiResponse.<BatchEventResponse>builder()
                .code(1000)
                .message("Ghi nhận nhật ký thành công")
                .body(batchService.appendEvent(batchId, request))
                .build();
    }

    // Role-specific status transitions are enforced in BatchService
    @PatchMapping("/{batchId}/status")
    @PreAuthorize("hasAnyRole('ORG_ADMIN', 'FARM_ADMIN', 'TRANSPORT_ADMIN', 'RETAIL_ADMIN', 'STAFF')")
    public ApiResponse<BatchResponse> updateBatchStatus(
            @PathVariable UUID batchId,
            @RequestParam("status") BatchStatus newStatus) {

        return ApiResponse.<BatchResponse>builder()
                .code(1000)
                .message("Cập nhật trạng thái lô hàng thành công")
                .body(batchService.updateBatchStatus(batchId, newStatus))
                .build();
    }

    // Blockchain confirmation — any admin of the owning org
    @PostMapping("/{batchId}/blockchain-anchor")
    @PreAuthorize("hasAnyRole('ORG_ADMIN', 'FARM_ADMIN', 'TRANSPORT_ADMIN', 'RETAIL_ADMIN')")
    public ApiResponse<BatchResponse> confirmBlockchainAnchor(
            @PathVariable UUID batchId,
            @RequestBody @Valid BlockchainAnchorConfirmRequest request) {

        return ApiResponse.<BatchResponse>builder()
                .code(1000)
                .message("Xác nhận giao dịch blockchain thành công")
                .body(batchService.confirmBlockchainAnchor(batchId, request))
                .build();
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ORG_ADMIN', 'FARM_ADMIN', 'TRANSPORT_ADMIN', 'RETAIL_ADMIN', 'STAFF')")
    public ApiResponse<List<BatchResponse>> getBatches() {
        return ApiResponse.<List<BatchResponse>>builder()
                .code(1000)
                .message("Lấy danh sách lô hàng thành công")
                .body(batchService.getBatchesByOrgId())
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
