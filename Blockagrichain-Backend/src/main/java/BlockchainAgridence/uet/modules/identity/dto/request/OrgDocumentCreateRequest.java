package BlockchainAgridence.uet.modules.identity.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDate;

@Data
public class OrgDocumentCreateRequest {

    @NotBlank(message = "DOCUMENT_TYPE_BLANK")
    private String documentType;

    @NotBlank(message = "DOCUMENT_NAME_BLANK")
    private String documentName;

    @NotBlank(message = "CID_BLANK")
    private String cid;

    private LocalDate expirationDate;
}
