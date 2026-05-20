package BlockchainAgridence.uet.modules.identity.repository;

import BlockchainAgridence.uet.modules.identity.entity.Organization;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface OrganizationRepository extends JpaRepository<Organization, UUID> {
    boolean existsByOrgWalletAddress(String orgWalletAddress);
}