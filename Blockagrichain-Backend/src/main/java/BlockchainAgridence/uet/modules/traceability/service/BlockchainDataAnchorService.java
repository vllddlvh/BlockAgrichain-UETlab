package BlockchainAgridence.uet.modules.traceability.service;

import BlockchainAgridence.uet.modules.traceability.entity.Batch;
import BlockchainAgridence.uet.modules.traceability.entity.BatchEvent;
import BlockchainAgridence.uet.modules.traceability.repository.BatchEventRepository;
import com.fasterxml.jackson.databind.MapperFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class BlockchainDataAnchorService {

    BatchEventRepository batchEventRepository;

    private static final ObjectMapper HASH_MAPPER = new ObjectMapper();

    static {
        // Cực kỳ quan trọng để đảm bảo JSON deterministic
        HASH_MAPPER.configure(MapperFeature.SORT_PROPERTIES_ALPHABETICALLY, true);
        HASH_MAPPER.configure(SerializationFeature.ORDER_MAP_ENTRIES_BY_KEYS, true);
        HASH_MAPPER.registerModule(new JavaTimeModule());
        HASH_MAPPER.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
    }

    @Getter @Setter
    public static class AnchorPayload {
        private String batchCode;
        private String productType;
        private String productName;
        private String creatorOrgName;
        private String initialQuantity;
        private String currentQuantity;
        private String unitCode;
        private List<AnchorEventPayload> events;
    }

    @Getter @Setter
    public static class AnchorEventPayload {
        private String eventType;
        private String actorEmail;
        private String gpsLatitude;
        private String gpsLongitude;
        private List<String> imageCids;
        private Map<String, Object> metadata;
        private String createdAt;
    }

    @Transactional(readOnly = true)
    public String anchorBatchData(Batch batch) {
        try {
            // Lấy toàn bộ sự kiện của lô hàng
            List<BatchEvent> events = batchEventRepository.findAllByBatchIdOrderByCreatedAtDesc(batch.getId());

            AnchorPayload payload = new AnchorPayload();
            payload.setBatchCode(batch.getBatchCode());
            payload.setProductType(batch.getProductType() != null ? batch.getProductType().name() : null);
            payload.setProductName(batch.getProduct() != null ? batch.getProduct().getName() : null);
            payload.setCreatorOrgName(batch.getCreatorOrg() != null ? batch.getCreatorOrg().getName() : null);
            payload.setInitialQuantity(batch.getInitialQuantity() != null ? batch.getInitialQuantity().toPlainString() : null);
            payload.setCurrentQuantity(batch.getCurrentQuantity() != null ? batch.getCurrentQuantity().toPlainString() : null);
            payload.setUnitCode(batch.getUnit() != null ? batch.getUnit().getCode() : null);

            List<AnchorEventPayload> eventPayloads = events.stream().map(e -> {
                AnchorEventPayload ep = new AnchorEventPayload();
                ep.setEventType(e.getEventType() != null ? e.getEventType().name() : null);
                // Loại bỏ ID động, chỉ giữ lại email của người thực hiện
                ep.setActorEmail(e.getCreatedBy());
                ep.setGpsLatitude(e.getGpsLatitude() != null ? e.getGpsLatitude().toPlainString() : null);
                ep.setGpsLongitude(e.getGpsLongitude() != null ? e.getGpsLongitude().toPlainString() : null);
                ep.setImageCids(e.getImageCids());
                ep.setMetadata(e.getMetadata());
                ep.setCreatedAt(e.getCreatedAt() != null ? e.getCreatedAt().toString() : null);
                return ep;
            }).collect(Collectors.toList());

            payload.setEvents(eventPayloads);

            // Serialize Object thành Canonical JSON
            String canonicalJson = HASH_MAPPER.writeValueAsString(payload);
            // Loại bỏ khoảng trắng thủ công nếu cần để cực đoan hơn (nhưng Jackson không pretty print thì đã là tối giản)
            // canonicalJson = canonicalJson.replaceAll("\\s+", ""); // Tuy nhiên có thể hỏng giá trị chuỗi bên trong.
            
            log.debug("Canonical JSON for Batch [{}]: {}", batch.getBatchCode(), canonicalJson);

            // Băm dữ liệu SHA-256
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashBytes = digest.digest(canonicalJson.getBytes(StandardCharsets.UTF_8));
            
            // Chuyển sang chuỗi Hex
            StringBuilder hexString = new StringBuilder(2 * hashBytes.length);
            for (byte b : hashBytes) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) {
                    hexString.append('0');
                }
                hexString.append(hex);
            }
            
            String hashStr = "0x" + hexString.toString();

            log.info("Đã tính hash neo blockchain cho lô hàng [{}]. Hash: {}", batch.getBatchCode(), hashStr);
            return hashStr;
        } catch (NoSuchAlgorithmException e) {
            log.error("Lỗi thuật toán Hashing", e);
            throw new RuntimeException("SHA-256 algorithm not found", e);
        } catch (Exception e) {
            log.error("Lỗi khi Anchor Data cho Batch " + batch.getBatchCode(), e);
            throw new RuntimeException("Error anchoring batch data", e);
        }
    }
}
