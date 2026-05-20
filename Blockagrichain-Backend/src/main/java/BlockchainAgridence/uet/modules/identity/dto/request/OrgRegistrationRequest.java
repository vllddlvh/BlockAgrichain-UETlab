package BlockchainAgridence.uet.modules.identity.dto.request;

import BlockchainAgridence.uet.modules.identity.entity.OrgType;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class OrgRegistrationRequest {

    // --- Thông tin Tổ chức ---
    @NotBlank(message = "WALLET_ADDRESS_BLANK")
    @Pattern(regexp = "^0x[a-fA-F0-9]{40}$", message = "INVALID_WEB3_WALLET")
    private String orgWalletAddress;

    @NotBlank(message = "ORG_NAME_BLANK")
    private String name;

    private String taxCode;

    private String representativeName;

    @jakarta.validation.Valid
    private java.util.List<OrgDocumentCreateRequest> documents; // Khuyến khích gửi toàn bộ giấy tờ lúc đăng ký

    private String addressDetail;

    @NotNull(message = "ORG_TYPE_NULL")
    private OrgType orgType;

    // --- Thông tin Quản trị viên (Admin) đầu tiên ---
    @NotBlank(message = "ADMIN_EMAIL_BLANK")
    @Email(message = "INVALID_EMAIL_FORMAT")
    private String adminEmail;

    @NotBlank(message = "ADMIN_PASSWORD_BLANK")
    private String adminPassword;

    @NotBlank(message = "ADMIN_FULLNAME_BLANK")
    private String adminFullName;
}