package BlockchainAgridence.uet.modules.traceability.repository;

import BlockchainAgridence.uet.modules.traceability.entity.BatchLineage;
import BlockchainAgridence.uet.modules.traceability.entity.BatchLineageId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Repository
public interface BatchLineageRepository extends JpaRepository<BatchLineage, BatchLineageId> {

    @Query(value = """
            WITH RECURSIVE lineage AS (
                SELECT parent_batch_id, child_batch_id, action_type, quantity
                FROM batch_lineage
                WHERE child_batch_id = :batchId
                UNION ALL
                SELECT bl.parent_batch_id, bl.child_batch_id, bl.action_type, bl.quantity
                FROM batch_lineage bl
                JOIN lineage l ON bl.child_batch_id = l.parent_batch_id
            )
            SELECT parent_batch_id AS parentBatchId,
                   child_batch_id AS childBatchId,
                   action_type AS actionType,
                   quantity AS quantity
            FROM lineage
            """, nativeQuery = true)
    List<LineageEdgeRow> findUpstreamLineage(@Param("batchId") UUID batchId);

    interface LineageEdgeRow {
        UUID getParentBatchId();
        UUID getChildBatchId();
        String getActionType();
        BigDecimal getQuantity();
    }
}

