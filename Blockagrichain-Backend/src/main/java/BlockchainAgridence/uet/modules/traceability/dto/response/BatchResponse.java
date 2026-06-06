package BlockchainAgridence.uet.modules.traceability.dto.response;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
public class BatchResponse {
    private UUID id;
    private String batchCode;

    // Chỉ trả về các thông tin cần thiết, không trả nguyên cục Entity Product/Organization
    private UUID productId;
    private String productName;
    private String skuCode;
    private String productDescription;
    private List<String> productImageCids;
    private java.util.Map<String, Object> productAttributes;
    private String creatorOrgName;
    private UUID creatorOrgId;
    private String currentOwnerOrgName;
    private UUID currentOwnerOrgId;

    private String productType;
    private String status;
    private Boolean isActive;
    private LocalDateTime createdAt;

    private BigDecimal initialQuantity;
    private BigDecimal currentQuantity;
    private UUID unitId;
    private String unitCode;

    private LocalDate expiryDate;
    private String riskStatus;
    private List<String> riskReasons;
    private String riskRecommendation;

    // Computed hash returned to the FE for blockchain anchoring; not stored in DB.
    private String onchainHash;
    private String blockchainTxHash;
    private String blockchainDataHash;
    private LocalDateTime blockchainAnchoredAt;
}
