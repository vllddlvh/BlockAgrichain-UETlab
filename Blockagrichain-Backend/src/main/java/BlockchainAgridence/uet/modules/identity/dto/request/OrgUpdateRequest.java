package BlockchainAgridence.uet.modules.identity.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class OrgUpdateRequest {

    @NotBlank(message = "ORG_NAME_BLANK")
    private String name;

    private String taxCode;

    private String representativeName;

    private String addressDetail;

}