package BlockchainAgridence.uet.modules.identity.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrgDocumentResponse {
    private UUID id;
    private String documentType;
    private String documentName;
    private String cid;
    private LocalDate expirationDate;
}
