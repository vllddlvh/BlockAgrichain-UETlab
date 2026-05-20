package BlockchainAgridence.uet.modules.identity.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;

@Data
public class RoleCreateRequest {

    @NotBlank(message = "ROLE_CODE_BLANK")
    private String code;

    @NotBlank(message = "ROLE_NAME_BLANK")
    private String name;

    private String description;

    @NotEmpty(message = "PERMISSION_LIST_EMPTY")
    private List<String> permissionCodes;
}