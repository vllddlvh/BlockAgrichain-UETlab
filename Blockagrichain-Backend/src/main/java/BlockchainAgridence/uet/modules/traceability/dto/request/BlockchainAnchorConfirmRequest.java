package BlockchainAgridence.uet.modules.traceability.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class BlockchainAnchorConfirmRequest {

    @NotBlank(message = "txHash không được để trống")
    @Pattern(regexp = "^0x[0-9a-fA-F]{64}$", message = "txHash phải là chuỗi hex 32 bytes bắt đầu bằng 0x")
    private String txHash;

    @NotBlank(message = "dataHash không được để trống")
    @Pattern(regexp = "^0x[0-9a-fA-F]{64}$", message = "dataHash phải là chuỗi hex 32 bytes bắt đầu bằng 0x")
    private String dataHash;
}
