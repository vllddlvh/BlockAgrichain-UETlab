package BlockchainAgridence.uet.modules.traceability.service;

import BlockchainAgridence.uet.exception.AppException;
import BlockchainAgridence.uet.exception.ErrorCode;
import BlockchainAgridence.uet.modules.traceability.dto.response.LineageEdgeResponse;
import BlockchainAgridence.uet.modules.traceability.dto.response.PublicBatchResponse;
import BlockchainAgridence.uet.modules.traceability.dto.response.PublicEventResponse;
import BlockchainAgridence.uet.modules.traceability.dto.response.TraceabilityResponse;
import BlockchainAgridence.uet.modules.traceability.entity.Batch;
import BlockchainAgridence.uet.modules.traceability.entity.BatchEvent;
import BlockchainAgridence.uet.modules.traceability.entity.BatchLineage;
import BlockchainAgridence.uet.modules.traceability.repository.BatchEventRepository;
import BlockchainAgridence.uet.modules.traceability.repository.BatchLineageRepository;
import BlockchainAgridence.uet.modules.traceability.repository.BatchRepository;
import BlockchainAgridence.uet.modules.traceability.repository.TraceabilityRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class PublicTraceabilityService {

    TraceabilityRepository traceabilityRepository;
    BatchRepository batchRepository;
    BatchLineageRepository batchLineageRepository;
    BatchEventRepository batchEventRepository;

    @Transactional(readOnly = true)
    @Cacheable(value = "traceability", key = "#batchCode")
    public TraceabilityResponse getTraceabilityData(String batchCode) {
        log.info("Bắt đầu truy xuất phả hệ cho mã lô: {}", batchCode);

        // 1. Dùng WITH RECURSIVE SQL để lấy tất cả ID của lô hàng trong cây phả hệ
        List<UUID> batchIds = traceabilityRepository.findAllAncestorBatchIds(batchCode);

        if (batchIds == null || batchIds.isEmpty()) {
            throw new AppException(ErrorCode.BATCH_NOT_FOUND); // Lô hàng không tồn tại
        }

        // 2. Lấy thông tin lô hàng được quét (Scanned Batch) để biết ID chính xác
        Batch scannedBatch = batchRepository.findByBatchCode(batchCode)
                .orElseThrow(() -> new AppException(ErrorCode.BATCH_NOT_FOUND));

        // 3. Thực hiện 3 câu lệnh IN (...) cực nhanh
        List<Batch> batches = batchRepository.findAllById(batchIds);
        List<BatchLineage> lineages = batchLineageRepository.findByChildBatchIdInAndParentBatchIdIn(batchIds, batchIds);
        List<BatchEvent> events = batchEventRepository.findAllByBatchIdIn(batchIds);

        // 4. Map dữ liệu sang Flat DTO (Normalized JSON)
        
        // Map Batches
        Map<UUID, PublicBatchResponse> batchMap = batches.stream().collect(Collectors.toMap(
                Batch::getId,
                b -> PublicBatchResponse.builder()
                        .id(b.getId())
                        .batchCode(b.getBatchCode())
                        .productName(b.getProduct() != null ? b.getProduct().getName() : null)
                        .organizationName(b.getCreatorOrg() != null ? b.getCreatorOrg().getName() : null)
                        .productType(b.getProductType())
                        .status(b.getStatus())
                        .currentQuantity(b.getCurrentQuantity())
                        .unitCode(b.getUnit() != null ? b.getUnit().getCode() : null)
                        .onchainHash(b.getOnchainHash())
                        .build()
        ));

        // Map Lineage (Các cạnh của đồ thị)
        List<LineageEdgeResponse> lineageList = lineages.stream().map(l ->
                LineageEdgeResponse.builder()
                        .from(l.getParentBatch().getId())
                        .to(l.getChildBatch().getId())
                        .action(l.getActionType())
                        .quantity(l.getQuantity())
                        .build()
        ).collect(Collectors.toList());

        // Map Events (Sanitized)
        List<PublicEventResponse> eventList = events.stream().map(e ->
                PublicEventResponse.builder()
                        .batchId(e.getBatch().getId())
                        .eventType(e.getEventType())
                        .actorName(e.getCreatedBy()) // Đã loại bỏ ID và Email thực sự nếu createdBy là username hoặc email. (Giữ theo yêu cầu)
                        .gpsLatitude(e.getGpsLatitude())
                        .gpsLongitude(e.getGpsLongitude())
                        .imageCids(e.getImageCids())
                        .metadata(e.getMetadata())
                        .createdAt(e.getCreatedAt())
                        .onchainEventHash(e.getOnchainEventHash())
                        .build()
        ).collect(Collectors.toList());

        return TraceabilityResponse.builder()
                .scannedBatchId(scannedBatch.getId())
                .batches(batchMap)
                .lineage(lineageList)
                .events(eventList)
                .build();
    }
}
