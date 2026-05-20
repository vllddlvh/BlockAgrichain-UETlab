package BlockchainAgridence.uet.modules.traceability.mapper;

import BlockchainAgridence.uet.modules.traceability.dto.response.BatchEventResponse;
import BlockchainAgridence.uet.modules.traceability.dto.response.BatchResponse;
import BlockchainAgridence.uet.modules.traceability.entity.Batch;
import BlockchainAgridence.uet.modules.traceability.entity.BatchEvent;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface BatchMapper {

    @Mapping(source = "product.id", target = "productId")
    @Mapping(source = "product.name", target = "productName")
    @Mapping(source = "creatorOrg.name", target = "creatorOrgName")
    @Mapping(source = "currentOwnerOrg.name", target = "currentOwnerOrgName")
    @Mapping(source = "unit.id", target = "unitId")
    @Mapping(source = "unit.code", target = "unitCode")
    BatchResponse toBatchResponse(Batch batch);

    @Mapping(source = "batch.id", target = "batchId")
    @Mapping(source = "actorUser.email", target = "actorEmail")
    BatchEventResponse toBatchEventResponse(BatchEvent event);
}