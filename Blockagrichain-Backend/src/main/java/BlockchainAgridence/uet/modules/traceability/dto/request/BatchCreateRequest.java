package BlockchainAgridence.uet.modules.traceability.dto.request;

import BlockchainAgridence.uet.modules.traceability.entity.ProductType;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
public class BatchCreateRequest {

    @NotBlank(message = "BATCH_CODE_BLANK")
    private String batchCode;

    @NotNull(message = "PRODUCT_ID_NULL")
    private UUID productId;

    @NotNull(message = "PRODUCT_TYPE_NULL")
    private ProductType productType;

    @NotNull(message = "INITIAL_QUANTITY_NULL")
    @Positive(message = "INITIAL_QUANTITY_INVALID")
    private BigDecimal initialQuantity;

    @NotNull(message = "UNIT_ID_NULL")
    private UUID unitId;

    @FutureOrPresent(message = "Ngày hết hạn phải là hôm nay hoặc trong tương lai")
    private LocalDate expiryDate;
}
