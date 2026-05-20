package BlockchainAgridence.uet.modules.traceability.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Data
public class ProductRequest {

    private UUID categoryId; // Có thể null nếu chưa phân loại

    @NotBlank(message = "PRODUCT_NAME_BLANK")
    private String name;

    private String description;

    @NotBlank(message = "PRODUCT_SKU_BLANK")
    private String skuCode;

    // Danh sách mã CID của ảnh đã up lên IPFS
    private List<String> imageCids;

    // Các thuộc tính động (Ví dụ: {"thành_phần": "100% hữu cơ", "hsd": "6 tháng"})
    private Map<String, Object> attributes;
}
