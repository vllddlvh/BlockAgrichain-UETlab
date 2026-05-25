package BlockchainAgridence.uet.modules.identity.service;

import BlockchainAgridence.uet.exception.AppException;
import BlockchainAgridence.uet.exception.ErrorCode;
import BlockchainAgridence.uet.modules.identity.dto.request.OrgDocumentCreateRequest;
import BlockchainAgridence.uet.modules.identity.dto.request.OrgRegistrationRequest;
import BlockchainAgridence.uet.modules.identity.dto.request.OrgUpdateRequest;
import BlockchainAgridence.uet.modules.identity.dto.response.OrgDocumentResponse;
import BlockchainAgridence.uet.modules.identity.dto.response.OrgResponse;
import BlockchainAgridence.uet.modules.identity.entity.OrgStatus;
import BlockchainAgridence.uet.modules.identity.entity.Organization;
import BlockchainAgridence.uet.modules.identity.entity.OrganizationDocument;
import BlockchainAgridence.uet.modules.identity.entity.Role;
import BlockchainAgridence.uet.modules.identity.entity.User;
import BlockchainAgridence.uet.modules.identity.mapper.OrganizationMapper;
import BlockchainAgridence.uet.modules.identity.repository.OrganizationDocumentRepository;
import BlockchainAgridence.uet.modules.identity.repository.OrganizationRepository;
import BlockchainAgridence.uet.modules.identity.repository.RoleRepository;
import BlockchainAgridence.uet.modules.identity.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class OrganizationService {

    private final OrganizationRepository organizationRepository;
    private final OrganizationDocumentRepository documentRepository;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final OrganizationMapper organizationMapper;
    private final PasswordEncoder passwordEncoder;

    /**
     * Luồng Onboarding: Tạo Tổ chức VÀ tạo tài khoản Admin cho tổ chức đó.
     * Bắt buộc dùng @Transactional để Rollback nếu 1 trong 2 thao tác lỗi.
     */
    @Transactional
    public OrgResponse registerOrganization(OrgRegistrationRequest request) {
        log.info("Bắt đầu đăng ký tổ chức mới với ví: {}", request.getOrgWalletAddress());

        // 1. Kiểm tra tính duy nhất (Ví Web3 và Email Admin)
        if (organizationRepository.existsByOrgWalletAddress(request.getOrgWalletAddress())) {
            throw new AppException(ErrorCode.ORG_WALLET_EXISTED);
        }
        if (userRepository.existsByEmail(request.getAdminEmail())) {
            throw new AppException(ErrorCode.USER_EMAIL_EXISTED);
        }

        // 2. Lưu thông tin Tổ chức (Mặc định trạng thái là REGISTERED)
        Organization org = organizationMapper.toEntity(request);
        org.setStatus(OrgStatus.REGISTERED);
        
        // Xử lý móc nối giấy tờ pháp lý ngay lúc đăng ký
        if (request.getDocuments() != null && !request.getDocuments().isEmpty()) {
            for (OrgDocumentCreateRequest docReq : request.getDocuments()) {
                OrganizationDocument doc = organizationMapper.toDocumentEntity(docReq);
                org.addDocument(doc); // Dùng hàm tiện ích đã định nghĩa trong Entity
            }
        }

        org = organizationRepository.save(org);

        // 3. Xác định Role cần gán dựa vào OrgType
        String roleCode = switch (request.getOrgType()) {
            case FARM -> "FARM_ADMIN";
            case TRANSPORTER -> "TRANSPORT_ADMIN";
            case RETAILER -> "RETAIL_ADMIN";
            default -> "ORG_ADMIN";
        };

        Role adminRole = roleRepository.findByCode(roleCode)
                .orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_FOUND));

        // 4. Tạo tài khoản User đại diện cho Tổ chức (Org Admin)
        User adminUser = User.builder()
                .organization(org)
                .email(request.getAdminEmail())
                .passwordHash(passwordEncoder.encode(request.getAdminPassword())) // Băm mật khẩu
                .fullName(request.getAdminFullName())
                .roles(new HashSet<>(Set.of(adminRole))) // Gán role
                .build();

        userRepository.save(adminUser);

        log.info("Đăng ký thành công tổ chức {} và tài khoản admin {}", org.getName(), adminUser.getEmail());

        return organizationMapper.toResponse(org);
    }

    @Transactional(readOnly = true)
    public List<OrgResponse> getAllOrganizations() {
        return organizationRepository.findAll().stream()
                .map(organizationMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public OrgResponse getOrganizationById(UUID id) {
        Organization org = organizationRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.ORG_NOT_FOUND));
        return organizationMapper.toResponse(org);
    }

    @Transactional
    public OrgResponse updateOrganization(UUID id, OrgUpdateRequest request) {
        Organization org = organizationRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.ORG_NOT_FOUND));

        // Dùng MapStruct để đắp dữ liệu mới từ request lên entity cũ
        organizationMapper.updateEntity(org, request);
        org = organizationRepository.save(org);

        return organizationMapper.toResponse(org);
    }

    @Transactional
    public OrgResponse updateOrganizationStatus(UUID id, OrgStatus status) {
        Organization org = organizationRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.ORG_NOT_FOUND));

        org.setStatus(status);
        org = organizationRepository.save(org);

        return organizationMapper.toResponse(org);
    }

    @Transactional
    public OrgDocumentResponse addDocumentToOrganization(UUID orgId, OrgDocumentCreateRequest request) {
        Organization org = organizationRepository.findById(orgId)
                .orElseThrow(() -> new AppException(ErrorCode.ORG_NOT_FOUND));

        OrganizationDocument document = organizationMapper.toDocumentEntity(request);
        document.setOrganization(org);
        document = documentRepository.save(document);

        return organizationMapper.toDocumentResponse(document);
    }

    @Transactional
    public OrgResponse submitForReview(UUID id) {
        Organization org = organizationRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.ORG_NOT_FOUND));

        if (org.getStatus() != OrgStatus.REGISTERED && org.getStatus() != OrgStatus.REJECTED && org.getStatus() != OrgStatus.PENDING) {
            throw new AppException(ErrorCode.ORG_INVALID_STATUS_TRANSITION);
        }

        org.setStatus(OrgStatus.PENDING_APPROVAL);
        org = organizationRepository.save(org);

        return organizationMapper.toResponse(org);
    }
}