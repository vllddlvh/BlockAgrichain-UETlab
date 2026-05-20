package BlockchainAgridence.uet.modules.traceability.dto.request;

import BlockchainAgridence.uet.modules.traceability.entity.EventType;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
public class BatchEventRequest {

    @NotNull(message = "EVENT_TYPE_NULL")
    private EventType eventType;

    // Tọa độ GPS (Tùy chọn, thiết bị di động có thể gửi lên)
    private BigDecimal gpsLatitude;
    private BigDecimal gpsLongitude;
    private String deviceInfo;

    // Ảnh bằng chứng hiện trường (CID từ IPFS)
    private List<String> imageCids;

    // Dữ liệu động (Nhiệt độ, độ ẩm, phân bón, khối lượng...)
    private Map<String, Object> metadata;
}