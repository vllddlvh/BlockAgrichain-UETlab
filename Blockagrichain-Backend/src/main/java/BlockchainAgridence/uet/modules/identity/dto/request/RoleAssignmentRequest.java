package BlockchainAgridence.uet.modules.identity.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.Set;

@Data
public class RoleAssignmentRequest {

    @NotEmpty(message = "ROLE_LIST_EMPTY")
    private Set<@NotBlank(message = "ROLE_CODE_BLANK") String> roleCodes;
}