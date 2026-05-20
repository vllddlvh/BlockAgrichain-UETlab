package BlockchainAgridence.uet.modules.identity.mapper;

import BlockchainAgridence.uet.modules.identity.dto.request.UserCreateRequest;
import BlockchainAgridence.uet.modules.identity.dto.response.UserResponse;
import BlockchainAgridence.uet.modules.identity.entity.Role;
import BlockchainAgridence.uet.modules.identity.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface UserMapper {

    // Gọi hàm custom ở dưới để map roles
    @Mapping(target = "roles", expression = "java(mapRolesToStrings(user.getRoles()))")
    UserResponse toResponse(User user);

    User toEntity(UserCreateRequest request);

    // Hàm chuyển đổi custom: Lấy mã code từ các Role
    default List<String> mapRolesToStrings(Set<Role> roles) {
        if (roles == null || roles.isEmpty()) {
            return new ArrayList<>();
        }
        return roles.stream()
                .map(Role::getCode)
                .collect(Collectors.toList());
    }
}