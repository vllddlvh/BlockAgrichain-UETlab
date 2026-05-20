// File: src/main/java/BlockchainAgridence/uet/modules/identity/repository/RoleRepository.java
package BlockchainAgridence.uet.modules.identity.repository;

import BlockchainAgridence.uet.modules.identity.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RoleRepository extends JpaRepository<Role, UUID> {
    Optional<Role> findByCode(String code);
    List<Role> findAllByCodeIn(Collection<String> codes);
}