// File: src/main/java/BlockchainAgridence/uet/modules/identity/entity/Organization.java
package BlockchainAgridence.uet.modules.identity.entity;


import BlockchainAgridence.uet.shared.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "organizations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@SQLDelete(sql = "UPDATE organizations SET is_deleted = true WHERE id = ? AND version = ?")
@SQLRestriction("is_deleted = false")
public class Organization extends BaseEntity {

    @Column(name = "org_wallet_address", nullable = false, unique = true, length = 42)
    private String orgWalletAddress;

    @Column(nullable = false)
    private String name;

    @Column(name = "tax_code", length = 50)
    private String taxCode;

    @Column(name = "representative_name")
    private String representativeName;

    @OneToMany(mappedBy = "organization", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<OrganizationDocument> documents = new ArrayList<>();

    @Column(name = "address_detail", columnDefinition = "TEXT")
    private String addressDetail;

    @Enumerated(EnumType.STRING)
    @Column(name = "org_type", nullable = false, length = 50)
    private OrgType orgType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    @Builder.Default
    private OrgStatus status = OrgStatus.PENDING;

    @Column(name = "reputation_score")
    @Builder.Default
    private Integer reputationScore = 100;

    // Hàm tiện ích để thêm document vào tổ chức một cách an toàn
    public void addDocument(OrganizationDocument document) {
        documents.add(document);
        document.setOrganization(this);
    }
}