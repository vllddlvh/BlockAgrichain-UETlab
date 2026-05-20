package BlockchainAgridence.uet.modules.identity.dto.response;

import BlockchainAgridence.uet.modules.identity.entity.OrgStatus;
import BlockchainAgridence.uet.modules.identity.entity.OrgType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrgResponse {
    private UUID id;
    private String orgWalletAddress;
    private String name;
    private String taxCode;
    private String representativeName;
    private java.util.List<OrgDocumentResponse> documents;
    private String addressDetail;
    private OrgType orgType;
    private OrgStatus status;
    private Integer reputationScore;
    private LocalDateTime createdAt;
}