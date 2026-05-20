package BlockchainAgridence.uet.modules.identity.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {
    private UUID id;
    private UUID orgId;
    private String email;
    private String fullName;
    private Boolean isDeleted;
    private LocalDateTime createdAt;

    // Chỉ trả về danh sách các chuỗi Code thay vì cả Object để Frontend dễ xử lý
    private List<String> roles;
}