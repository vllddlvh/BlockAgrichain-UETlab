package BlockchainAgridence.uet.modules.traceability.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "batch_lineage")
@EntityListeners(AuditingEntityListener.class)
@Builder
public class BatchLineage {

    @EmbeddedId
    private BatchLineageId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("parentBatchId")
    @JoinColumn(name = "parent_batch_id", nullable = false, updatable = false)
    private Batch parentBatch;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("childBatchId")
    @JoinColumn(name = "child_batch_id", nullable = false, updatable = false)
    private Batch childBatch;

    @Enumerated(EnumType.STRING)
    @Column(name = "action_type", nullable = false, length = 50, updatable = false)
    private LineageActionType actionType;

    @Column(name = "quantity", nullable = false, precision = 18, scale = 3, updatable = false)
    private BigDecimal quantity;

    @Column(name = "created_at", updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
