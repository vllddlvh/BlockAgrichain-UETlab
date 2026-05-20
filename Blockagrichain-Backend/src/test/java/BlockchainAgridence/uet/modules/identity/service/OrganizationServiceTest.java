package BlockchainAgridence.uet.modules.identity.service;

import BlockchainAgridence.uet.exception.AppException;
import BlockchainAgridence.uet.exception.ErrorCode;
import BlockchainAgridence.uet.modules.identity.dto.request.OrgDocumentCreateRequest;
import BlockchainAgridence.uet.modules.identity.dto.request.OrgRegistrationRequest;
import BlockchainAgridence.uet.modules.identity.dto.request.OrgUpdateRequest;
import BlockchainAgridence.uet.modules.identity.dto.response.OrgDocumentResponse;
import BlockchainAgridence.uet.modules.identity.dto.response.OrgResponse;
import BlockchainAgridence.uet.modules.identity.entity.*;
import BlockchainAgridence.uet.modules.identity.mapper.OrganizationMapper;
import BlockchainAgridence.uet.modules.identity.repository.OrganizationDocumentRepository;
import BlockchainAgridence.uet.modules.identity.repository.OrganizationRepository;
import BlockchainAgridence.uet.modules.identity.repository.RoleRepository;
import BlockchainAgridence.uet.modules.identity.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OrganizationServiceTest {

    @Mock
    private OrganizationRepository organizationRepository;

    @Mock
    private OrganizationDocumentRepository documentRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private RoleRepository roleRepository;

    @Mock
    private OrganizationMapper organizationMapper;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private OrganizationService organizationService;

    private OrgRegistrationRequest registrationRequest;
    private Organization organizationEntity;
    private Role adminRole;
    private OrgResponse expectedResponse;

    @BeforeEach
    void setUp() {
        // Setup registration request
        registrationRequest = new OrgRegistrationRequest();
        registrationRequest.setOrgWalletAddress("0x1234567890123456789012345678901234567890");
        registrationRequest.setName("HTX Thanh Hoa");
        registrationRequest.setTaxCode("0110953238");
        registrationRequest.setRepresentativeName("Bui Hai Phuong");
        registrationRequest.setOrgType(OrgType.FARM);
        registrationRequest.setAdminEmail("admin@htxthanhhoa.com");
        registrationRequest.setAdminPassword("SecurePassword123");
        registrationRequest.setAdminFullName("Bui Hai Phuong");

        // Setup entity
        organizationEntity = Organization.builder()
                .orgWalletAddress(registrationRequest.getOrgWalletAddress())
                .name(registrationRequest.getName())
                .taxCode(registrationRequest.getTaxCode())
                .representativeName(registrationRequest.getRepresentativeName())
                .orgType(registrationRequest.getOrgType())
                .status(OrgStatus.PENDING)
                .build();
        organizationEntity.setId(UUID.randomUUID());

        // Setup role
        adminRole = Role.builder()
                .id(UUID.randomUUID())
                .code("ORG_ADMIN")
                .name("Organization Admin")
                .build();

        // Setup response
        expectedResponse = OrgResponse.builder()
                .id(organizationEntity.getId())
                .orgWalletAddress(organizationEntity.getOrgWalletAddress())
                .name(organizationEntity.getName())
                .taxCode(organizationEntity.getTaxCode())
                .representativeName(organizationEntity.getRepresentativeName())
                .orgType(organizationEntity.getOrgType())
                .status(OrgStatus.PENDING)
                .build();
    }

    @Test
    void registerOrganization_Success_WithoutDocuments() {
        // Arrange
        registrationRequest.setDocuments(null); // No documents provided

        when(organizationRepository.existsByOrgWalletAddress(registrationRequest.getOrgWalletAddress())).thenReturn(false);
        when(userRepository.existsByEmail(registrationRequest.getAdminEmail())).thenReturn(false);
        when(organizationMapper.toEntity(registrationRequest)).thenReturn(organizationEntity);
        when(organizationRepository.save(any(Organization.class))).thenReturn(organizationEntity);
        when(roleRepository.findByCode("ORG_ADMIN")).thenReturn(Optional.of(adminRole));
        when(passwordEncoder.encode(registrationRequest.getAdminPassword())).thenReturn("encryptedPassword");
        when(organizationMapper.toResponse(organizationEntity)).thenReturn(expectedResponse);

        // Act
        OrgResponse result = organizationService.registerOrganization(registrationRequest);

        // Assert
        assertNotNull(result);
        assertEquals(expectedResponse.getId(), result.getId());
        assertEquals(expectedResponse.getName(), result.getName());
        assertEquals(OrgStatus.PENDING, result.getStatus());

        verify(organizationRepository).existsByOrgWalletAddress(registrationRequest.getOrgWalletAddress());
        verify(userRepository).existsByEmail(registrationRequest.getAdminEmail());
        verify(organizationRepository).save(any(Organization.class));
        verify(userRepository).save(any(User.class));
    }

    @Test
    void registerOrganization_Success_WithDocuments() {
        // Arrange
        OrgDocumentCreateRequest docReq = new OrgDocumentCreateRequest();
        docReq.setDocumentType("BUSINESS_LICENSE");
        docReq.setDocumentName("GPKD.pdf");
        docReq.setCid("Qm1234567890abcdef");
        registrationRequest.setDocuments(Collections.singletonList(docReq));

        OrganizationDocument docEntity = new OrganizationDocument();
        docEntity.setDocumentType(docReq.getDocumentType());
        docEntity.setDocumentName(docReq.getDocumentName());
        docEntity.setCid(docReq.getCid());

        when(organizationRepository.existsByOrgWalletAddress(registrationRequest.getOrgWalletAddress())).thenReturn(false);
        when(userRepository.existsByEmail(registrationRequest.getAdminEmail())).thenReturn(false);
        when(organizationMapper.toEntity(registrationRequest)).thenReturn(organizationEntity);
        when(organizationMapper.toDocumentEntity(docReq)).thenReturn(docEntity);
        when(organizationRepository.save(any(Organization.class))).thenReturn(organizationEntity);
        when(roleRepository.findByCode("ORG_ADMIN")).thenReturn(Optional.of(adminRole));
        when(passwordEncoder.encode(registrationRequest.getAdminPassword())).thenReturn("encryptedPassword");
        when(organizationMapper.toResponse(organizationEntity)).thenReturn(expectedResponse);

        // Act
        OrgResponse result = organizationService.registerOrganization(registrationRequest);

        // Assert
        assertNotNull(result);
        verify(organizationMapper).toDocumentEntity(docReq);
        verify(organizationRepository).save(organizationEntity);
    }

    @Test
    void registerOrganization_WalletAlreadyExisted_ThrowsException() {
        // Arrange
        when(organizationRepository.existsByOrgWalletAddress(registrationRequest.getOrgWalletAddress())).thenReturn(true);

        // Act & Assert
        AppException exception = assertThrows(AppException.class, () -> 
            organizationService.registerOrganization(registrationRequest)
        );
        assertEquals(ErrorCode.ORG_WALLET_EXISTED, exception.getErrorCode());
        verify(organizationRepository).existsByOrgWalletAddress(registrationRequest.getOrgWalletAddress());
        verifyNoInteractions(userRepository, roleRepository, passwordEncoder, organizationMapper);
    }

    @Test
    void registerOrganization_EmailAlreadyExisted_ThrowsException() {
        // Arrange
        when(organizationRepository.existsByOrgWalletAddress(registrationRequest.getOrgWalletAddress())).thenReturn(false);
        when(userRepository.existsByEmail(registrationRequest.getAdminEmail())).thenReturn(true);

        // Act & Assert
        AppException exception = assertThrows(AppException.class, () -> 
            organizationService.registerOrganization(registrationRequest)
        );
        assertEquals(ErrorCode.USER_EMAIL_EXISTED, exception.getErrorCode());
        verify(organizationRepository).existsByOrgWalletAddress(registrationRequest.getOrgWalletAddress());
        verify(userRepository).existsByEmail(registrationRequest.getAdminEmail());
        verifyNoMoreInteractions(organizationRepository, userRepository);
        verifyNoInteractions(roleRepository, passwordEncoder, organizationMapper);
    }

    @Test
    void registerOrganization_RoleAdminNotFound_ThrowsException() {
        // Arrange
        when(organizationRepository.existsByOrgWalletAddress(registrationRequest.getOrgWalletAddress())).thenReturn(false);
        when(userRepository.existsByEmail(registrationRequest.getAdminEmail())).thenReturn(false);
        when(organizationMapper.toEntity(registrationRequest)).thenReturn(organizationEntity);
        when(organizationRepository.save(any(Organization.class))).thenReturn(organizationEntity);
        when(roleRepository.findByCode("ORG_ADMIN")).thenReturn(Optional.empty());

        // Act & Assert
        AppException exception = assertThrows(AppException.class, () -> 
            organizationService.registerOrganization(registrationRequest)
        );
        assertEquals(ErrorCode.ROLE_NOT_FOUND, exception.getErrorCode());
        verify(roleRepository).findByCode("ORG_ADMIN");
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void getOrganizationById_Success() {
        // Arrange
        UUID id = organizationEntity.getId();
        when(organizationRepository.findById(id)).thenReturn(Optional.of(organizationEntity));
        when(organizationMapper.toResponse(organizationEntity)).thenReturn(expectedResponse);

        // Act
        OrgResponse result = organizationService.getOrganizationById(id);

        // Assert
        assertNotNull(result);
        assertEquals(id, result.getId());
    }

    @Test
    void getOrganizationById_NotFound_ThrowsException() {
        // Arrange
        UUID id = UUID.randomUUID();
        when(organizationRepository.findById(id)).thenReturn(Optional.empty());

        // Act & Assert
        AppException exception = assertThrows(AppException.class, () -> 
            organizationService.getOrganizationById(id)
        );
        assertEquals(ErrorCode.ORG_NOT_FOUND, exception.getErrorCode());
    }

    @Test
    void updateOrganizationStatus_Success() {
        // Arrange
        UUID id = organizationEntity.getId();
        when(organizationRepository.findById(id)).thenReturn(Optional.of(organizationEntity));
        when(organizationRepository.save(organizationEntity)).thenReturn(organizationEntity);
        
        OrgResponse updatedResponse = expectedResponse;
        updatedResponse.setStatus(OrgStatus.VERIFIED);
        when(organizationMapper.toResponse(organizationEntity)).thenReturn(updatedResponse);

        // Act
        OrgResponse result = organizationService.updateOrganizationStatus(id, OrgStatus.VERIFIED);

        // Assert
        assertNotNull(result);
        assertEquals(OrgStatus.VERIFIED, result.getStatus());
        assertEquals(OrgStatus.VERIFIED, organizationEntity.getStatus());
        verify(organizationRepository).save(organizationEntity);
    }
}
