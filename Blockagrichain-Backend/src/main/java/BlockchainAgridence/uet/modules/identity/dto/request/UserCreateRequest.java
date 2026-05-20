package BlockchainAgridence.uet.modules.identity.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.Set;

@Data
public class UserCreateRequest {

    @NotBlank(message = "EMAIL_BLANK")
    @Email(message = "INVALID_EMAIL_FORMAT")
    private String email;

    @NotBlank(message = "PASSWORD_BLANK")
    private String password;

    @NotBlank(message = "FULLNAME_BLANK")
    private String fullName;

    private Set<@NotBlank(message = "ROLE_CODE_BLANK") String> roleCodes;
}