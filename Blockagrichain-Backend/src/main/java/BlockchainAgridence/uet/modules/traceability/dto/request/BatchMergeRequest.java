package BlockchainAgridence.uet.modules.traceability.dto.request;

import BlockchainAgridence.uet.modules.traceability.entity.ProductType;
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
public class BatchMergeRequest {

    @NotBlank(message = "BATCH_CODE_BLANK")
    private String newBatchCode;

    @NotNull(message = "PRODUCT_ID_NULL")
    private UUID newProductId;

    @NotNull(message = "PRODUCT_TYPE_NULL")
    private ProductType productType;

    @NotNull(message = "PRODUCED_QUANTITY_NULL")
    @Positive(message = "PRODUCED_QUANTITY_INVALID")
    private BigDecimal producedQuantity;

    @NotNull(message = "UNIT_ID_NULL")
    private UUID unitId;

    @NotEmpty(message = "MERGE_PARENTS_EMPTY")
    @Valid
    private List<ParentUsageRequest> parents;

    @Data
    public static class ParentUsageRequest {
        @NotNull(message = "MERGE_PARENT_ID_NULL")
        private UUID batchId;

        @NotNull(message = "MERGE_PARENT_QUANTITY_NULL")
        @Positive(message = "MERGE_PARENT_QUANTITY_INVALID")
        private BigDecimal quantityUsed;
    }
}

