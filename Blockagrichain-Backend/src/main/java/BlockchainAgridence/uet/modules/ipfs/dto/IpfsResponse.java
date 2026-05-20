package BlockchainAgridence.uet.modules.ipfs.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class IpfsResponse {

    @JsonProperty("IpfsHash") // Map chính xác với trường viết hoa của Pinata API
    private String ipfsHash;

    @JsonProperty("PinSize")
    private Long pinSize;

    @JsonProperty("Timestamp")
    private String timestamp;
}
