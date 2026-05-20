package BlockchainAgridence.uet.modules.traceability.repository;

import BlockchainAgridence.uet.modules.traceability.entity.Batch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface BatchRepository extends JpaRepository<Batch, UUID> {

    // Tìm lô hàng bằng mã in trên tem QR
    Optional<Batch> findByBatchCode(String batchCode);

    // Lấy danh sách lô hàng đang sở hữu bởi 1 tổ chức
    List<Batch> findAllByCurrentOwnerOrgId(UUID orgId);

    boolean existsByBatchCode(String batchCode);
}