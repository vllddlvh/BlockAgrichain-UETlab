package BlockchainAgridence.uet.modules.traceability.dto.response;

import BlockchainAgridence.uet.modules.traceability.entity.EventType;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PublicEventResponse {
    private UUID batchId;
    private EventType eventType;
    private String actorName; // Sanitized: instead of email or ID
    private BigDecimal gpsLatitude;
    private BigDecimal gpsLongitude;
    private List<String> imageCids;
    private Map<String, Object> metadata;
    private LocalDateTime createdAt;
}
