package BlockchainAgridence.uet.integration;

import BlockchainAgridence.uet.modules.traceability.service.BlockchainContractService;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.*;
import org.springframework.test.context.ActiveProfiles;

import java.util.Map;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
public abstract class BaseIntegrationTest {

    @LocalServerPort
    protected int port;

    @Autowired
    protected TestRestTemplate restTemplate;

    @MockBean
    protected BlockchainContractService blockchainContractService;

    protected String baseUrl;

    @BeforeEach
    void setUpBase() {
        baseUrl = "http://localhost:" + port;
        // Mock blockchain service để tests không cần Hardhat node
        when(blockchainContractService.getHash(anyString())).thenReturn(Optional.empty());
        when(blockchainContractService.verifyHash(anyString(), anyString())).thenReturn(false);
    }

    protected HttpHeaders authHeaders(String token) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(token);
        return headers;
    }

    protected HttpHeaders jsonHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        return headers;
    }

    @SuppressWarnings("unchecked")
    protected String loginAndGetToken(String email, String password) {
        String loginBody = """
                {"email": "%s", "password": "%s"}
                """.formatted(email, password);

        ResponseEntity<Map> response = restTemplate.exchange(
                baseUrl + "/api/v1/auth/login",
                HttpMethod.POST,
                new HttpEntity<>(loginBody, jsonHeaders()),
                Map.class
        );

        Map<String, Object> body = (Map<String, Object>) response.getBody().get("body");
        return (String) body.get("token");
    }
}
