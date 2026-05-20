package BlockchainAgridence.uet.modules.identity.repository;

import BlockchainAgridence.uet.modules.identity.entity.OrganizationDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface OrganizationDocumentRepository extends JpaRepository<OrganizationDocument, UUID> {
    List<OrganizationDocument> findByOrganizationId(UUID orgId);
}
