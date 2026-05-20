package BlockchainAgridence.uet.modules.traceability.dto.response;

import lombok.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TraceabilityResponse {
    private UUID scannedBatchId;
    private Map<UUID, PublicBatchResponse> batches;
    private List<LineageEdgeResponse> lineage;
    private List<PublicEventResponse> events;
}
