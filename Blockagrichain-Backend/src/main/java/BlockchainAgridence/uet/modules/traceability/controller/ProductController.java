package BlockchainAgridence.uet.modules.traceability.controller;


import BlockchainAgridence.uet.modules.traceability.dto.request.ProductRequest;
import BlockchainAgridence.uet.modules.traceability.dto.response.ProductResponse;
import BlockchainAgridence.uet.modules.traceability.service.ProductService;
import BlockchainAgridence.uet.shared.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @PostMapping
    // @PreAuthorize("hasAnyRole('ORG_ADMIN', 'FARM_ADMIN', 'TRANSPORT_ADMIN', 'RETAIL_ADMIN')")
    public ApiResponse<ProductResponse> createProduct(
            @RequestBody @Valid ProductRequest request) {

        return ApiResponse.<ProductResponse>builder()
                .code(1000)
                .message("Tạo sản phẩm thành công")
                .body(productService.createProduct(request))
                .build();
    }

    @GetMapping
    // @PreAuthorize("hasAnyRole('ORG_ADMIN', 'FARM_ADMIN', 'TRANSPORT_ADMIN', 'RETAIL_ADMIN', 'WAREHOUSE_STAFF')")
    public ApiResponse<List<ProductResponse>> getProducts() {

        return ApiResponse.<List<ProductResponse>>builder()
                .code(1000)
                .body(productService.getProductsByOrgId())
                .build();
    }

    @GetMapping("/{id}")
    // @PreAuthorize("hasAnyRole('ORG_ADMIN', 'FARM_ADMIN', 'TRANSPORT_ADMIN', 'RETAIL_ADMIN', 'WAREHOUSE_STAFF')")
    public ApiResponse<ProductResponse> getProductDetail(
            @PathVariable UUID id) {

        return ApiResponse.<ProductResponse>builder()
                .code(1000)
                .body(productService.getProductByIdAndOrgId(id))
                .build();
    }

    @PutMapping("/{id}")
    // @PreAuthorize("hasAnyRole('ORG_ADMIN', 'FARM_ADMIN', 'TRANSPORT_ADMIN', 'RETAIL_ADMIN')")
    public ApiResponse<ProductResponse> updateProduct(
            @PathVariable UUID id,
            @RequestBody @Valid ProductRequest request) {

        return ApiResponse.<ProductResponse>builder()
                .code(1000)
                .message("Cập nhật sản phẩm thành công")
                .body(productService.updateProduct(id, request))
                .build();
    }

    @PatchMapping("/{id}/status")
    // @PreAuthorize("hasAnyRole('ORG_ADMIN', 'FARM_ADMIN', 'TRANSPORT_ADMIN', 'RETAIL_ADMIN')")
    public ApiResponse<ProductResponse> toggleProductStatus(@PathVariable UUID id) {
        return ApiResponse.<ProductResponse>builder()
                .code(1000)
                .message("Đổi trạng thái sản phẩm thành công")
                .body(productService.toggleProductStatus(id))
                .build();
    }
}
