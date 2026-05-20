package BlockchainAgridence.uet.modules.traceability.service;

import BlockchainAgridence.uet.exception.AppException;
import BlockchainAgridence.uet.exception.ErrorCode;
import BlockchainAgridence.uet.modules.identity.entity.Organization;
import BlockchainAgridence.uet.modules.identity.repository.OrganizationRepository;
import BlockchainAgridence.uet.modules.masterdata.entity.MasterProductCategory;
import BlockchainAgridence.uet.modules.masterdata.repository.MasterProductCategoryRepository;
import BlockchainAgridence.uet.modules.traceability.dto.request.ProductRequest;
import BlockchainAgridence.uet.modules.traceability.dto.response.ProductResponse;
import BlockchainAgridence.uet.modules.traceability.entity.Product;
import BlockchainAgridence.uet.modules.traceability.mapper.ProductMapper;
import BlockchainAgridence.uet.modules.traceability.repository.ProductRepository;
import BlockchainAgridence.uet.shared.utils.SecurityUtils;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ProductService {

    ProductRepository productRepository;
    OrganizationRepository organizationRepository;
    MasterProductCategoryRepository categoryRepository;
    ProductMapper productMapper;

    /**
     * Lấy orgId từ JWT token của người đang đăng nhập.
     * Ném UNAUTHENTICATED nếu không tìm thấy orgId trong token (user chưa thuộc tổ chức nào).
     */
    private UUID getAuthenticatedOrgId() {
        UUID orgId = SecurityUtils.getCurrentUserOrgId();
        if (orgId == null) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }
        return orgId;
    }

    /**
     * Resolve categoryId (UUID) từ request thành MasterProductCategory entity.
     * Trả về null nếu categoryId không được truyền (chưa phân loại).
     */
    private MasterProductCategory resolveCategory(UUID categoryId) {
        if (categoryId == null) {
            return null;
        }
        return categoryRepository.findById(categoryId)
                .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));
    }

    @Transactional
    public ProductResponse createProduct(ProductRequest request) {
        UUID orgId = getAuthenticatedOrgId();

        // 1. Kiểm tra mã SKU đã tồn tại trong tổ chức này chưa
        if (productRepository.existsByOrganizationIdAndSkuCode(orgId, request.getSkuCode())) {
            throw new AppException(ErrorCode.SKU_ALREADY_EXISTS);
        }

        // 2. Lấy thông tin tổ chức (để gắn vào khóa ngoại)
        Organization org = organizationRepository.findById(orgId)
                .orElseThrow(() -> new AppException(ErrorCode.ORG_NOT_FOUND));

        // 3. Map request sang Entity và gắn quan hệ
        Product product = productMapper.toEntity(request);
        product.setOrganization(org);
        product.setCategory(resolveCategory(request.getCategoryId()));

        // 4. Lưu xuống DB
        product = productRepository.save(product);
        log.info("Tổ chức [{}] đã tạo sản phẩm mới: [{}]", orgId, product.getName());

        return productMapper.toResponse(product);
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> getProductsByOrgId() {
        UUID orgId = getAuthenticatedOrgId();

        return productRepository.findAllByOrganizationId(orgId)
                .stream()
                .map(productMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ProductResponse getProductByIdAndOrgId(UUID productId) {
        UUID orgId = getAuthenticatedOrgId();

        Product product = productRepository.findByIdAndOrganizationId(productId, orgId)
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));
        return productMapper.toResponse(product);
    }

    @Transactional
    public ProductResponse updateProduct(UUID productId, ProductRequest request) {
        UUID orgId = getAuthenticatedOrgId();

        Product product = productRepository.findByIdAndOrganizationId(productId, orgId)
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));

        // Kiểm tra SKU update có bị trùng với sản phẩm KHÁC trong cùng tổ chức không
        if (productRepository.existsByOrganizationIdAndSkuCodeAndIdNot(orgId, request.getSkuCode(), productId)) {
            throw new AppException(ErrorCode.SKU_ALREADY_EXISTS);
        }

        // Update Entity
        productMapper.updateEntity(product, request);
        product.setCategory(resolveCategory(request.getCategoryId()));
        product = productRepository.save(product);

        log.info("Sản phẩm [{}] đã được cập nhật bởi tổ chức [{}]", productId, orgId);
        return productMapper.toResponse(product);
    }
}
