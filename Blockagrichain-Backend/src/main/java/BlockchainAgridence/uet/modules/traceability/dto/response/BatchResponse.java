package BlockchainAgridence.uet.modules.traceability.dto.response;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class BatchResponse {
    private UUID id;
    private String batchCode;

    // Chỉ trả về các thông tin cần thiết, không trả nguyên cục Entity Product/Organization
    private UUID productId;
    private String productName;
    private String creatorOrgName;
    private String currentOwnerOrgName;

    private String productType;
    private String status;
    private Boolean isActive;
    private LocalDateTime createdAt;

    private BigDecimal initialQuantity;
    private BigDecimal currentQuantity;
    private UUID unitId;
    private String unitCode;
}