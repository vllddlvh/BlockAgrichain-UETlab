package BlockchainAgridence.uet.modules.ipfs.controller;

import BlockchainAgridence.uet.modules.ipfs.dto.IpfsResponse;
import BlockchainAgridence.uet.modules.ipfs.service.IpfsService;
import BlockchainAgridence.uet.shared.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/ipfs")
@RequiredArgsConstructor
public class IpfsController {

    private final IpfsService ipfsService;

    // Nhận file qua Multipart-form data
    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<IpfsResponse> uploadFile(@RequestParam("file") MultipartFile file) {
        return ApiResponse.<IpfsResponse>builder()
                .code(1000)
                .message("Tải file lên mạng lưới phi tập trung IPFS thành công")
                .body(ipfsService.uploadFile(file))
                .build();
    }
}
//```
//
//        ---
//
//        ### 💡 Kịch bản Test thực tế trên Postman:
//
//        1. Trong Postman, tạo một request mới: `POST {{BASE_URL}}/api/v1/ipfs/upload`.
//        2. Ở phần **Body**, chọn kiểu **form-data**.
//        3. Điền cột KEY là chữ `file`, sau đó rê chuột vào cuối ô KEY đổi định dạng từ *Text* sang **File**.
//        4. Ở cột VALUE, bấm nút **Select Files** và chọn một tấm ảnh bất kỳ trong máy tính của bạn.
//        5. Nhấn **Send**.
//
//Hệ thống sẽ trả về cục JSON chuẩn như sau:
//        ```json
//{
//    "code": 1000,
//        "message": "Tải file lên mạng lưới phi tập trung IPFS thành công",
//        "body": {
//    "ipfsHash": "QmZtmr6H6Z3gD3X9b7k2zZsdP1m6yXN5...",
//            "pinSize": 45210,
//            "timestamp": "2026-05-17T15:30:00Z"
//}
//}
//```
//
//        ### 🎯 Ứng dụng mã CID này vào các module khác thế nào?
//Khi Frontend đã cầm mã `ipfsHash` kia (ví dụ: `QmZtmr6H...`), khi gọi API cập nhật hồ sơ tổ chức mà bạn đã viết xong ở các bước trước: `PUT /api/v1/organizations/{id}`, Frontend chỉ việc đính nó vào trường:
//        ```json
//{
//    "name": "Hợp Tác Xã Nông Nghiệp Công Nghệ Cao",
//        "licenseCid": "QmZtmr6H6Z3gD3X9b7k2zZsdP1m6yXN5..."
//}