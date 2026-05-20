// File: src/main/java/BlockchainAgridence/uet/modules/identity/repository/UserRepository.java
package BlockchainAgridence.uet.modules.identity.repository;

import BlockchainAgridence.uet.modules.identity.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;
import java.util.List;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {

    // Dùng EntityGraph để fetch luôn roles (tránh lỗi N+1 Query) khi xử lý Login Auth
    @EntityGraph(attributePaths = {"roles", "roles.permissions"})
    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    // Xử lý Multi-tenancy: Chỉ lấy user thuộc một tổ chức
    List<User> findAllByOrgId(UUID orgId);
}