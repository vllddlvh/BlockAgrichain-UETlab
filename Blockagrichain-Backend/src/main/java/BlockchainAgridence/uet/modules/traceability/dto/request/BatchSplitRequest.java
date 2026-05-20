package BlockchainAgridence.uet.modules.traceability.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Data
public class BatchSplitRequest {

    @NotNull(message = "SPLIT_PARENT_ID_NULL")
    private UUID parentBatchId;

    @NotEmpty(message = "SPLIT_CHILDREN_EMPTY")
    @Valid
    private List<ChildBatchRequest> children;

    @Data
    public static class ChildBatchRequest {
        @NotBlank(message = "BATCH_CODE_BLANK")
        private String newBatchCode;

        @NotNull(message = "TARGET_ORG_ID_NULL")
        private UUID targetOrgId;

        @NotNull(message = "SPLIT_CHILD_QUANTITY_NULL")
        @Positive(message = "SPLIT_CHILD_QUANTITY_INVALID")
        private BigDecimal quantity;
    }
}

