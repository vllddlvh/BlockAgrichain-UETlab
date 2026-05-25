package BlockchainAgridence.uet.modules.traceability.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class BatchTransferRequest {
    @NotNull(message = "TARGET_ORG_ID_NULL")
    private UUID targetOrgId;
}
