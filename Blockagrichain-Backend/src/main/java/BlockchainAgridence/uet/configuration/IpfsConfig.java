package BlockchainAgridence.uet.configuration;

import lombok.AccessLevel;
import lombok.Getter;
import lombok.experimental.FieldDefaults;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

@Configuration
@Getter
@FieldDefaults(level = AccessLevel.PRIVATE)
public class IpfsConfig {

    @Value("${pinata.api.url}")
    String apiUrl;

    @Value("${pinata.api.jwt}")
    String jwtToken;

    @Value("${pinata.gateway}")
    String gatewayUrl;

    // Khởi tạo RestClient đính sẵn Header Authentication của Pinata
    public RestClient getPinataClient() {
        return RestClient.builder()
                .baseUrl(apiUrl)
                .defaultHeader("Authorization", "Bearer " + jwtToken)
                .build();
    }
}
