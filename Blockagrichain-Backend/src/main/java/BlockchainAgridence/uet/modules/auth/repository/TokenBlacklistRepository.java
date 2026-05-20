package BlockchainAgridence.uet.modules.auth.repository;

import BlockchainAgridence.uet.modules.auth.entity.TokenBlacklist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.UUID;

@Repository
public interface TokenBlacklistRepository extends JpaRepository<TokenBlacklist, UUID> {
    boolean existsByToken(String token);
    
    // Spring Data JPA sẽ tự sinh ra câu SQL: DELETE FROM token_blacklist WHERE expiry_date < ?
    void deleteByExpiryDateBefore(LocalDateTime dateTime);
}
