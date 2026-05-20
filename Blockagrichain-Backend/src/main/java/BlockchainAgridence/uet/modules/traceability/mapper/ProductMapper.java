package BlockchainAgridence.uet.modules.traceability.mapper;


import BlockchainAgridence.uet.modules.traceability.dto.request.ProductRequest;
import BlockchainAgridence.uet.modules.traceability.dto.response.ProductResponse;
import BlockchainAgridence.uet.modules.traceability.entity.Product;
import org.mapstruct.BeanMapping;
import org.mapstruct.Builder;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface ProductMapper {

    // Không map orgId, category ở đây vì sẽ được set thủ công trong Service
    // Dùng setter thay vì builder vì @Builder của Product không kế thừa field id từ BaseEntity
    @BeanMapping(builder = @Builder(disableBuilder = true))
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "organization", ignore = true)
    @Mapping(target = "category", ignore = true) // Sẽ resolve từ categoryId trong Service
    Product toEntity(ProductRequest request);

    @Mapping(source = "organization.id", target = "orgId")
    @Mapping(source = "category.id", target = "categoryId")
    ProductResponse toResponse(Product product);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "organization", ignore = true)
    @Mapping(target = "category", ignore = true) // Sẽ resolve từ categoryId trong Service
    void updateEntity(@MappingTarget Product product, ProductRequest request);
}