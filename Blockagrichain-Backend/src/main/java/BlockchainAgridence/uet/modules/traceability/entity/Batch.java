package BlockchainAgridence.uet.modules.traceability.entity;

import BlockchainAgridence.uet.modules.identity.entity.Organization;
import BlockchainAgridence.uet.modules.masterdata.entity.MasterProductCategory;
import BlockchainAgridence.uet.modules.masterdata.entity.MasterUnit;
import BlockchainAgridence.uet.shared.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Builder
@Table(name = "batches")
public class Batch extends BaseEntity {

    @Column(name = "batch_code", unique = true, nullable = false, length = 100)
    private String batchCode;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "creator_org_id", nullable = false)
    private Organization creatorOrg;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "current_owner_org_id", nullable = false)
    private Organization currentOwnerOrg;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_category_id")
    private MasterProductCategory productCategory;

    @Enumerated(EnumType.STRING)
    @Column(name = "product_type", nullable = false, length = 50)
    private ProductType productType;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 50)
    private BatchStatus status;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @Column(name = "onchain_hash", length = 255)
    private String onchainHash;

    @Column(name = "initial_quantity", nullable = false, precision = 18, scale = 3)
    private BigDecimal initialQuantity;

    @Column(name = "current_quantity", nullable = false, precision = 18, scale = 3)
    private BigDecimal currentQuantity;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "unit_id")
    private MasterUnit unit;
}
