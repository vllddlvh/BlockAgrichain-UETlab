package BlockchainAgridence.uet.modules.auth.job;

import BlockchainAgridence.uet.modules.auth.repository.TokenBlacklistRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class TokenCleanupJob {

    TokenBlacklistRepository tokenBlacklistRepository;

    // Chạy ngầm tự động vào lúc 02:00 sáng mỗi ngày
    @Scheduled(cron = "0 0 2 * * ?")
    @Transactional
    public void cleanExpiredTokens() {
        log.info("Starting cleanup of expired tokens from token_blacklist...");
        try {
            tokenBlacklistRepository.deleteByExpiryDateBefore(LocalDateTime.now());
            log.info("Successfully cleaned up expired tokens.");
        } catch (Exception e) {
            log.error("Error occurred while cleaning up expired tokens", e);
        }
    }
}
