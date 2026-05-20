-- ==============================================================================
-- DỰ ÁN: HỆ THỐNG TRUY XUẤT NGUỒN GỐC NÔNG SẢN TÍCH HỢP HYBRID BLOCKCHAIN
-- PHIÊN BẢN: FINAL (Tích hợp RBAC, Event Sourcing, IPFS & Web Push)
-- ==============================================================================

-- Kích hoạt extension hỗ trợ sinh UUID tự động trong PostgreSQL
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==========================================
-- PHẦN 1: MASTER DATA (Danh mục chuẩn hóa)
-- ==========================================

-- 1. Danh mục Loại sản phẩm (VD: Cà phê, Thịt heo, Lúa gạo)
CREATE TABLE master_product_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Danh mục Đơn vị tính (VD: KG, Tấn, Thùng, Lít)
CREATE TABLE master_units (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(50) NOT NULL,
    
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Danh mục Địa chính (Phân cấp Tỉnh -> Huyện -> Xã)
CREATE TABLE master_locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id UUID REFERENCES master_locations(id), 
    name VARCHAR(255) NOT NULL,
    type VARCHAR(20) CHECK (type IN ('PROVINCE', 'DISTRICT', 'WARD')),
    
    is_deleted BOOLEAN DEFAULT FALSE
);

-- ==========================================
-- PHẦN 2: ĐỊNH DANH & PHÂN QUYỀN (RBAC & Maker-Checker)
-- ==========================================

-- 4. BẢNG TỔ CHỨC (Thực thể nắm giữ ví Blockchain và Trách nhiệm pháp lý)
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_wallet_address VARCHAR(42) UNIQUE NOT NULL, 
    name VARCHAR(255) NOT NULL,
    tax_code VARCHAR(50),
    representative_name VARCHAR(255), -- Người đại diện pháp luật
    address_detail TEXT,              -- Trụ sở chính
    
    org_type VARCHAR(50) NOT NULL,
    CONSTRAINT chk_org_type CHECK (org_type IN ('FARM', 'TRANSPORTER', 'FACTORY', 'RETAILER', 'SYSTEM_ADMIN')),
    
    status VARCHAR(50) DEFAULT 'PENDING',
    CONSTRAINT chk_org_status CHECK (status IN ('PENDING', 'VERIFIED', 'BANNED')),
    
    reputation_score INT DEFAULT 100, 

    version INT DEFAULT 0, 
    is_deleted BOOLEAN DEFAULT FALSE, 
    created_by VARCHAR(255), 
    updated_by VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =======================================================================
-- Bảng lưu trữ các tài liệu, chứng chỉ của Tổ chức (Tích hợp IPFS)
-- =======================================================================
CREATE TABLE organization_documents (
    -- Khóa chính
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Khóa ngoại liên kết với bảng organizations
    org_id UUID NOT NULL,
    
    -- Thông tin tài liệu
    document_type VARCHAR(50) NOT NULL,  -- VD: 'BUSINESS_LICENSE', 'VIETGAP', 'GLOBALGAP', 'OCOP'
    document_name VARCHAR(255) NOT NULL, -- VD: 'Giấy chứng nhận VietGAP 2026'
    cid VARCHAR(100) NOT NULL,           -- Mã IPFS Hash (VD: Qm...)
    expiration_date DATE,                -- Ngày hết hạn chứng chỉ (có thể null nếu giấy tờ vô thời hạn)

    -- Các trường Audit (Đồng bộ với BaseEntity trong Spring Boot)
    created_by VARCHAR(100),
    updated_by VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    is_deleted BOOLEAN DEFAULT FALSE,    -- Phục vụ Soft Delete
    version BIGINT DEFAULT 0,            -- Phục vụ Optimistic Locking

    -- Định nghĩa Ràng buộc khóa ngoại
    CONSTRAINT fk_org_docs_organization FOREIGN KEY (org_id) REFERENCES organizations(id)
);

-- Tạo Index để tăng tốc độ truy vấn khi tải hồ sơ của một tổ chức cụ thể
CREATE INDEX idx_org_docs_org_id ON organization_documents(org_id);

-- Tạo Index để phục vụ các Cronjob quét giấy tờ sắp hết hạn theo loại
CREATE INDEX idx_org_docs_type_expire ON organization_documents(document_type, expiration_date);

