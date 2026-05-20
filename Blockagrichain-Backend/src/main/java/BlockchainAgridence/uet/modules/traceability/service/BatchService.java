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

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class BatchService {

    BatchRepository batchRepository;
    BatchEventRepository batchEventRepository;
    ProductRepository productRepository;
    OrganizationRepository organizationRepository;
    UserRepository userRepository;
    MasterUnitRepository masterUnitRepository;
    BatchMapper batchMapper;

    /**
     * Lấy userId từ JWT token của người đang đăng nhập.
     * Ném UNAUTHENTICATED nếu không tìm thấy.
     */
    private UUID getAuthenticatedUserId() {
        UUID userId = SecurityUtils.getCurrentUserId();
        if (userId == null) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }
        return userId;
    }

    /**
     * Lấy orgId từ JWT token của người đang đăng nhập.
     * Ném UNAUTHENTICATED nếu user chưa thuộc tổ chức nào.
     */
    private UUID getAuthenticatedOrgId() {
        UUID orgId = SecurityUtils.getCurrentUserOrgId();
        if (orgId == null) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }
        return orgId;
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

        // 1. Khởi tạo Lô hàng
        Batch batch = Batch.builder()
                .batchCode(request.getBatchCode())
                .product(product)
                .creatorOrg(org)
                .currentOwnerOrg(org) // Mới tạo thì tổ chức khởi tạo đang giữ hàng
                .productType(request.getProductType())
                .status(BatchStatus.CREATED)
                .isActive(true)
                .initialQuantity(request.getInitialQuantity())
                .currentQuantity(request.getInitialQuantity())
                .unit(unit)
                .build();

        batch = batchRepository.save(batch);

        // 2. Tự động sinh Sự kiện đầu tiên (Event Sourcing)
        BatchEvent initialEvent = BatchEvent.builder()
                .batch(batch)
                .actorUser(actor)
                .eventType(EventType.CREATED)
                .createdBy(actor.getEmail())
                .metadata(Map.of("initial_quantity", request.getInitialQuantity(), "unit_code", unit.getCode()))
                .build();

        batchEventRepository.save(initialEvent);

        log.info("Lô hàng mới [{}] đã được tạo bởi User [{}] thuộc Org [{}]", batch.getBatchCode(), actor.getEmail(), org.getName());
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

        User actor = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        // BẢO MẬT: Kiểm tra quyền sở hữu lô hàng — so sánh với orgId trong JWT
        if (!batch.getCurrentOwnerOrg().getId().equals(actor.getOrgId())) {
            log.warn("Cảnh báo bảo mật: User [{}] cố ý thao tác lên lô hàng [{}] của tổ chức khác!", userId, batchId);
            throw new AppException(ErrorCode.UNAUTHORIZED_ACCESS); // HTTP 403
        }

        // Tạo sự kiện mới (Tuyệt đối không Update bảng batches)
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

        log.info("Sự kiện [{}] đã được ghi nhận cho Lô [{}]", request.getEventType(), batch.getBatchCode());
        return batchMapper.toBatchEventResponse(batchEventRepository.save(event));
    }

    @Transactional
    public BatchResponse updateBatchStatus(UUID batchId, BatchStatus newStatus) {
        UUID userId = getAuthenticatedUserId();

        Batch batch = batchRepository.findById(batchId)
                .orElseThrow(() -> new AppException(ErrorCode.BATCH_NOT_FOUND));

        User actor = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        // BẢO MẬT: Kiểm tra quyền sở hữu lô hàng — so sánh với orgId trong JWT
        if (!batch.getCurrentOwnerOrg().getId().equals(actor.getOrgId())) {
            log.warn("Cảnh báo bảo mật: User [{}] cố ý đổi trạng thái lô hàng [{}] của tổ chức khác!", userId, batchId);
            throw new AppException(ErrorCode.UNAUTHORIZED_ACCESS); // HTTP 403
        }

        BatchStatus oldStatus = batch.getStatus();
        batch.setStatus(newStatus);
        batch = batchRepository.save(batch);

        // Bắn sự kiện chuyển trạng thái để lưu vết lịch sử
        BatchEvent event = BatchEvent.builder()
                .batch(batch)
                .actorUser(actor)
                .eventType(EventType.TRANSFORMED)
                .createdBy(actor.getEmail())
                .metadata(Map.of("old_status", oldStatus, "new_status", newStatus.name()))
                .build();
        batchEventRepository.save(event);

        log.info("Lô hàng [{}] đã chuyển sang trạng thái [{}]", batch.getBatchCode(), newStatus.name());
        return batchMapper.toBatchResponse(batch);
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
}
