package BlockchainAgridence.uet.modules.traceability.repository;

import BlockchainAgridence.uet.modules.traceability.entity.Batch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface TraceabilityRepository extends JpaRepository<Batch, UUID> {

    @Query(value = """
            WITH RECURSIVE lineage_tree AS (
                -- Tầng 0: Lô hàng được quét QR
                SELECT id as batch_id, 0 as level
                FROM batches
                WHERE batch_code = :batchCode
            
                UNION ALL
            
                -- Đệ quy tìm ngược lên (Bottom-Up) để lấy cha
                SELECT bl.parent_batch_id as batch_id, lt.level + 1 as level
                FROM batch_lineage bl
                JOIN lineage_tree lt ON bl.child_batch_id = lt.batch_id
                WHERE lt.level < 20
            )
            SELECT DISTINCT batch_id FROM lineage_tree;
            """, nativeQuery = true)
    List<UUID> findAllAncestorBatchIds(@Param("batchCode") String batchCode);
}
