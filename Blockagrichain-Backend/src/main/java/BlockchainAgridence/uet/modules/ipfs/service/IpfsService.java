package BlockchainAgridence.uet.modules.ipfs.service;

import BlockchainAgridence.uet.configuration.IpfsConfig;
import BlockchainAgridence.uet.exception.AppException;
import BlockchainAgridence.uet.exception.ErrorCode;
import BlockchainAgridence.uet.modules.ipfs.dto.IpfsResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@Slf4j
@Service
@RequiredArgsConstructor
public class IpfsService {

    private final IpfsConfig ipfsConfig;

    public IpfsResponse uploadFile(MultipartFile file) {
        log.info("Bắt đầu đẩy file [{}] lên IPFS Pinata...", file.getOriginalFilename());

        if (file.isEmpty()) {
            throw new AppException(ErrorCode.FILE_EMPTY);
        }

        try {
            // Build body dưới dạng multipart/form-data chuẩn để gửi API
            MultiValueMap<String, Object> multipartBody = new LinkedMultiValueMap<>();
            multipartBody.add("file", new ByteArrayResource(file.getBytes()) {
                @Override
                public String getFilename() {
                    return file.getOriginalFilename(); // Bắt buộc phải giữ lại tên file gốc
                }
            });

            // Thực hiện cuộc gọi HTTP POST sang Pinata bằng RestClient
            IpfsResponse response = ipfsConfig.getPinataClient()
                    .post()
                    .contentType(MediaType.MULTIPART_FORM_DATA)
                    .body(multipartBody)
                    .retrieve()
                    .body(IpfsResponse.class);

            if (response != null && response.getIpfsHash() != null) {
                log.info("Đẩy file lên IPFS thành công! CID nhận về: {}", response.getIpfsHash());
                return response;
            } else {
                throw new AppException(ErrorCode.IPFS_UPLOAD_FAILED);
            }

        } catch (IOException e) {
            log.error("Lỗi đọc file khi upload lên IPFS", e);
            throw new AppException(ErrorCode.IPFS_UPLOAD_FAILED);
        } catch (Exception e) {
            log.error("Lỗi kết nối đến IPFS Pinata Gateway", e);
            throw new AppException(ErrorCode.IPFS_UPLOAD_FAILED);
        }
    }
}
