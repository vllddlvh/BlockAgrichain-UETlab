package BlockchainAgridence.uet.modules.traceability.dto.response;

import lombok.Data;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Data
public class BatchTraceabilityNodeResponse {
    private UUID batchId;
    private String batchCode;
    private String productName;
    private BigDecimal initialQuantity;
    private BigDecimal currentQuantity;
    private String unitCode;
    private String actionType;
    private BigDecimal lineageQuantity;
    private List<BatchTraceabilityNodeResponse> parents = new ArrayList<>();
}

