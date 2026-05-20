package BlockchainAgridence.uet.exception;


import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

@Getter
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public enum ErrorCode {
    // --- Lỗi Hệ thống chung ---
    UNCATEGORIZED_EXCEPTION(9999, "Lỗi hệ thống không xác định", HttpStatus.INTERNAL_SERVER_ERROR),

    INVALID_KEY(1001, "Lỗi validation không xác định", HttpStatus.BAD_REQUEST),
    OPTIMISTIC_LOCK_FAILURE(1047, "Dữ liệu đã bị thay đổi bởi người khác, vui lòng thử lại", HttpStatus.CONFLICT),

    // --- Lỗi liên quan đến Tổ chức (Organization) ---
    ORG_WALLET_EXISTED(1002, "Địa chỉ ví tổ chức đã được đăng ký", HttpStatus.BAD_REQUEST),
    ORG_NOT_FOUND(1004, "Không tìm thấy Tổ chức", HttpStatus.NOT_FOUND),

    // --- Lỗi liên quan đến Người dùng (User) ---
    USER_EMAIL_EXISTED(1003, "Email này đã được sử dụng", HttpStatus.BAD_REQUEST),
    USER_NOT_FOUND(1005, "Không tìm thấy Người dùng", HttpStatus.NOT_FOUND),

    // --- Lỗi liên quan đến Phân quyền (RBAC) ---
    ROLE_NOT_FOUND(1006, "Không tìm thấy Vai trò (Role)", HttpStatus.NOT_FOUND),
    PERMISSION_NOT_FOUND(1007, "Không tìm thấy Quyền hạn (Permission)", HttpStatus.NOT_FOUND),

    // --- Lỗi Validation (DTO) ---
    ROLE_LIST_EMPTY(1008, "Danh sách Role không được để trống", HttpStatus.BAD_REQUEST),
    WALLET_ADDRESS_BLANK(1009, "Địa chỉ ví không được để trống", HttpStatus.BAD_REQUEST),
    INVALID_WEB3_WALLET(1010, "Địa chỉ ví Web3 không hợp lệ (Phải bắt đầu bằng 0x và dài 42 ký tự)", HttpStatus.BAD_REQUEST),
    ORG_NAME_BLANK(1011, "Tên tổ chức không được để trống", HttpStatus.BAD_REQUEST),
    ORG_TYPE_NULL(1012, "Loại hình tổ chức không được để trống", HttpStatus.BAD_REQUEST),
    ADMIN_EMAIL_BLANK(1013, "Email quản trị viên không được để trống", HttpStatus.BAD_REQUEST),
    INVALID_EMAIL_FORMAT(1014, "Định dạng email không hợp lệ", HttpStatus.BAD_REQUEST),
    ADMIN_PASSWORD_BLANK(1015, "Mật khẩu quản trị viên không được để trống", HttpStatus.BAD_REQUEST),
    ADMIN_FULLNAME_BLANK(1016, "Họ tên quản trị viên không được để trống", HttpStatus.BAD_REQUEST),
    ROLE_CODE_BLANK(1017, "Mã role không được để trống", HttpStatus.BAD_REQUEST),
    ROLE_NAME_BLANK(1018, "Tên role không được để trống", HttpStatus.BAD_REQUEST),
    PERMISSION_LIST_EMPTY(1019, "Danh sách quyền (permissions) không được để trống", HttpStatus.BAD_REQUEST),
    EMAIL_BLANK(1020, "Email không được để trống", HttpStatus.BAD_REQUEST),
    PASSWORD_BLANK(1021, "Mật khẩu không được để trống", HttpStatus.BAD_REQUEST),
    FULLNAME_BLANK(1022, "Họ tên không được để trống", HttpStatus.BAD_REQUEST),
    METHOD_NOT_ALLOWED(1023, "Phương thức HTTP không được hỗ trợ", HttpStatus.METHOD_NOT_ALLOWED),
    UNAUTHENTICATED(1024, "Không có quyền truy cập (Unauthenticated)", HttpStatus.UNAUTHORIZED),
    UNAUTHORIZED_ACCESS(1025, "Bạn không có quyền thực hiện thao tác này", HttpStatus.FORBIDDEN),
    INVALID_JSON_REQUEST(1026, "Định dạng JSON gửi lên không hợp lệ", HttpStatus.BAD_REQUEST),
    PRODUCT_NAME_BLANK(1027, "Tên sản phẩm không được để trống", HttpStatus.BAD_REQUEST),
    PRODUCT_SKU_BLANK(1028, "Mã SKU không được để trống", HttpStatus.BAD_REQUEST),
    BATCH_CODE_BLANK(1029, "Mã QR lô hàng không được để trống", HttpStatus.BAD_REQUEST),
    PRODUCT_ID_NULL(1030, "ID Sản phẩm không được để trống", HttpStatus.BAD_REQUEST),
    PRODUCT_TYPE_NULL(1031, "Phân loại lô hàng không được để trống", HttpStatus.BAD_REQUEST),
    EVENT_TYPE_NULL(1032, "Loại sự kiện không được để trống", HttpStatus.BAD_REQUEST),
    INITIAL_QUANTITY_NULL(1033, "Khối lượng ban đầu không được để trống", HttpStatus.BAD_REQUEST),
    INITIAL_QUANTITY_INVALID(1034, "Khối lượng ban đầu phải lớn hơn 0", HttpStatus.BAD_REQUEST),
    UNIT_ID_NULL(1035, "Đơn vị tính không được để trống", HttpStatus.BAD_REQUEST),
    PRODUCED_QUANTITY_NULL(1036, "Khối lượng thành phẩm không được để trống", HttpStatus.BAD_REQUEST),
    PRODUCED_QUANTITY_INVALID(1037, "Khối lượng thành phẩm phải lớn hơn 0", HttpStatus.BAD_REQUEST),
    MERGE_PARENTS_EMPTY(1038, "Danh sách lô cha không được để trống", HttpStatus.BAD_REQUEST),
    MERGE_PARENT_ID_NULL(1039, "ID lô cha không được để trống", HttpStatus.BAD_REQUEST),
    MERGE_PARENT_QUANTITY_NULL(1040, "Số lượng tiêu hao không được để trống", HttpStatus.BAD_REQUEST),
    MERGE_PARENT_QUANTITY_INVALID(1041, "Số lượng tiêu hao phải lớn hơn 0", HttpStatus.BAD_REQUEST),
    SPLIT_PARENT_ID_NULL(1042, "ID lô cha không được để trống", HttpStatus.BAD_REQUEST),
    SPLIT_CHILDREN_EMPTY(1043, "Danh sách lô con không được để trống", HttpStatus.BAD_REQUEST),
    TARGET_ORG_ID_NULL(1044, "Tổ chức nhận hàng không được để trống", HttpStatus.BAD_REQUEST),
    SPLIT_CHILD_QUANTITY_NULL(1045, "Số lượng tách ra không được để trống", HttpStatus.BAD_REQUEST),
    SPLIT_CHILD_QUANTITY_INVALID(1046, "Số lượng tách ra phải lớn hơn 0", HttpStatus.BAD_REQUEST),

    // --- Lỗi liên quan đến Sản phẩm (Product) ---
    SKU_ALREADY_EXISTS(2001, "Mã SKU đã tồn tại trong tổ chức này", HttpStatus.CONFLICT),
    PRODUCT_NOT_FOUND(2002, "Không tìm thấy Sản phẩm", HttpStatus.NOT_FOUND),
    CATEGORY_NOT_FOUND(2003, "Không tìm thấy Danh mục sản phẩm", HttpStatus.NOT_FOUND),
    UNIT_NOT_FOUND(2004, "Không tìm thấy đơn vị tính", HttpStatus.NOT_FOUND),

    // --- Lỗi liên quan đến Lô hàng (Batch) ---
    BATCH_CODE_ALREADY_EXISTS(2101, "Mã lô hàng đã tồn tại", HttpStatus.CONFLICT),
    BATCH_NOT_FOUND(2102, "Không tìm thấy Lô hàng", HttpStatus.NOT_FOUND),
    BATCH_INACTIVE(2103, "Lô hàng đã ngừng hoạt động, không thể thao tác", HttpStatus.BAD_REQUEST),
    BATCH_INSUFFICIENT_QUANTITY(2104, "Không đủ khối lượng trong kho để thực hiện", HttpStatus.BAD_REQUEST),

    // --- Lỗi liên quan đến IPFS ---
    FILE_EMPTY(3001, "File tải lên không được để trống", HttpStatus.BAD_REQUEST),
    IPFS_UPLOAD_FAILED(3002, "Lỗi khi tải file lên IPFS", HttpStatus.INTERNAL_SERVER_ERROR);

    int code;
    String message;
    HttpStatusCode statusCode;
}
