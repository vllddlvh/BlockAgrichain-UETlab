package BlockchainAgridence.uet.modules.identity.repository;

import BlockchainAgridence.uet.modules.identity.entity.Organization;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import BlockchainAgridence.uet.modules.identity.entity.OrgStatus;

import java.util.List;
import java.util.UUID;

@Repository
public interface OrganizationRepository extends JpaRepository<Organization, UUID> {
    boolean existsByOrgWalletAddress(String orgWalletAddress);
    List<Organization> findAllByStatus(OrgStatus status);
    
    List<Organization> findByStatusAndNameContainingIgnoreCase(OrgStatus status, String name);
}