-- 5. BẢNG NHÂN VIÊN (Tài khoản thao tác Off-chain)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES organizations(id), -- Khóa ngoại Multi-tenancy
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    
    version INT DEFAULT 0,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. BẢNG DANH MỤC QUYỀN (Hạt nhân phân quyền của RBAC)
CREATE TABLE permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL, -- VD: 'BATCH_CREATE', 'BATCH_APPROVE'
    name VARCHAR(255) NOT NULL,
    module VARCHAR(50) NOT NULL,      -- VD: 'TRACEABILITY', 'IDENTITY'
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. BẢNG VAI TRÒ (Chức danh trong tổ chức)
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL, -- VD: 'MANAGER', 'WAREHOUSE_STAFF'
    name VARCHAR(100) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. BẢNG GÁN QUYỀN CHO VAI TRÒ (Role-Permissions Mapping)
CREATE TABLE role_permissions (
    role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (role_id, permission_id)
);

-- 9. BẢNG GÁN VAI TRÒ CHO NHÂN VIÊN (User-Roles Mapping)
CREATE TABLE user_roles (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
    assigned_by VARCHAR(255), 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, role_id)
);

-- 10. BẢNG LỊCH SỬ UY TÍN (Append-only Log chấm điểm tổ chức)
CREATE TABLE reputation_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES organizations(id) NOT NULL,
    score_change INT NOT NULL, 
    reason TEXT NOT NULL, 
    related_batch_id UUID, 
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- PHẦN 3: LÕI TRUY XUẤT NGUỒN GỐC (Event Sourcing)
-- ==========================================

CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Thuộc về Hợp tác xã/Công ty nào
    org_id UUID NOT NULL REFERENCES organizations(id),
    
    -- Thuộc phân loại nào (Rau củ, Trái cây, Chế biến...)
    category_id UUID REFERENCES master_product_categories(id),
    
    -- Thông tin hiển thị cho người tiêu dùng
    name VARCHAR(255) NOT NULL,
    description TEXT,
    sku_code VARCHAR(100),           -- Mã hàng hóa nội bộ
    
    -- [CẬP NHẬT] Dùng JSONB để lưu mảng các mã CID từ IPFS
    -- Ví dụ dữ liệu lưu vào: ["QmẢnhĐạiDiện...", "QmẢnhMặtSau...", "QmẢnhThànhPhần..."]
    image_cids JSONB,          
    
    -- Thông tin phụ đính kèm (Thành phần, điều kiện bảo quản, hạn sử dụng mặc định...)
    attributes JSONB, 
    
    -- Audit fields
    version BIGINT DEFAULT 0,
    created_by VARCHAR(100),
    updated_by VARCHAR(100),
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);
CREATE INDEX idx_products_org_id ON products(org_id);

-- 11. BẢNG LÔ HÀNG (Định danh tĩnh và Sở hữu)
CREATE TABLE batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_code VARCHAR(100) UNIQUE NOT NULL, -- Mã QR hiển thị
    product_id UUID NOT NULL REFERENCES products(id),
    creator_org_id UUID REFERENCES organizations(id) NOT NULL,
    current_owner_org_id UUID REFERENCES organizations(id) NOT NULL, 
    
    product_category_id UUID REFERENCES master_product_categories(id),
    product_type VARCHAR(50) NOT NULL,
    CONSTRAINT chk_product_type CHECK (product_type IN ('RAW_MATERIAL', 'PROCESSED_FOOD')),
    status VARCHAR(50) NOT NULL DEFAULT 'CREATED',
    is_active BOOLEAN DEFAULT TRUE, 
    onchain_hash VARCHAR(255), -- Chữ ký điện tử / TxHash khóa trên Blockchain

    -- [CẬP NHẬT] Mass Balance
    initial_quantity NUMERIC(18, 3) NOT NULL DEFAULT 0,
    current_quantity NUMERIC(18, 3) NOT NULL DEFAULT 0,
    unit_id UUID REFERENCES master_units(id),

    version INT DEFAULT 0,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 12. BẢNG SỰ KIỆN LÔ HÀNG (Nhật ký vạn vật - Event Sourcing)
