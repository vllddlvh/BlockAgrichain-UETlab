package BlockchainAgridence.uet.modules.traceability.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.HexFormat;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@Slf4j
public class BlockchainContractService {

    static final String GET_HASH_SELECTOR = "0x5b6beeb9";
    static final String VERIFY_HASH_SELECTOR = "0x258b85d4";
    static final int WORD_HEX_LENGTH = 64;

    private final ObjectMapper objectMapper;
    private final HttpClient httpClient = HttpClient.newBuilder()
            .version(HttpClient.Version.HTTP_1_1)
            .build();

    @Value("${blockchain.rpc-url}")
    private String rpcUrl;

    @Value("${blockchain.contract-address:}")
    private String contractAddress;

    public BlockchainContractService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    public Optional<String> getHash(String batchId) {
        if (!isConfigured()) {
            return Optional.empty();
        }

        return ethCall(GET_HASH_SELECTOR + encodeArguments(batchId))
                .flatMap(this::decodeString);
    }

    public boolean verifyHash(String batchId, String dataHash) {
        if (!isConfigured()) {
            return false;
        }

        return ethCall(VERIFY_HASH_SELECTOR + encodeArguments(batchId, dataHash))
                .map(this::decodeBoolean)
                .orElse(false);
    }

    public boolean isConfigured() {
        return contractAddress != null
                && !contractAddress.isBlank()
                && !"0x0000000000000000000000000000000000000000".equalsIgnoreCase(contractAddress);
    }

    private Optional<String> ethCall(String data) {
        try {
            Map<String, Object> payload = Map.of(
                    "jsonrpc", "2.0",
                    "id", 1,
                    "method", "eth_call",
                    "params", List.of(
                            Map.of("to", contractAddress, "data", data),
                            "latest"
                    )
            );

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(rpcUrl))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(payload)))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            JsonNode body = objectMapper.readTree(response.body());

            if (body.has("error")) {
                log.warn("Blockchain eth_call error: {}", body.get("error"));
                return Optional.empty();
            }

            String result = body.path("result").asText();
            if (result == null || result.isBlank() || "0x".equals(result)) {
                return Optional.empty();
            }
            return Optional.of(result);
        } catch (Exception e) {
            log.warn("Cannot read blockchain contract via RPC", e);
            return Optional.empty();
        }
    }

    private String encodeArguments(String... values) {
        List<String> tails = new ArrayList<>();
        int offsetBytes = values.length * 32;

        StringBuilder head = new StringBuilder();
        for (String value : values) {
            String tail = encodeStringTail(value);
            head.append(word(offsetBytes));
            tails.add(tail);
            offsetBytes += tail.length() / 2;
        }

        return head + String.join("", tails);
    }

    private String encodeStringTail(String value) {
        byte[] bytes = value.getBytes(StandardCharsets.UTF_8);
        String hex = HexFormat.of().formatHex(bytes);
        int paddedLength = ((hex.length() + WORD_HEX_LENGTH - 1) / WORD_HEX_LENGTH) * WORD_HEX_LENGTH;
        return word(bytes.length) + rightPad(hex, paddedLength);
    }

    private Optional<String> decodeString(String result) {
        String hex = strip0x(result);
        if (hex.length() < WORD_HEX_LENGTH * 2) {
            return Optional.empty();
        }

        int offset = Integer.parseInt(hex.substring(0, WORD_HEX_LENGTH), 16) * 2;
        int lengthStart = offset;
        int dataStart = lengthStart + WORD_HEX_LENGTH;

        if (hex.length() < dataStart) {
            return Optional.empty();
        }

        int byteLength = Integer.parseInt(hex.substring(lengthStart, dataStart), 16);
        int dataEnd = dataStart + byteLength * 2;
        if (hex.length() < dataEnd) {
            return Optional.empty();
        }

        byte[] bytes = HexFormat.of().parseHex(hex.substring(dataStart, dataEnd));
        return Optional.of(new String(bytes, StandardCharsets.UTF_8));
    }

    private boolean decodeBoolean(String result) {
        String hex = strip0x(result);
        if (hex.length() < WORD_HEX_LENGTH) {
            return false;
        }
        return !"0".repeat(WORD_HEX_LENGTH).equals(hex.substring(hex.length() - WORD_HEX_LENGTH));
    }

    private String word(int value) {
        return leftPad(Integer.toHexString(value), WORD_HEX_LENGTH);
    }

    private String leftPad(String value, int length) {
        return "0".repeat(length - value.length()) + value;
    }

    private String rightPad(String value, int length) {
        return value + "0".repeat(length - value.length());
    }

    private String strip0x(String value) {
        return value.startsWith("0x") ? value.substring(2) : value;
    }
}
