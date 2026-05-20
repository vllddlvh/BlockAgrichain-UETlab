package BlockchainAgridence.uet.modules.traceability.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.*;

import java.io.Serializable;
import java.util.Objects;
import java.util.UUID;

/**
 * Lớp định nghĩa Khóa chính kép (Composite Key) cho bảng phả hệ
 */
@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BatchLineageId implements Serializable {

    @Column(name = "parent_batch_id")
    private UUID parentBatchId;

    @Column(name = "child_batch_id")
    private UUID childBatchId;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        BatchLineageId that = (BatchLineageId) o;
        return Objects.equals(parentBatchId, that.parentBatchId) &&
               Objects.equals(childBatchId, that.childBatchId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(parentBatchId, childBatchId);
    }
}
