package BlockchainAgridence.uet.modules.traceability.service;

import BlockchainAgridence.uet.exception.AppException;
import BlockchainAgridence.uet.exception.ErrorCode;
import BlockchainAgridence.uet.modules.identity.entity.Organization;
import BlockchainAgridence.uet.modules.identity.entity.User;
import BlockchainAgridence.uet.modules.identity.repository.OrganizationRepository;
import BlockchainAgridence.uet.modules.identity.repository.UserRepository;
import BlockchainAgridence.uet.modules.masterdata.entity.MasterUnit;
import BlockchainAgridence.uet.modules.masterdata.repository.MasterUnitRepository;
import BlockchainAgridence.uet.modules.traceability.dto.request.BatchMergeRequest;
import BlockchainAgridence.uet.modules.traceability.dto.request.BatchSplitRequest;
import BlockchainAgridence.uet.modules.traceability.dto.response.BatchResponse;
import BlockchainAgridence.uet.modules.traceability.dto.response.BatchTraceabilityNodeResponse;
import BlockchainAgridence.uet.modules.traceability.entity.*;
import BlockchainAgridence.uet.modules.traceability.mapper.BatchMapper;
import BlockchainAgridence.uet.modules.traceability.repository.BatchEventRepository;
import BlockchainAgridence.uet.modules.traceability.repository.BatchLineageRepository;
import BlockchainAgridence.uet.modules.traceability.repository.BatchRepository;
import BlockchainAgridence.uet.modules.traceability.repository.ProductRepository;
import BlockchainAgridence.uet.shared.utils.SecurityUtils;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class BatchGraphService {

    BatchRepository batchRepository;
    BatchEventRepository batchEventRepository;
    BatchLineageRepository batchLineageRepository;
    ProductRepository productRepository;
    OrganizationRepository organizationRepository;
    UserRepository userRepository;
    MasterUnitRepository masterUnitRepository;
    BatchMapper batchMapper;

    private UUID getAuthenticatedUserId() {
        UUID userId = SecurityUtils.getCurrentUserId();
        if (userId == null) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }
        return userId;
    }

    private UUID getAuthenticatedOrgId() {
        UUID orgId = SecurityUtils.getCurrentUserOrgId();
        if (orgId == null) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }
        return orgId;
    }

    @Transactional
    public BatchResponse mergeBatches(BatchMergeRequest request) {
        UUID orgId = getAuthenticatedOrgId();
        UUID userId = getAuthenticatedUserId();

        if (batchRepository.existsByBatchCode(request.getNewBatchCode())) {
            throw new AppException(ErrorCode.BATCH_CODE_ALREADY_EXISTS);
        }

        Organization org = organizationRepository.findById(orgId)
                .orElseThrow(() -> new AppException(ErrorCode.ORG_NOT_FOUND));

        User actor = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        Product product = productRepository.findByIdAndOrganizationId(request.getNewProductId(), orgId)
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));

        MasterUnit unit = masterUnitRepository.findById(request.getUnitId())
                .orElseThrow(() -> new AppException(ErrorCode.UNIT_NOT_FOUND));

        List<Batch> parentBatches = new ArrayList<>();
        Map<UUID, BigDecimal> usageMap = new HashMap<>();
        BigDecimal totalConsumed = BigDecimal.ZERO;

        for (BatchMergeRequest.ParentUsageRequest parentRequest : request.getParents()) {
            Batch parent = batchRepository.findById(parentRequest.getBatchId())
                    .orElseThrow(() -> new AppException(ErrorCode.BATCH_NOT_FOUND));

            if (!parent.getCurrentOwnerOrg().getId().equals(orgId)) {
                throw new AppException(ErrorCode.UNAUTHORIZED_ACCESS);
            }
            if (!Boolean.TRUE.equals(parent.getIsActive())) {
                throw new AppException(ErrorCode.BATCH_INACTIVE);
            }

            BigDecimal remaining = parent.getCurrentQuantity().subtract(parentRequest.getQuantityUsed());
            if (remaining.compareTo(BigDecimal.ZERO) < 0) {
                throw new AppException(ErrorCode.BATCH_INSUFFICIENT_QUANTITY);
            }

            parent.setCurrentQuantity(remaining);
            if (remaining.compareTo(BigDecimal.ZERO) == 0) {
                parent.setStatus(BatchStatus.DEPLETED);
            }

            parentBatches.add(parent);
            usageMap.put(parent.getId(), parentRequest.getQuantityUsed());
            totalConsumed = totalConsumed.add(parentRequest.getQuantityUsed());
        }

        batchRepository.saveAll(parentBatches);

        Batch childBatch = Batch.builder()
                .batchCode(request.getNewBatchCode())
                .product(product)
                .creatorOrg(org)
                .currentOwnerOrg(org)
                .productType(request.getProductType())
                .status(BatchStatus.CREATED)
                .isActive(true)
                .initialQuantity(request.getProducedQuantity())
                .currentQuantity(request.getProducedQuantity())
                .unit(unit)
                .build();

        childBatch = batchRepository.save(childBatch);

        List<BatchLineage> lineageRecords = new ArrayList<>();
        List<BatchEvent> parentEvents = new ArrayList<>();
        for (Batch parent : parentBatches) {
            BigDecimal usedQuantity = usageMap.get(parent.getId());
            lineageRecords.add(BatchLineage.builder()
                    .id(new BatchLineageId(parent.getId(), childBatch.getId()))
                    .parentBatch(parent)
                    .childBatch(childBatch)
                    .actionType(LineageActionType.MERGE)
                    .quantity(usedQuantity)
                    .build());

            parentEvents.add(BatchEvent.builder()
                    .batch(parent)
                    .actorUser(actor)
                    .eventType(EventType.CONSUMED)
                    .metadata(Map.of(
                            "quantity_used", usedQuantity,
                            "child_batch_id", childBatch.getId(),
                            "child_batch_code", childBatch.getBatchCode()))
                    .createdBy(actor.getEmail())
                    .build());
        }

        batchLineageRepository.saveAll(lineageRecords);
        batchEventRepository.saveAll(parentEvents);

        BatchEvent childEvent = BatchEvent.builder()
                .batch(childBatch)
                .actorUser(actor)
                .eventType(EventType.CREATED_FROM_MERGE)
                .metadata(Map.of(
                        "parent_batch_ids", parentBatches.stream().map(Batch::getId).toList(),
                        "total_consumed", totalConsumed))
                .createdBy(actor.getEmail())
                .build();
        batchEventRepository.save(childEvent);

        log.info("Gộp lô thành công: tạo lô mới [{}] từ {} lô cha", childBatch.getBatchCode(), parentBatches.size());
        return batchMapper.toBatchResponse(childBatch);
    }

    @Transactional
    public List<BatchResponse> splitBatch(BatchSplitRequest request) {
        UUID orgId = getAuthenticatedOrgId();
        UUID userId = getAuthenticatedUserId();

        Organization org = organizationRepository.findById(orgId)
                .orElseThrow(() -> new AppException(ErrorCode.ORG_NOT_FOUND));

        User actor = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        Batch parent = batchRepository.findById(request.getParentBatchId())
                .orElseThrow(() -> new AppException(ErrorCode.BATCH_NOT_FOUND));

        if (!parent.getCurrentOwnerOrg().getId().equals(orgId)) {
            throw new AppException(ErrorCode.UNAUTHORIZED_ACCESS);
        }
        if (!Boolean.TRUE.equals(parent.getIsActive())) {
            throw new AppException(ErrorCode.BATCH_INACTIVE);
        }

        BigDecimal totalSplitQuantity = request.getChildren().stream()
                .map(BatchSplitRequest.ChildBatchRequest::getQuantity)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal remaining = parent.getCurrentQuantity().subtract(totalSplitQuantity);
        if (remaining.compareTo(BigDecimal.ZERO) < 0) {
            throw new AppException(ErrorCode.BATCH_INSUFFICIENT_QUANTITY);
        }

        parent.setCurrentQuantity(remaining);
        if (remaining.compareTo(BigDecimal.ZERO) == 0) {
            parent.setStatus(BatchStatus.DEPLETED);
        }
        batchRepository.save(parent);

        List<Batch> children = new ArrayList<>();
        List<BatchLineage> lineageRecords = new ArrayList<>();
        List<BatchEvent> childEvents = new ArrayList<>();

        for (BatchSplitRequest.ChildBatchRequest childRequest : request.getChildren()) {
            if (batchRepository.existsByBatchCode(childRequest.getNewBatchCode())) {
                throw new AppException(ErrorCode.BATCH_CODE_ALREADY_EXISTS);
            }

            Organization targetOrg = organizationRepository.findById(childRequest.getTargetOrgId())
                    .orElseThrow(() -> new AppException(ErrorCode.ORG_NOT_FOUND));

            Batch childBatch = Batch.builder()
                    .batchCode(childRequest.getNewBatchCode())
                    .product(parent.getProduct())
                    .creatorOrg(org)
                    .currentOwnerOrg(targetOrg)
                    .productType(parent.getProductType())
                    .status(BatchStatus.CREATED)
                    .isActive(true)
                    .initialQuantity(childRequest.getQuantity())
                    .currentQuantity(childRequest.getQuantity())
                    .unit(parent.getUnit())
                    .build();

            childBatch = batchRepository.save(childBatch);
            children.add(childBatch);

            lineageRecords.add(BatchLineage.builder()
                    .id(new BatchLineageId(parent.getId(), childBatch.getId()))
                    .parentBatch(parent)
                    .childBatch(childBatch)
                    .actionType(LineageActionType.SPLIT)
                    .quantity(childRequest.getQuantity())
                    .build());

            childEvents.add(BatchEvent.builder()
                    .batch(childBatch)
                    .actorUser(actor)
                    .eventType(EventType.CREATED_FROM_SPLIT)
                    .metadata(Map.of(
                            "parent_batch_id", parent.getId(),
                            "parent_batch_code", parent.getBatchCode()))
                    .createdBy(actor.getEmail())
                    .build());
        }

        batchLineageRepository.saveAll(lineageRecords);
        batchEventRepository.saveAll(childEvents);

        BatchEvent parentEvent = BatchEvent.builder()
                .batch(parent)
                .actorUser(actor)
                .eventType(EventType.SPLIT)
                .metadata(Map.of(
                        "children_count", children.size(),
                        "total_split_quantity", totalSplitQuantity))
                .createdBy(actor.getEmail())
                .build();
        batchEventRepository.save(parentEvent);

        log.info("Tách lô [{}] thành {} lô con", parent.getBatchCode(), children.size());
        return children.stream().map(batchMapper::toBatchResponse).toList();
    }

    @Transactional(readOnly = true)
    public BatchTraceabilityNodeResponse getTraceabilityTree(UUID batchId) {
        Batch rootBatch = batchRepository.findById(batchId)
                .orElseThrow(() -> new AppException(ErrorCode.BATCH_NOT_FOUND));

        List<BatchLineageRepository.LineageEdgeRow> edges = batchLineageRepository.findUpstreamLineage(batchId);
        Set<UUID> batchIds = new HashSet<>();
        batchIds.add(batchId);
        edges.forEach(edge -> {
            batchIds.add(edge.getParentBatchId());
            batchIds.add(edge.getChildBatchId());
        });

        Map<UUID, Batch> batchMap = batchRepository.findAllById(batchIds).stream()
                .collect(Collectors.toMap(Batch::getId, batch -> batch));
        batchMap.putIfAbsent(batchId, rootBatch);

        Map<UUID, List<BatchLineageRepository.LineageEdgeRow>> edgesByChild = edges.stream()
                .collect(Collectors.groupingBy(BatchLineageRepository.LineageEdgeRow::getChildBatchId));

        return buildTraceabilityNode(batchId, batchMap, edgesByChild, new HashSet<>());
    }

    private BatchTraceabilityNodeResponse buildTraceabilityNode(
            UUID batchId,
            Map<UUID, Batch> batchMap,
            Map<UUID, List<BatchLineageRepository.LineageEdgeRow>> edgesByChild,
            Set<UUID> path) {
        if (!batchMap.containsKey(batchId)) {
            return null;
        }
        if (!path.add(batchId)) {
            return null;
        }

        Batch batch = batchMap.get(batchId);
        BatchTraceabilityNodeResponse node = new BatchTraceabilityNodeResponse();
        node.setBatchId(batch.getId());
        node.setBatchCode(batch.getBatchCode());
        node.setProductName(batch.getProduct().getName());
        node.setInitialQuantity(batch.getInitialQuantity());
        node.setCurrentQuantity(batch.getCurrentQuantity());
        node.setUnitCode(batch.getUnit() != null ? batch.getUnit().getCode() : null);

        List<BatchLineageRepository.LineageEdgeRow> edges = edgesByChild.getOrDefault(batchId, List.of());
        for (BatchLineageRepository.LineageEdgeRow edge : edges) {
            BatchTraceabilityNodeResponse parentNode = buildTraceabilityNode(
                    edge.getParentBatchId(), batchMap, edgesByChild, new HashSet<>(path));
            if (parentNode != null) {
                parentNode.setActionType(edge.getActionType());
                parentNode.setLineageQuantity(edge.getQuantity());
                node.getParents().add(parentNode);
            }
        }

        return node;
    }
}

