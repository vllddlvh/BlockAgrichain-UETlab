package BlockchainAgridence.uet.modules.traceability.dto.response;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Data
public class BatchEventResponse {
    private UUID id;
    private UUID batchId;

    // Trả về email người thao tác thay vì cả một Object User khổng lồ
    private String actorEmail;

    private String eventType;
    private BigDecimal gpsLatitude;
    private BigDecimal gpsLongitude;
    private String deviceInfo;
    private List<String> imageCids;
    private Map<String, Object> metadata;
    private LocalDateTime createdAt;
}