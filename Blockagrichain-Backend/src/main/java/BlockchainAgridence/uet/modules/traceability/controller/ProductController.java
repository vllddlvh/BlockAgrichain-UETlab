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
//    @PreAuthorize("hasRole('ORG_ADMIN')") // Chỉ Admin của tổ chức mới được tạo danh mục
    public ApiResponse<ProductResponse> createProduct(
            @RequestBody @Valid ProductRequest request) {

        return ApiResponse.<ProductResponse>builder()
                .code(1000)
                .message("Tạo sản phẩm thành công")
                .body(productService.createProduct(request))
                .build();
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ORG_ADMIN', 'WAREHOUSE_STAFF')") // Nhân viên kho cũng được xem để chọn lúc tạo lô hàng
    public ApiResponse<List<ProductResponse>> getProducts() {

        return ApiResponse.<List<ProductResponse>>builder()
                .code(1000)
                .body(productService.getProductsByOrgId())
                .build();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ORG_ADMIN', 'WAREHOUSE_STAFF')")
    public ApiResponse<ProductResponse> getProductDetail(
            @PathVariable UUID id) {

        return ApiResponse.<ProductResponse>builder()
                .code(1000)
                .body(productService.getProductByIdAndOrgId(id))
                .build();
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ORG_ADMIN')")
    public ApiResponse<ProductResponse> updateProduct(
            @PathVariable UUID id,
            @RequestBody @Valid ProductRequest request) {

        return ApiResponse.<ProductResponse>builder()
                .code(1000)
                .message("Cập nhật sản phẩm thành công")
                .body(productService.updateProduct(id, request))
                .build();
    }
}
