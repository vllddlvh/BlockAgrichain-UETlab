package BlockchainAgridence.uet.modules.traceability.service;

import BlockchainAgridence.uet.modules.traceability.entity.Batch;
import BlockchainAgridence.uet.modules.traceability.entity.BatchEvent;
import BlockchainAgridence.uet.modules.traceability.entity.BatchStatus;
import BlockchainAgridence.uet.modules.traceability.entity.EventType;
import BlockchainAgridence.uet.modules.traceability.entity.RiskStatus;
import BlockchainAgridence.uet.modules.traceability.repository.BatchEventRepository;
import lombok.Builder;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BatchRiskService {

    private static final long EXPIRY_WARNING_DAYS = 2;
    private static final long MAX_TRANSIT_DAYS = 2;

    private final BatchEventRepository batchEventRepository;

    public RiskResult evaluate(Batch batch) {
        LocalDate today = LocalDate.now();
        List<String> reasons = new ArrayList<>();

        if (batch.getStatus() == BatchStatus.EXPIRED ||
                (batch.getExpiryDate() != null && batch.getExpiryDate().isBefore(today))) {
            reasons.add("Lô hàng đã quá hạn sử dụng hoặc đang ở trạng thái EXPIRED.");
            return RiskResult.builder()
                    .riskStatus(RiskStatus.EXPIRED)
                    .riskReasons(reasons)
                    .riskRecommendation("Không tiếp tục phân phối. Cần kiểm tra chất lượng và xử lý theo quy trình an toàn.")
                    .build();
        }

        if (batch.getExpiryDate() != null) {
            long daysToExpiry = ChronoUnit.DAYS.between(today, batch.getExpiryDate());
            boolean stillActive = batch.getStatus() != BatchStatus.DELIVERED
                    && batch.getStatus() != BatchStatus.DEPLETED;
            if (daysToExpiry <= EXPIRY_WARNING_DAYS && stillActive) {
                reasons.add("Lô hàng còn " + daysToExpiry + " ngày đến hạn sử dụng và chưa kết thúc vòng đời.");
            }
        }

        if (batch.getStatus() == BatchStatus.IN_TRANSIT) {
            batchEventRepository.findFirstByBatchIdAndEventTypeOrderByCreatedAtDesc(batch.getId(), EventType.TRANSPORTING)
                    .map(BatchEvent::getCreatedAt)
                    .ifPresent(transportStartedAt -> addTransitRiskReason(reasons, transportStartedAt));
        }

        if (!reasons.isEmpty()) {
            return RiskResult.builder()
                    .riskStatus(RiskStatus.AT_RISK)
                    .riskReasons(reasons)
                    .riskRecommendation("Nên kiểm tra vị trí, điều kiện bảo quản và xác nhận bước tiếp theo sớm.")
                    .build();
        }

        return RiskResult.builder()
                .riskStatus(RiskStatus.SAFE)
                .riskReasons(List.of("Chưa phát hiện rủi ro theo hạn sử dụng, trạng thái và thời gian vận chuyển."))
                .riskRecommendation("Tiếp tục theo dõi vòng đời lô hàng theo quy trình hiện tại.")
                .build();
    }

    private void addTransitRiskReason(List<String> reasons, LocalDateTime transportStartedAt) {
        long transitDays = ChronoUnit.DAYS.between(transportStartedAt, LocalDateTime.now());
        if (transitDays > MAX_TRANSIT_DAYS) {
            reasons.add("Lô hàng đang IN_TRANSIT hơn " + MAX_TRANSIT_DAYS + " ngày kể từ sự kiện vận chuyển gần nhất.");
        }
    }

    @Getter
    @Builder
    public static class RiskResult {
        private RiskStatus riskStatus;
        private List<String> riskReasons;
        private String riskRecommendation;
    }
}
