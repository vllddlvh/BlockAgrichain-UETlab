package BlockchainAgridence.uet.modules.traceability.repository;

import BlockchainAgridence.uet.modules.traceability.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProductRepository extends JpaRepository<Product, UUID> {

    // Lấy danh sách sản phẩm theo ID của tổ chức (Multi-tenancy)
    List<Product> findAllByOrganizationId(UUID orgId);

    // Tìm chi tiết 1 sản phẩm của 1 tổ chức cụ thể
    Optional<Product> findByIdAndOrganizationId(UUID id, UUID orgId);

    // Kiểm tra trùng mã SKU trong nội bộ 1 tổ chức
    boolean existsByOrganizationIdAndSkuCode(UUID orgId, String skuCode);

    // Kiểm tra trùng mã SKU (Dùng khi update, loại trừ ID hiện tại)
    boolean existsByOrganizationIdAndSkuCodeAndIdNot(UUID orgId, String skuCode, UUID id);
}
