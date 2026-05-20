package BlockchainAgridence.uet.modules.traceability.entity;

import BlockchainAgridence.uet.modules.identity.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "batch_events")
@EntityListeners(AuditingEntityListener.class)
public class BatchEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "batch_id", nullable = false, updatable = false)
    private Batch batch;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "actor_user_id", nullable = false, updatable = false)
    private User actorUser;

    @Enumerated(EnumType.STRING)
    @Column(name = "event_type", nullable = false, length = 50, updatable = false)
    private EventType eventType;

    @Column(name = "gps_latitude", precision = 10, scale = 8, updatable = false)
    private BigDecimal gpsLatitude;

    @Column(name = "gps_longitude", precision = 11, scale = 8, updatable = false)
    private BigDecimal gpsLongitude;

    @Column(name = "device_info", length = 255, updatable = false)
    private String deviceInfo;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "image_cids", columnDefinition = "jsonb", updatable = false)
    private List<String> imageCids;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "metadata", columnDefinition = "jsonb", updatable = false)
    private Map<String, Object> metadata;

    @Column(name = "onchain_event_hash", length = 255, updatable = false)
    private String onchainEventHash;

    @Column(name = "is_deleted", nullable = false, updatable = false)
    private Boolean isDeleted = false;

    @CreatedBy
    @Column(name = "created_by", length = 255, updatable = false)
    private String createdBy;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
