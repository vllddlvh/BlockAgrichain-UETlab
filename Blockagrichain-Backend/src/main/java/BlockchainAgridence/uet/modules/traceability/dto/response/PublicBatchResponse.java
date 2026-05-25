package BlockchainAgridence.uet.modules.traceability.dto.response;

import BlockchainAgridence.uet.modules.traceability.entity.BatchStatus;
import BlockchainAgridence.uet.modules.traceability.entity.ProductType;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PublicBatchResponse {
    private UUID id;
    private String batchCode;
    private String productName;
    private String organizationName;
    private ProductType productType;
    private BatchStatus status;
    private LocalDate expiryDate;
    private BigDecimal currentQuantity;
    private String unitCode;
    private String riskStatus;
    private List<String> riskReasons;
    private String riskRecommendation;
    private String onchainHash;
    private String computedHash;
    private Boolean blockchainVerified;
    private String blockchainTxHash;
}
