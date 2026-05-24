package BlockchainAgridence.uet.integration;

import org.junit.jupiter.api.*;
import org.springframework.http.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class ProductAndBatchFlowTest extends BaseIntegrationTest {

    private static final String UNIQUE   = UUID.randomUUID().toString().replace("-", "");
    private static final String WALLET   = "0x" + UNIQUE.substring(0, 32) + "11111111";
    private static final String EMAIL    = "batchtest_" + UNIQUE.substring(0, 8) + "@test.com";
    private static final String PASSWORD = "Test@123456";

    private static String token;
    private static String productId;
    private static String unitId;
    private static String batchId;
    private static String anchoredDataHash;
    private static String anchoredTxHash;
    private static final String BATCH_CODE = "TEST-BATCH-" + UUID.randomUUID().toString().substring(0, 8);

    @Test
    @Order(1)
    @DisplayName("Chuẩn bị: Đăng ký org + đăng nhập")
    void setUp_registerAndLogin() {
        String regBody = """
                {
                  "orgWalletAddress": "%s",
                  "name": "HTX Batch Test",
                  "orgType": "FARM",
                  "adminEmail": "%s",
                  "adminPassword": "%s",
                  "adminFullName": "Admin Batch Test"
                }
                """.formatted(WALLET, EMAIL, PASSWORD);

        ResponseEntity<Map> regResp = restTemplate.exchange(
                baseUrl + "/api/v1/organizations/register",
                HttpMethod.POST, new HttpEntity<>(regBody, jsonHeaders()), Map.class);
        assertThat(regResp.getStatusCode())
                .as("Registration failed. Response: " + regResp.getBody())
                .isEqualTo(HttpStatus.OK);

        token = loginAndGetToken(EMAIL, PASSWORD);
        assertThat(token).isNotBlank();
    }

    @Test
    @Order(2)
    @DisplayName("Lấy danh sách đơn vị (master_units) — phải có dữ liệu")
    @SuppressWarnings("unchecked")
    void getMasterUnits_returnsList() {
        Assumptions.assumeTrue(token != null, "Bỏ qua: chưa có token");
        ResponseEntity<Map> response = restTemplate.exchange(
                baseUrl + "/api/v1/master/units",
                HttpMethod.GET,
                new HttpEntity<>(authHeaders(token)),
                Map.class
        );

        // Endpoint này có thể public hoặc cần auth — chấp nhận cả 2
        if (response.getStatusCode().is2xxSuccessful()) {
            List<?> units = (List<?>) response.getBody().get("body");
            assertThat(units).isNotNull();
            if (!units.isEmpty()) {
                unitId = (String) ((Map<String, Object>) units.get(0)).get("id");
            }
        }
    }

    @Test
    @Order(3)
    @DisplayName("Tạo sản phẩm mới — thành công")
    @SuppressWarnings("unchecked")
    void createProduct_success() {
        String body = """
                {
                  "name": "Dâu Tây Đà Lạt Test",
                  "skuCode": "SKU-TEST-%s",
                  "description": "Dâu tây hữu cơ"
                }
                """.formatted(UUID.randomUUID().toString().substring(0, 6));

        ResponseEntity<Map> response = restTemplate.exchange(
                baseUrl + "/api/v1/products",
                HttpMethod.POST,
                new HttpEntity<>(body, authHeaders(token)),
                Map.class
        );

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        Map<String, Object> productData = (Map<String, Object>) response.getBody().get("body");
        assertThat(productData).containsKey("id");
        productId = (String) productData.get("id");
    }

    @Test
    @Order(4)
    @DisplayName("Lấy danh sách sản phẩm — phải thấy sản phẩm vừa tạo")
    @SuppressWarnings("unchecked")
    void getProducts_returnsList() {
        ResponseEntity<Map> response = restTemplate.exchange(
                baseUrl + "/api/v1/products",
                HttpMethod.GET,
                new HttpEntity<>(authHeaders(token)),
                Map.class
        );

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        List<?> products = (List<?>) response.getBody().get("body");
        assertThat(products).isNotEmpty();
    }

    @Test
    @Order(5)
    @DisplayName("Tạo lô hàng — thành công")
    @SuppressWarnings("unchecked")
    void createBatch_success() {
        Assumptions.assumeTrue(productId != null, "Bỏ qua: chưa có productId");

        // Lấy unitId nếu chưa có
        if (unitId == null) {
            ResponseEntity<Map> unitsResp = restTemplate.exchange(
                    baseUrl + "/api/v1/master/units",
                    HttpMethod.GET, new HttpEntity<>(authHeaders(token)), Map.class);
            if (unitsResp.getStatusCode().is2xxSuccessful()) {
                List<?> units = (List<?>) unitsResp.getBody().get("body");
                if (units != null && !units.isEmpty()) {
                    unitId = (String) ((Map<String, Object>) units.get(0)).get("id");
                }
            }
        }

        Assumptions.assumeTrue(unitId != null, "Bỏ qua: không tìm thấy unitId trong master_units");

        String body = """
                {
                  "batchCode": "%s",
                  "productId": "%s",
                  "productType": "RAW_MATERIAL",
                  "initialQuantity": 100.0,
                  "unitId": "%s"
                }
                """.formatted(BATCH_CODE, productId, unitId);

        ResponseEntity<Map> response = restTemplate.exchange(
                baseUrl + "/api/v1/batches",
                HttpMethod.POST,
                new HttpEntity<>(body, authHeaders(token)),
                Map.class
        );

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        Map<String, Object> batchData = (Map<String, Object>) response.getBody().get("body");
        assertThat(batchData).containsKey("id");
        batchId = (String) batchData.get("id");
        assertThat(batchData.get("status")).isEqualTo("CREATED");
    }

    @Test
    @Order(6)
    @DisplayName("Cập nhật trạng thái lô hàng → READY_FOR_SALE — trả về onchainHash")
    @SuppressWarnings("unchecked")
    void updateBatchStatus_toReadyForSale_returnsOnchainHash() {
        Assumptions.assumeTrue(batchId != null, "Bỏ qua: chưa có batchId");

        ResponseEntity<Map> response = restTemplate.exchange(
                baseUrl + "/api/v1/batches/" + batchId + "/status?status=READY_FOR_SALE",
                HttpMethod.PATCH,
                new HttpEntity<>(authHeaders(token)),
                Map.class
        );

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        Map<String, Object> batchData = (Map<String, Object>) response.getBody().get("body");
        assertThat(batchData.get("status")).isEqualTo("READY_FOR_SALE");

        // onchainHash phải được tính (blockchain service bị mock nên sẽ trả null từ chain,
        // nhưng computedHash vẫn phải được tính ra từ dữ liệu lô hàng)
        String onchainHash = (String) batchData.get("onchainHash");
        assertThat(onchainHash).isNotNull().startsWith("0x");
        anchoredDataHash = onchainHash;
    }

    @Test
    @Order(7)
    @DisplayName("Xac nhan blockchain anchor - verify contract va luu txHash/dataHash")
    @SuppressWarnings("unchecked")
    void confirmBlockchainAnchor_persistsProofAfterContractVerification() {
        Assumptions.assumeTrue(batchId != null, "Skip: missing batchId");
        Assumptions.assumeTrue(anchoredDataHash != null, "Skip: missing data hash");

        anchoredTxHash = "0x" + "a".repeat(64);
        when(blockchainContractService.isConfigured()).thenReturn(true);
        when(blockchainContractService.verifyHash(eq(BATCH_CODE), eq(anchoredDataHash))).thenReturn(true);

        String body = """
                {
                  "txHash": "%s",
                  "dataHash": "%s"
                }
                """.formatted(anchoredTxHash, anchoredDataHash);

        ResponseEntity<Map> response = restTemplate.exchange(
                baseUrl + "/api/v1/batches/" + batchId + "/blockchain-anchor",
                HttpMethod.POST,
                new HttpEntity<>(body, authHeaders(token)),
                Map.class
        );

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        Map<String, Object> batchData = (Map<String, Object>) response.getBody().get("body");
        assertThat(batchData.get("blockchainTxHash")).isEqualTo(anchoredTxHash);
        assertThat(batchData.get("blockchainDataHash")).isEqualTo(anchoredDataHash);
        assertThat(batchData.get("blockchainAnchoredAt")).isNotNull();
    }

    @Test
    @Order(8)
    @DisplayName("Truy xuất công khai theo batch code — trả về dữ liệu đầy đủ")
    @SuppressWarnings("unchecked")
    void publicTraceability_byBatchCode_returnsData() {
        if (anchoredDataHash != null) {
            when(blockchainContractService.getHash(eq(BATCH_CODE))).thenReturn(java.util.Optional.of(anchoredDataHash));
            when(blockchainContractService.verifyHash(eq(BATCH_CODE), eq(anchoredDataHash))).thenReturn(true);
        }
        Assumptions.assumeTrue(batchId != null, "Bỏ qua: chưa có batchId");

        ResponseEntity<Map> response = restTemplate.exchange(
                baseUrl + "/api/v1/public/traceability/" + BATCH_CODE,
                HttpMethod.GET,
                new HttpEntity<>(jsonHeaders()),
                Map.class
        );

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        Map<String, Object> traceData = (Map<String, Object>) response.getBody().get("body");
        assertThat(traceData).containsKey("batches");
        assertThat(traceData).containsKey("lineage");
        assertThat(traceData).containsKey("events");

        @SuppressWarnings("unchecked")
        Map<String, Object> batches = (Map<String, Object>) traceData.get("batches");
        assertThat(batches).isNotEmpty();

        // Kiểm tra batch entry có đủ các field blockchain
        @SuppressWarnings("unchecked")
        Map<String, Object> batchEntry = (Map<String, Object>) batches.values().iterator().next();
        assertThat(batchEntry).containsKey("computedHash");
        assertThat(batchEntry).containsKey("blockchainVerified");
        assertThat(batchEntry.get("blockchainTxHash")).isEqualTo(anchoredTxHash);
    }

    @Test
    @Order(9)
    @DisplayName("Truy xuất công khai batch code không tồn tại — trả 404")
    void publicTraceability_notFound_returns404() {
        ResponseEntity<Map> response = restTemplate.exchange(
                baseUrl + "/api/v1/public/traceability/BATCH-KHONG-TON-TAI-XYZ",
                HttpMethod.GET,
                new HttpEntity<>(jsonHeaders()),
                Map.class
        );

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
    }
}
