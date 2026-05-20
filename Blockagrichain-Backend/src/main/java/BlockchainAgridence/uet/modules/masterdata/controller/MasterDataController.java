package BlockchainAgridence.uet.modules.masterdata.controller;

import BlockchainAgridence.uet.shared.ApiResponse;
import BlockchainAgridence.uet.modules.masterdata.entity.MasterProductCategory;
import BlockchainAgridence.uet.modules.masterdata.entity.MasterUnit;
import BlockchainAgridence.uet.modules.masterdata.service.MasterDataService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/master")
@RequiredArgsConstructor
public class MasterDataController {

    private final MasterDataService masterDataService;

    @GetMapping("/categories")
    public ApiResponse<List<MasterProductCategory>> getCategories() {
        return ApiResponse.<List<MasterProductCategory>>builder()
                .code(1000)
                .message("Lấy danh mục loại sản phẩm thành công")
                .body(masterDataService.getAllCategories())
                .build();
    }

    @GetMapping("/units")
    public ApiResponse<List<MasterUnit>> getUnits() {
        return ApiResponse.<List<MasterUnit>>builder()
                .code(1000)
                .message("Lấy danh mục đơn vị tính thành công")
                .body(masterDataService.getAllUnits())
                .build();
    }
}