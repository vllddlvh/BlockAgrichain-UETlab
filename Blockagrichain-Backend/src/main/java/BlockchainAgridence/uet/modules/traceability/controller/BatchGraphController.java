package BlockchainAgridence.uet.modules.traceability.controller;

import BlockchainAgridence.uet.modules.traceability.dto.request.BatchMergeRequest;
import BlockchainAgridence.uet.modules.traceability.dto.request.BatchSplitRequest;
import BlockchainAgridence.uet.modules.traceability.dto.response.BatchResponse;
import BlockchainAgridence.uet.modules.traceability.dto.response.BatchTraceabilityNodeResponse;
import BlockchainAgridence.uet.modules.traceability.service.BatchGraphService;
import BlockchainAgridence.uet.shared.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class BatchGraphController {

    private final BatchGraphService batchGraphService;

    @PostMapping("/batches/merge")
    @PreAuthorize("hasAuthority('BATCH_UPDATE')")
    public ApiResponse<BatchResponse> mergeBatches(
            @RequestBody @Valid BatchMergeRequest request) {

        return ApiResponse.<BatchResponse>builder()
                .code(1000)
                .message("Gộp lô hàng thành công")
                .body(batchGraphService.mergeBatches(request))
                .build();
    }

    @PostMapping("/batches/split")
    @PreAuthorize("hasAuthority('BATCH_UPDATE')")
    public ApiResponse<List<BatchResponse>> splitBatch(
            @RequestBody @Valid BatchSplitRequest request) {

        return ApiResponse.<List<BatchResponse>>builder()
                .code(1000)
                .message("Tách lô hàng thành công")
                .body(batchGraphService.splitBatch(request))
                .build();
    }

    @GetMapping("/traceability/{batchId}/tree")
    public ApiResponse<BatchTraceabilityNodeResponse> getTraceabilityTree(@PathVariable UUID batchId) {
        return ApiResponse.<BatchTraceabilityNodeResponse>builder()
                .code(1000)
                .message("Lấy cây truy xuất thành công")
                .body(batchGraphService.getTraceabilityTree(batchId))
                .build();
    }
}