CREATE TABLE batch_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_id UUID REFERENCES batches(id) NOT NULL,
    actor_user_id UUID REFERENCES users(id) NOT NULL, 
    
    event_type VARCHAR(50) NOT NULL,
    -- Đã mở rộng để hỗ trợ Canh tác, Giết mổ, Chế biến, Gộp/Tách lô
    CONSTRAINT chk_event_type CHECK (event_type IN (
        'CREATED', 'FARMING_ACTIVITY', 'PROCESSING', 
        'TRANSPORTING', 'STORED_AND_VERIFIED', 'REJECTED', 
        'TRANSFORMED', 'SPLIT', 'MERGED',
        'CONSUMED', 'CREATED_FROM_MERGE', 'CREATED_FROM_SPLIT'
    )),
    
    gps_latitude DECIMAL(10, 8),
    gps_longitude DECIMAL(11, 8),
    device_info VARCHAR(255), 
    
    image_cids JSONB,  -- Mảng chứa các CID ảnh upload lên IPFS
    metadata JSONB,    -- Linh hoạt lưu Trọng lượng, Nhiệt độ, Phân bón,...
    onchain_event_hash VARCHAR(255), -- Hash riêng cho sự kiện (Tùy chọn)
    
    is_deleted BOOLEAN DEFAULT FALSE,
    created_by VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 13. BẢNG PHẢ HỆ (Giải quyết biến đổi hình thái)
CREATE TABLE batch_lineage (
    parent_batch_id UUID REFERENCES batches(id),
    child_batch_id UUID REFERENCES batches(id),
    
    action_type VARCHAR(50) NOT NULL,
    CONSTRAINT chk_action_type CHECK (action_type IN ('MERGE', 'SPLIT')),
    quantity NUMERIC(18, 3) NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (parent_batch_id, child_batch_id)
);

-- ==========================================
-- PHẦN 4: BẢO MẬT & PHIÊN ĐĂNG NHẬP (JWT)
-- ==========================================

-- 14. BẢNG REFRESH TOKEN (Cấp lại Access Token)
CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) NOT NULL,
    token VARCHAR(255) UNIQUE NOT NULL, 
    expiry_date TIMESTAMP NOT NULL, 
    is_revoked BOOLEAN DEFAULT FALSE, 
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_ip VARCHAR(50), 
    device_info VARCHAR(255) 
);
CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token);

-- 15. BẢNG PASSWORD RESET (Quên mật khẩu)
CREATE TABLE password_reset_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) NOT NULL,
    token VARCHAR(255) UNIQUE NOT NULL, 
    expiry_date TIMESTAMP NOT NULL, 
    is_used BOOLEAN DEFAULT FALSE, 
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_password_reset_tokens_token ON password_reset_tokens(token);

-- ==========================================
-- PHẦN 5: THÔNG BÁO THỜI GIAN THỰC (Web Push API)
-- ==========================================

-- 16. BẢNG LƯU TRỮ TRÌNH DUYỆT (Web Push Subscription)
CREATE TABLE notification_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) NOT NULL,
    endpoint TEXT NOT NULL, 
    p256dh VARCHAR(255) NOT NULL, 
    auth VARCHAR(255) NOT NULL, 
    device_type VARCHAR(100), 
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 17. BẢNG NỘI DUNG THÔNG BÁO (Lịch sử)
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_id UUID REFERENCES users(id) NOT NULL, 
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    link_url TEXT, 
    is_read BOOLEAN DEFAULT FALSE,
    
    type VARCHAR(50) DEFAULT 'INFO',
    CONSTRAINT chk_noti_type CHECK (type IN ('INFO', 'WARNING', 'ACTION_REQUIRED', 'SYSTEM')),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 18. BẢNG CẤU HÌNH THÔNG BÁO (User Settings)
CREATE TABLE user_notification_settings (
    user_id UUID PRIMARY KEY REFERENCES users(id),
    enable_push BOOLEAN DEFAULT TRUE,
    enable_email BOOLEAN DEFAULT TRUE,
    
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 18. BẢNG TOKEN BLACKLIST (Danh sách đen Access Token)
CREATE TABLE token_blacklist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token VARCHAR(500) UNIQUE NOT NULL, -- JWT Access Token có thể khá dài
    expiry_date TIMESTAMP NOT NULL,     -- Lưu thời gian hết hạn của token để sau này chạy Job dọn rác
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_token_blacklist_token ON token_blacklist(token);
