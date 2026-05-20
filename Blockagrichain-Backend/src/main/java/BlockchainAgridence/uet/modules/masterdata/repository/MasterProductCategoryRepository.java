package BlockchainAgridence.uet.modules.masterdata.repository;

import BlockchainAgridence.uet.modules.masterdata.entity.MasterProductCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface MasterProductCategoryRepository extends JpaRepository<MasterProductCategory, UUID> {
    List<MasterProductCategory> findAllByIsDeletedFalse();
    Optional<MasterProductCategory> findByCode(String code);
}