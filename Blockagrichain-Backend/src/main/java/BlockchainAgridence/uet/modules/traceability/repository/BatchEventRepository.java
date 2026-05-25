package BlockchainAgridence.uet.modules.traceability.repository;

import BlockchainAgridence.uet.modules.traceability.entity.BatchEvent;
import BlockchainAgridence.uet.modules.traceability.entity.EventType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface BatchEventRepository extends JpaRepository<BatchEvent, UUID> {

    // Lấy toàn bộ timeline của một lô hàng, sắp xếp mới nhất lên đầu
    List<BatchEvent> findAllByBatchIdOrderByCreatedAtDesc(UUID batchId);

    List<BatchEvent> findAllByBatchIdIn(List<UUID> batchIds);

    Optional<BatchEvent> findFirstByBatchIdAndEventTypeOrderByCreatedAtDesc(UUID batchId, EventType eventType);
}
