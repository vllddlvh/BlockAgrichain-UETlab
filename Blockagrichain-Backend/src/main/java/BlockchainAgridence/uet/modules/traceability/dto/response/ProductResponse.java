package BlockchainAgridence.uet.modules.traceability.dto.response;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Data
public class ProductResponse {
    private UUID id;
    private UUID orgId; // Để Client biết sản phẩm này thuộc tổ chức nào
    private UUID categoryId;
    private String name;
    private String description;
    private String skuCode;
    private List<String> imageCids;
    private Map<String, Object> attributes;

    // Audit fields
    private String createdBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
