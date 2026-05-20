package BlockchainAgridence.uet.modules.identity.mapper;

import BlockchainAgridence.uet.modules.identity.dto.response.PermissionResponse;
import BlockchainAgridence.uet.modules.identity.entity.Permission;
import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface PermissionMapper {
    PermissionResponse toResponse(Permission permission);
}
