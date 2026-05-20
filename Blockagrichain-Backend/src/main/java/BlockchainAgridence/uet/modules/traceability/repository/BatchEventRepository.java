package BlockchainAgridence.uet.modules.traceability.repository;

import BlockchainAgridence.uet.modules.traceability.entity.BatchEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface BatchEventRepository extends JpaRepository<BatchEvent, UUID> {

    // Lấy toàn bộ timeline của một lô hàng, sắp xếp mới nhất lên đầu
    List<BatchEvent> findAllByBatchIdOrderByCreatedAtDesc(UUID batchId);
}
