package BlockchainAgridence.uet.configuration;

import BlockchainAgridence.uet.shared.utils.SecurityUtils;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.domain.AuditorAware;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

import java.util.Optional;
import java.util.UUID;

@Configuration
@EnableJpaAuditing(auditorAwareRef = "auditorAware")
public class JpaAuditingConfig {

    /**
     * Cung cấp thông tin "ai đang thao tác" cho @CreatedBy và @LastModifiedBy.
     * Lưu userId (UUID) thay vì email để tránh lộ lọt thông tin cá nhân ra FE.
     */
    @Bean
    public AuditorAware<String> auditorAware() {
        return () -> {
            UUID userId = SecurityUtils.getCurrentUserId();
            return Optional.ofNullable(userId != null ? userId.toString() : null);
        };
    }
}
