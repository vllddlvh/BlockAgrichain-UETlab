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
import BlockchainAgridence.uet.modules.traceability.dto.request.BatchTransferRequest;
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
    BatchRiskService batchRiskService;

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
                Set.of(BatchStatus.DELIVERED, BatchStatus.DISTRIBUTED, BatchStatus.DEPLETED, BatchStatus.READY_FOR_SALE, BatchStatus.EXPIRED).contains(newStatus))
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

    private BatchResponse toBatchResponseWithRisk(Batch batch) {
        BatchResponse response = batchMapper.toBatchResponse(batch);
        BatchRiskService.RiskResult risk = batchRiskService.evaluate(batch);
        response.setRiskStatus(risk.getRiskStatus().name());
        response.setRiskReasons(risk.getRiskReasons());
        response.setRiskRecommendation(risk.getRiskRecommendation());
        return response;
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
        return toBatchResponseWithRisk(batch);
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
        
        BatchEvent savedEvent = batchEventRepository.saveAndFlush(event);
        String onchainHash = blockchainDataAnchorService.anchorBatchData(batch);
        
        BatchEventResponse response = batchMapper.toBatchEventResponse(savedEvent);
        response.setOnchainHash(onchainHash);
        
        return response;
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
        batchEventRepository.saveAndFlush(event);

        log.info("Lô hàng [{}]: {} → {}", batch.getBatchCode(), oldStatus, newStatus);

        String onchainHash = blockchainDataAnchorService.anchorBatchData(batch);

        BatchResponse response = toBatchResponseWithRisk(batch);
        response.setOnchainHash(onchainHash);
        return response;
    }

    @Transactional
    public BatchResponse transferBatch(UUID batchId, BatchTransferRequest request) {
        UUID userId = getAuthenticatedUserId();

        Batch batch = batchRepository.findById(batchId)
                .orElseThrow(() -> new AppException(ErrorCode.BATCH_NOT_FOUND));

        User actor = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        if (!batch.getCurrentOwnerOrg().getId().equals(actor.getOrganization().getId())) {
            log.warn("Security: User [{}] attempted to transfer batch [{}] owned by another org", userId, batchId);
            throw new AppException(ErrorCode.UNAUTHORIZED_ACCESS);
        }

        if (!batch.getIsActive()) {
            throw new AppException(ErrorCode.BATCH_INACTIVE);
        }

        Organization targetOrg = organizationRepository.findById(request.getTargetOrgId())
                .orElseThrow(() -> new AppException(ErrorCode.ORG_NOT_FOUND));

        Organization oldOrg = batch.getCurrentOwnerOrg();
        batch.setCurrentOwnerOrg(targetOrg);
        batch.setStatus(BatchStatus.IN_TRANSIT); // Force to IN_TRANSIT
        batch = batchRepository.save(batch);

        BatchEvent event = BatchEvent.builder()
                .batch(batch)
                .actorUser(actor)
                .eventType(EventType.TRANSPORTING)
                .createdBy(actor.getEmail())
                .metadata(Map.of(
                        "old_owner_org_id", oldOrg.getId(),
                        "old_owner_org_name", oldOrg.getName(),
                        "new_owner_org_id", targetOrg.getId(),
                        "new_owner_org_name", targetOrg.getName(),
                        "transfer_type", "HANDSHAKE_TRANSFER"
                ))
                .build();
        batchEventRepository.saveAndFlush(event);

        log.info("Lô hàng [{}] được chuyển giao từ [{}] sang [{}]. Trạng thái -> IN_TRANSIT", batch.getBatchCode(), oldOrg.getName(), targetOrg.getName());

        String onchainHash = blockchainDataAnchorService.anchorBatchData(batch);

        BatchResponse response = toBatchResponseWithRisk(batch);
        response.setOnchainHash(onchainHash);
        
        return response;
    }

    @Transactional
    public BatchResponse receiveBatch(UUID batchId) {
        UUID userId = getAuthenticatedUserId();

        Batch batch = batchRepository.findById(batchId)
                .orElseThrow(() -> new AppException(ErrorCode.BATCH_NOT_FOUND));

        User actor = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        if (!batch.getCurrentOwnerOrg().getId().equals(actor.getOrganization().getId())) {
            log.warn("Security: User [{}] attempted to receive batch [{}] not owned by their org", userId, batchId);
            throw new AppException(ErrorCode.UNAUTHORIZED_ACCESS);
        }

        if (batch.getStatus() != BatchStatus.IN_TRANSIT) {
            throw new AppException(ErrorCode.BATCH_INVALID_STATUS_TRANSITION);
        }

        batch.setStatus(BatchStatus.READY_FOR_SALE);
        batch = batchRepository.save(batch);

        BatchEvent event = BatchEvent.builder()
                .batch(batch)
                .actorUser(actor)
                .eventType(EventType.STORED_AND_VERIFIED)
                .createdBy(actor.getEmail())
                .metadata(Map.of(
                        "action", "Nhận hàng vào kho",
                        "note", "Đã xác nhận đủ số lượng và chất lượng"
                ))
                .build();
        batchEventRepository.saveAndFlush(event);

        log.info("Lô hàng [{}] đã được nhận bởi [{}]. Trạng thái -> READY_FOR_SALE", batch.getBatchCode(), actor.getOrganization().getName());

        String onchainHash = blockchainDataAnchorService.anchorBatchData(batch);

        BatchResponse response = toBatchResponseWithRisk(batch);
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

        boolean isCurrentOwner = batch.getCurrentOwnerOrg().getId().equals(actor.getOrganization().getId());
        boolean isCreator = batch.getCreatorOrg().getId().equals(actor.getOrganization().getId());
        
        boolean isLatestEventActor = false;
        var events = batchEventRepository.findAllByBatchIdOrderByCreatedAtDesc(batchId);
        if (!events.isEmpty() && events.get(0).getActorUser().getOrganization().getId().equals(actor.getOrganization().getId())) {
            isLatestEventActor = true;
        }

        if (!isCurrentOwner && !isCreator && !isLatestEventActor) {
            throw new AppException(ErrorCode.UNAUTHORIZED_ACCESS);
        }

        String computedHash = blockchainDataAnchorService.anchorBatchData(batch);

        if (blockchainContractService.isConfigured()) {
            // Verify hash consistency: computed hash should match what FE signed
            if (!computedHash.equalsIgnoreCase(request.getDataHash())) {
                log.warn("Hash mismatch cho Batch [{}]: BE computed={}, FE sent={}",
                        batch.getBatchCode(), computedHash, request.getDataHash());
                throw new AppException(ErrorCode.BLOCKCHAIN_HASH_MISMATCH);
            }

            // Verify the hash was actually stored on-chain
            if (!blockchainContractService.verifyHash(batch.getBatchCode(), request.getDataHash())) {
                log.warn("Blockchain verify failed cho Batch [{}]: hash chưa được lưu trên smart contract",
                        batch.getBatchCode());
                throw new AppException(ErrorCode.BLOCKCHAIN_VERIFY_FAILED);
            }
        } else {
            // Blockchain chưa cấu hình — chế độ dev/demo, bỏ qua verification
            log.info("Blockchain chưa cấu hình, bỏ qua verification cho Batch [{}]. Lưu txHash trực tiếp.",
                    batch.getBatchCode());
        }

        batch.setBlockchainTxHash(request.getTxHash());
        batch.setBlockchainDataHash(request.getDataHash());
        batch.setBlockchainAnchoredAt(LocalDateTime.now());
        batch = batchRepository.save(batch);

        log.info("Đã xác nhận neo blockchain cho Batch [{}]. TxHash: {}", batch.getBatchCode(), request.getTxHash());

        BatchResponse response = toBatchResponseWithRisk(batch);
        response.setOnchainHash(computedHash);
        return response;
    }

    @Transactional(readOnly = true)
    public BatchResponse getBatchDetail(UUID batchId) {
        Batch batch = batchRepository.findById(batchId)
                .orElseThrow(() -> new AppException(ErrorCode.BATCH_NOT_FOUND));
        return toBatchResponseWithRisk(batch);
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
                .map(this::toBatchResponseWithRisk)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<BatchResponse> getBatchHistoryByOrgId() {
        UUID orgId = getAuthenticatedOrgId();
        return batchRepository.findBatchesByOrgInvolvement(orgId)
                .stream()
                .map(this::toBatchResponseWithRisk)
                .toList();
    }
}
