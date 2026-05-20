package BlockchainAgridence.uet.modules.identity.mapper;

import BlockchainAgridence.uet.modules.identity.dto.request.OrgDocumentCreateRequest;
import BlockchainAgridence.uet.modules.identity.dto.request.OrgRegistrationRequest;
import BlockchainAgridence.uet.modules.identity.dto.request.OrgUpdateRequest;
import BlockchainAgridence.uet.modules.identity.dto.response.OrgDocumentResponse;
import BlockchainAgridence.uet.modules.identity.dto.response.OrgResponse;
import BlockchainAgridence.uet.modules.identity.entity.Organization;
import BlockchainAgridence.uet.modules.identity.entity.OrganizationDocument;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.ReportingPolicy;

// unmappedTargetPolicy = IGNORE để không báo cảnh báo với những trường không map
@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface OrganizationMapper {

    // Ánh xạ từ Entity sang Response DTO
    OrgResponse toResponse(Organization organization);

    OrgDocumentResponse toDocumentResponse(OrganizationDocument document);
    OrganizationDocument toDocumentEntity(OrgDocumentCreateRequest request);

    // Ánh xạ từ Request DTO sang Entity khi tạo mới
    @org.mapstruct.Mapping(target = "documents", ignore = true)
    Organization toEntity(OrgRegistrationRequest request);

    // Cập nhật các trường từ Request DTO vào Entity đã tồn tại trong DB
    void updateEntity(@MappingTarget Organization organization, OrgUpdateRequest request);
}