package BlockchainAgridence.uet.modules.traceability.service;

import BlockchainAgridence.uet.exception.AppException;
import BlockchainAgridence.uet.exception.ErrorCode;
import BlockchainAgridence.uet.modules.identity.entity.Organization;
import BlockchainAgridence.uet.modules.identity.entity.User;
import BlockchainAgridence.uet.modules.identity.repository.OrganizationRepository;
import BlockchainAgridence.uet.modules.identity.repository.UserRepository;
import BlockchainAgridence.uet.modules.masterdata.entity.MasterUnit;
import BlockchainAgridence.uet.modules.masterdata.repository.MasterUnitRepository;
import BlockchainAgridence.uet.modules.traceability.dto.request.BatchCreateRequest;
import BlockchainAgridence.uet.modules.traceability.dto.request.BatchEventRequest;
import BlockchainAgridence.uet.modules.traceability.dto.request.BlockchainAnchorConfirmRequest;
import BlockchainAgridence.uet.modules.traceability.dto.response.BatchEventResponse;
import BlockchainAgridence.uet.modules.traceability.dto.response.BatchResponse;
import BlockchainAgridence.uet.modules.traceability.mapper.BatchMapper;
import BlockchainAgridence.uet.modules.traceability.entity.*;
import BlockchainAgridence.uet.modules.traceability.repository.BatchEventRepository;
import BlockchainAgridence.uet.modules.traceability.repository.BatchRepository;
import BlockchainAgridence.uet.modules.traceability.repository.ProductRepository;
import BlockchainAgridence.uet.shared.utils.SecurityUtils;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.EnumMap;
import java.util.EnumSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class BatchService {

    // ---------------------------------------------------------------
    // Status transition state machine
    // ---------------------------------------------------------------
    private static final Map<BatchStatus, Set<BatchStatus>> ALLOWED_TRANSITIONS;
    static {
        ALLOWED_TRANSITIONS = new EnumMap<>(BatchStatus.class);
        ALLOWED_TRANSITIONS.put(BatchStatus.CREATED,
                EnumSet.of(BatchStatus.GROWING, BatchStatus.READY_FOR_SALE, BatchStatus.IN_TRANSIT, BatchStatus.EXPIRED));
        ALLOWED_TRANSITIONS.put(BatchStatus.GROWING,
                EnumSet.of(BatchStatus.READY_FOR_SALE, BatchStatus.EXPIRED));
        ALLOWED_TRANSITIONS.put(BatchStatus.READY_FOR_SALE,
                EnumSet.of(BatchStatus.IN_TRANSIT, BatchStatus.DISTRIBUTED, BatchStatus.DEPLETED, BatchStatus.EXPIRED));
        ALLOWED_TRANSITIONS.put(BatchStatus.IN_TRANSIT,
                EnumSet.of(BatchStatus.DELIVERED, BatchStatus.DISTRIBUTED, BatchStatus.EXPIRED));
        ALLOWED_TRANSITIONS.put(BatchStatus.DISTRIBUTED,
                EnumSet.of(BatchStatus.IN_TRANSIT, BatchStatus.DELIVERED, BatchStatus.DEPLETED, BatchStatus.EXPIRED));
        ALLOWED_TRANSITIONS.put(BatchStatus.DELIVERED,
                EnumSet.of(BatchStatus.DEPLETED));
        ALLOWED_TRANSITIONS.put(BatchStatus.DEPLETED, EnumSet.noneOf(BatchStatus.class));
        ALLOWED_TRANSITIONS.put(BatchStatus.EXPIRED, EnumSet.noneOf(BatchStatus.class));
    }

    BatchRepository batchRepository;
    BatchEventRepository batchEventRepository;
    ProductRepository productRepository;
    OrganizationRepository organizationRepository;
    UserRepository userRepository;
    MasterUnitRepository masterUnitRepository;
    BatchMapper batchMapper;
    BlockchainDataAnchorService blockchainDataAnchorService;
    BlockchainContractService blockchainContractService;

    private UUID getAuthenticatedUserId() {
        UUID userId = SecurityUtils.getCurrentUserId();
        if (userId == null) throw new AppException(ErrorCode.UNAUTHENTICATED);
        return userId;
    }

    private UUID getAuthenticatedOrgId() {
        UUID orgId = SecurityUtils.getCurrentUserOrgId();
        if (orgId == null) throw new AppException(ErrorCode.UNAUTHENTICATED);
        return orgId;
    }

    private void validateStatusTransition(BatchStatus current, BatchStatus next) {
        Set<BatchStatus> allowed = ALLOWED_TRANSITIONS.getOrDefault(current, EnumSet.noneOf(BatchStatus.class));
        if (!allowed.contains(next)) {
            log.warn("Chuyển trạng thái không hợp lệ: {} → {}", current, next);
            throw new AppException(ErrorCode.INVALID_STATUS_TRANSITION);
        }
    }

    // FARM_ADMIN: farm stages  |  TRANSPORT_ADMIN: logistics  |  RETAIL_ADMIN: final delivery
    private void validateRoleForStatus(BatchStatus newStatus) {
        List<String> roles = SecurityUtils.getCurrentUserRoles();
        if (roles.contains("ORG_ADMIN")) return; // platform admin can set any status

        boolean authorized = false;
        if (roles.contains("FARM_ADMIN") &&
                Set.of(BatchStatus.GROWING, BatchStatus.READY_FOR_SALE, BatchStatus.EXPIRED).contains(newStatus))
            authorized = true;
        if (roles.contains("TRANSPORT_ADMIN") &&
                Set.of(BatchStatus.IN_TRANSIT, BatchStatus.DISTRIBUTED, BatchStatus.EXPIRED).contains(newStatus))
            authorized = true;
        if (roles.contains("RETAIL_ADMIN") &&
                Set.of(BatchStatus.DELIVERED, BatchStatus.EXPIRED).contains(newStatus))
            authorized = true;
        if (roles.contains("STAFF") &&
                Set.of(BatchStatus.GROWING, BatchStatus.READY_FOR_SALE,
                        BatchStatus.IN_TRANSIT, BatchStatus.DISTRIBUTED, BatchStatus.EXPIRED).contains(newStatus))
            authorized = true;

        if (!authorized) {
            log.warn("Vai trò {} không được phép chuyển sang trạng thái {}", roles, newStatus);
            throw new AppException(ErrorCode.ROLE_NOT_AUTHORIZED_FOR_STATUS);
        }
    }

    @Transactional
    public BatchResponse createBatch(BatchCreateRequest request) {
        UUID orgId = getAuthenticatedOrgId();
        UUID userId = getAuthenticatedUserId();

        if (batchRepository.existsByBatchCode(request.getBatchCode())) {
            throw new AppException(ErrorCode.BATCH_CODE_ALREADY_EXISTS);
        }

        Organization org = organizationRepository.findById(orgId)
                .orElseThrow(() -> new AppException(ErrorCode.ORG_NOT_FOUND));

        User actor = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        Product product = productRepository.findByIdAndOrganizationId(request.getProductId(), orgId)
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));

        MasterUnit unit = masterUnitRepository.findById(request.getUnitId())
                .orElseThrow(() -> new AppException(ErrorCode.UNIT_NOT_FOUND));

        Batch batch = Batch.builder()
                .batchCode(request.getBatchCode())
                .product(product)
                .creatorOrg(org)
                .currentOwnerOrg(org)
                .productType(request.getProductType())
                .status(BatchStatus.CREATED)
                .isActive(true)
                .initialQuantity(request.getInitialQuantity())
                .currentQuantity(request.getInitialQuantity())
                .unit(unit)
                .expiryDate(request.getExpiryDate())
                .build();

        batch = batchRepository.save(batch);

        BatchEvent initialEvent = BatchEvent.builder()
                .batch(batch)
                .actorUser(actor)
                .eventType(EventType.CREATED)
                .createdBy(actor.getEmail())
                .metadata(Map.of("initial_quantity", request.getInitialQuantity(), "unit_code", unit.getCode()))
                .build();
        batchEventRepository.save(initialEvent);

        log.info("Lô hàng mới [{}] được tạo bởi [{}] thuộc Org [{}]", batch.getBatchCode(), actor.getEmail(), org.getName());
        return batchMapper.toBatchResponse(batch);
    }

    @Transactional
    public BatchEventResponse appendEvent(UUID batchId, BatchEventRequest request) {
        UUID userId = getAuthenticatedUserId();

        Batch batch = batchRepository.findById(batchId)
                .orElseThrow(() -> new AppException(ErrorCode.BATCH_NOT_FOUND));

        if (!batch.getIsActive()) {
            throw new AppException(ErrorCode.BATCH_INACTIVE);
        }

        // DELIVERED and EXPIRED batches are immutable — no new events allowed
        if (batch.getStatus() == BatchStatus.DELIVERED || batch.getStatus() == BatchStatus.EXPIRED) {
            throw new AppException(ErrorCode.BATCH_NOT_MODIFIABLE);
        }

        User actor = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        if (!batch.getCurrentOwnerOrg().getId().equals(actor.getOrganization().getId())) {
            log.warn("Security: User [{}] attempted to modify batch [{}] owned by another org", userId, batchId);
            throw new AppException(ErrorCode.UNAUTHORIZED_ACCESS);
        }

        BatchEvent event = BatchEvent.builder()
                .batch(batch)
                .actorUser(actor)
                .eventType(request.getEventType())
                .gpsLatitude(request.getGpsLatitude())
                .gpsLongitude(request.getGpsLongitude())
                .deviceInfo(request.getDeviceInfo())
                .imageCids(request.getImageCids())
                .metadata(request.getMetadata())
                .createdBy(actor.getEmail())
                .build();

        log.info("Sự kiện [{}] ghi nhận cho Lô [{}]", request.getEventType(), batch.getBatchCode());
        return batchMapper.toBatchEventResponse(batchEventRepository.save(event));
    }

    @Transactional
    public BatchResponse updateBatchStatus(UUID batchId, BatchStatus newStatus) {
        UUID userId = getAuthenticatedUserId();

        Batch batch = batchRepository.findById(batchId)
                .orElseThrow(() -> new AppException(ErrorCode.BATCH_NOT_FOUND));

        User actor = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        if (!batch.getCurrentOwnerOrg().getId().equals(actor.getOrganization().getId())) {
            log.warn("Security: User [{}] attempted status change on batch [{}] owned by another org", userId, batchId);
            throw new AppException(ErrorCode.UNAUTHORIZED_ACCESS);
        }

        // 1. Validate state machine transition
        validateStatusTransition(batch.getStatus(), newStatus);
        // 2. Validate caller's role is allowed to set this status
        validateRoleForStatus(newStatus);

        BatchStatus oldStatus = batch.getStatus();
        batch.setStatus(newStatus);
        batch = batchRepository.save(batch);

        BatchEvent event = BatchEvent.builder()
                .batch(batch)
                .actorUser(actor)
                .eventType(EventType.TRANSFORMED)
                .createdBy(actor.getEmail())
                .metadata(Map.of("old_status", oldStatus.name(), "new_status", newStatus.name()))
                .build();
        batchEventRepository.save(event);

        log.info("Lô hàng [{}]: {} → {}", batch.getBatchCode(), oldStatus, newStatus);

        String onchainHash = null;
        if (newStatus == BatchStatus.READY_FOR_SALE || newStatus == BatchStatus.DELIVERED || newStatus == BatchStatus.DEPLETED) {
            onchainHash = blockchainDataAnchorService.anchorBatchData(batch);
        }

        BatchResponse response = batchMapper.toBatchResponse(batch);
        response.setOnchainHash(onchainHash);
        return response;
    }

    @Transactional
    public BatchResponse confirmBlockchainAnchor(UUID batchId, BlockchainAnchorConfirmRequest request) {
        UUID userId = getAuthenticatedUserId();

        Batch batch = batchRepository.findById(batchId)
                .orElseThrow(() -> new AppException(ErrorCode.BATCH_NOT_FOUND));

        User actor = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        if (!batch.getCurrentOwnerOrg().getId().equals(actor.getOrganization().getId())) {
            throw new AppException(ErrorCode.UNAUTHORIZED_ACCESS);
        }

        if (!blockchainContractService.isConfigured()) {
            throw new AppException(ErrorCode.BLOCKCHAIN_NOT_CONFIGURED);
        }

        String computedHash = blockchainDataAnchorService.anchorBatchData(batch);
        if (!computedHash.equalsIgnoreCase(request.getDataHash())) {
            throw new AppException(ErrorCode.BLOCKCHAIN_HASH_MISMATCH);
        }

        if (!blockchainContractService.verifyHash(batch.getBatchCode(), request.getDataHash())) {
            throw new AppException(ErrorCode.BLOCKCHAIN_VERIFY_FAILED);
        }

        batch.setBlockchainTxHash(request.getTxHash());
        batch.setBlockchainDataHash(request.getDataHash());
        batch.setBlockchainAnchoredAt(LocalDateTime.now());
        batch = batchRepository.save(batch);

        BatchResponse response = batchMapper.toBatchResponse(batch);
        response.setOnchainHash(computedHash);
        return response;
    }

    @Transactional(readOnly = true)
    public BatchResponse getBatchDetail(UUID batchId) {
        Batch batch = batchRepository.findById(batchId)
                .orElseThrow(() -> new AppException(ErrorCode.BATCH_NOT_FOUND));
        return batchMapper.toBatchResponse(batch);
    }

    @Transactional(readOnly = true)
    public List<BatchEventResponse> getBatchEvents(UUID batchId) {
        return batchEventRepository.findAllByBatchIdOrderByCreatedAtDesc(batchId)
                .stream()
                .map(batchMapper::toBatchEventResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<BatchResponse> getBatchesByOrgId() {
        UUID orgId = getAuthenticatedOrgId();
        return batchRepository.findAllByCurrentOwnerOrgId(orgId)
                .stream()
                .map(batchMapper::toBatchResponse)
                .toList();
    }
}
