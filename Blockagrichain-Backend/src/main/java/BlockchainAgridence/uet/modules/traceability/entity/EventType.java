package BlockchainAgridence.uet.modules.traceability.entity;

public enum EventType {
    CREATED,                // Khởi tạo lô hàng
    FARMING_ACTIVITY,       // Hoạt động canh tác (Gieo, Bón phân, Tưới...)
    PROCESSING,             // Chế biến
    TRANSPORTING,           // Vận chuyển
    STORED_AND_VERIFIED,    // Nhập kho và xác nhận
    REJECTED,               // Từ chối (Lỗi QC)
    TRANSFORMED,            // Biến đổi hình thái
    SPLIT,                  // Tách lô
    MERGED,                 // Gộp lô
    CONSUMED,               // Tiêu hao nguyên liệu
    CREATED_FROM_MERGE,     // Lô con được tạo từ gộp
    CREATED_FROM_SPLIT      // Lô con được tạo từ tách
}
