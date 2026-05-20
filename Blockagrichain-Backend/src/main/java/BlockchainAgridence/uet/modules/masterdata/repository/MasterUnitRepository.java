package BlockchainAgridence.uet.modules.masterdata.repository;

import BlockchainAgridence.uet.modules.masterdata.entity.MasterUnit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface MasterUnitRepository extends JpaRepository<MasterUnit, UUID> {
    List<MasterUnit> findAllByIsDeletedFalse();
    Optional<MasterUnit> findByCode(String code);
}