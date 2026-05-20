package BlockchainAgridence.uet.shared;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@MappedSuperclass
@EntityListeners(AuditingEntityListener.class)
public abstract class BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    // Tự động lưu ID của user tạo bản ghi
    @CreatedBy
    @Column(name = "created_by", updatable = false, length = 100)
    private String createdBy;

    // Tự động lưu ID của user sửa bản ghi gần nhất
    @LastModifiedBy
    @Column(name = "updated_by", length = 100)
    private String updatedBy;

    // Tự động lấy giờ hệ thống khi Insert
    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    // Tự động cập nhật giờ hệ thống mỗi khi Update
    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Phục vụ Soft Delete
    @Column(name = "is_deleted", nullable = false)
    private Boolean isDeleted = false;

    // Phục vụ Optimistic Locking (Ngăn chặn lỗi ghi đè dữ liệu khi nhiều người sửa cùng lúc)
    @Version
    @Column(name = "version")
    private Long version;
}
