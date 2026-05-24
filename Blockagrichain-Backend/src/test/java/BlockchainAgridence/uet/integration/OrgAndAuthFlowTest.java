package BlockchainAgridence.uet.integration;

import org.junit.jupiter.api.*;
import org.springframework.http.*;

import java.util.Map;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class OrgAndAuthFlowTest extends BaseIntegrationTest {

    // Dùng UUID để tránh trùng data giữa các lần chạy test
    private static final String UNIQUE  = UUID.randomUUID().toString().replace("-", "");
    private static final String WALLET  = "0x" + UNIQUE.substring(0, 32) + "00000000";
    private static final String EMAIL   = "testadmin_" + UNIQUE.substring(0, 8) + "@test.com";
    private static final String PASSWORD = "Test@123456";

    @Test
    @Order(1)
    @DisplayName("Đăng ký tổ chức mới thành công")
    void registerOrganization_success() {
        String body = """
                {
                  "orgWalletAddress": "%s",
                  "name": "HTX Test %s",
                  "orgType": "FARM",
                  "adminEmail": "%s",
                  "adminPassword": "%s",
                  "adminFullName": "Nguyen Van Test"
                }
                """.formatted(WALLET, UUID.randomUUID().toString().substring(0, 6), EMAIL, PASSWORD);

        ResponseEntity<Map> response = restTemplate.exchange(
                baseUrl + "/api/v1/organizations/register",
                HttpMethod.POST,
                new HttpEntity<>(body, jsonHeaders()),
                Map.class
        );

        assertThat(response.getStatusCode())
                .as("Registration failed. Response: " + response.getBody())
                .isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).containsKey("body");
        @SuppressWarnings("unchecked")
        Map<String, Object> orgData = (Map<String, Object>) response.getBody().get("body");
        assertThat(orgData).containsKey("id");
        assertThat(orgData.get("name")).isNotNull();
    }

    @Test
    @Order(2)
    @DisplayName("Đăng ký trùng ví — phải trả 400")
    void registerOrganization_duplicateWallet_returns400() {
        String body = """
                {
                  "orgWalletAddress": "%s",
                  "name": "HTX Khac",
                  "orgType": "FARM",
                  "adminEmail": "another_%s@test.com",
                  "adminPassword": "%s",
                  "adminFullName": "Le Van Khac"
                }
                """.formatted(WALLET, UUID.randomUUID().toString().substring(0, 6), PASSWORD);

        ResponseEntity<Map> response = restTemplate.exchange(
                baseUrl + "/api/v1/organizations/register",
                HttpMethod.POST,
                new HttpEntity<>(body, jsonHeaders()),
                Map.class
        );

        assertThat(response.getStatusCode().is4xxClientError()).isTrue();
    }

    @Test
    @Order(3)
    @DisplayName("Đăng nhập đúng credentials — nhận được accessToken")
    void login_validCredentials_returnsToken() {
        String token = loginAndGetToken(EMAIL, PASSWORD);
        assertThat(token).isNotNull().isNotBlank();
    }

    @Test
    @Order(4)
    @DisplayName("Đăng nhập sai mật khẩu — phải trả lỗi")
    void login_wrongPassword_returnsError() {
        String body = """
                {"email": "%s", "password": "SaiMatKhau123!"}
                """.formatted(EMAIL);

        ResponseEntity<Map> response = restTemplate.exchange(
                baseUrl + "/api/v1/auth/login",
                HttpMethod.POST,
                new HttpEntity<>(body, jsonHeaders()),
                Map.class
        );

        assertThat(response.getStatusCode().is4xxClientError()).isTrue();
    }

    @Test
    @Order(5)
    @DisplayName("Truy cập endpoint cần auth không có token — trả 401")
    void protectedEndpoint_noToken_returns401() {
        ResponseEntity<Map> response = restTemplate.exchange(
                baseUrl + "/api/v1/products",
                HttpMethod.GET,
                new HttpEntity<>(jsonHeaders()),
                Map.class
        );

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
    }
}
