package BlockchainAgridence.uet.modules.traceability.dto.response;

import BlockchainAgridence.uet.modules.traceability.entity.LineageActionType;
import lombok.*;

import java.math.BigDecimal;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LineageEdgeResponse {
    private UUID from;
    private UUID to;
    private LineageActionType action;
    private BigDecimal quantity;
}
