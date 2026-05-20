package BlockchainAgridence.uet.modules.traceability.controller;

import BlockchainAgridence.uet.modules.traceability.dto.response.TraceabilityResponse;
import BlockchainAgridence.uet.modules.traceability.service.PublicTraceabilityService;
import BlockchainAgridence.uet.shared.ApiResponse;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/public/traceability")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class PublicTraceabilityController {

    PublicTraceabilityService publicTraceabilityService;

    @GetMapping("/{qrCode}")
    public ResponseEntity<ApiResponse<TraceabilityResponse>> getTraceabilityData(@PathVariable("qrCode") String qrCode) {
        TraceabilityResponse response = publicTraceabilityService.getTraceabilityData(qrCode);
        return ResponseEntity.ok(ApiResponse.<TraceabilityResponse>builder()
                .code(1000)
                .message("Lấy dữ liệu truy xuất nguồn gốc thành công")
                .body(response)
                .build());
    }
}
