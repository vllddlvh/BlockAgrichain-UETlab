package BlockchainAgridence.uet.modules.identity.mapper;

import BlockchainAgridence.uet.modules.identity.dto.response.RoleResponse;
import BlockchainAgridence.uet.modules.identity.entity.Permission;
import BlockchainAgridence.uet.modules.identity.entity.Role;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface RoleMapper {

    @Mapping(target = "permissions", expression = "java(mapPermissionsToStrings(role.getPermissions()))")
    RoleResponse toResponse(Role role);

    default List<String> mapPermissionsToStrings(Set<Permission> permissions) {
        if (permissions == null || permissions.isEmpty()) {
            return new ArrayList<>();
        }
        return permissions.stream()
                .map(Permission::getCode)
                .collect(Collectors.toList());
    }
}
