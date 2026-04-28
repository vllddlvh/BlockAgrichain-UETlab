-- Kích hoạt extension để tự động sinh UUID trong PostgreSQL
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Tạo kiểu dữ liệu ENUM cho phân quyền người dùng
CREATE TYPE role_type_enum AS ENUM (
    'Producer', 
    'Logistics', 
    'Retailer', 
    'Consumer', 
    'System Admin'
);

-- 2. Tạo bảng Accounts (Quản lý danh tính và ví Web3)
CREATE TABLE Accounts (
    account_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wallet_address VARCHAR(42) UNIQUE NOT NULL,
    role_type role_type_enum NOT NULL,
    business_info JSONB, -- Lưu trữ tên công ty, địa chỉ, tài liệu KYB dưới dạng JSON
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tạo bảng Products (Danh mục nông sản chuẩn hóa)
CREATE TABLE Products (
    product_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    origin_specs TEXT,
    tcvn_standards JSONB, -- Chứa cấu trúc tiêu chuẩn TCVN dưới dạng JSON
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Tạo bảng Batches (Lưu thông tin lô hàng và liên kết Smart Contract)
CREATE TABLE Batches (
    batch_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES Products(product_id) ON DELETE RESTRICT,
    creator_id UUID NOT NULL REFERENCES Accounts(account_id) ON DELETE RESTRICT,
    quantity DECIMAL(10, 2) NOT NULL,
    ipfs_cid VARCHAR(100), -- Mã băm lưu trữ file trên mạng IPFS
    token_id BIGINT UNIQUE, -- ID của token trên mạng lưới Blockchain (ERC-1155)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Tạo bảng Trace_Events (Nhật ký các sự kiện truy xuất trên chuỗi cung ứng)
CREATE TABLE Trace_Events (
    event_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    batch_id UUID NOT NULL REFERENCES Batches(batch_id) ON DELETE CASCADE,
    actor_id UUID NOT NULL REFERENCES Accounts(account_id) ON DELETE RESTRICT,
    event_action VARCHAR(50) NOT NULL, -- Ví dụ: 'Khởi tạo', 'Vận chuyển', 'Nhập kho', 'Đóng gói'
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    gps_location VARCHAR(100), -- Tọa độ GPS (Vĩ độ, Kinh độ)
    event_data JSONB, -- Dữ liệu nhiệt độ, độ ẩm, ghi chú thêm
    event_hash VARCHAR(64) NOT NULL -- Mã băm SHA-256 của event_data để đối chiếu On-chain
);

-- 6. Tạo bảng Transfers (Ghi nhận lịch sử chuyển giao quyền sở hữu)
CREATE TABLE Transfers (
    transfer_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    batch_id UUID NOT NULL REFERENCES Batches(batch_id) ON DELETE CASCADE,
    from_account UUID NOT NULL REFERENCES Accounts(account_id) ON DELETE RESTRICT,
    to_account UUID NOT NULL REFERENCES Accounts(account_id) ON DELETE RESTRICT,
    transfer_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    tx_hash VARCHAR(66) UNIQUE NOT NULL -- Mã băm giao dịch (Transaction Hash) trên mạng lưới Blockchain
);

-- TẠO CÁC INDEX ĐỂ TỐI ƯU TỐC ĐỘ TRUY VẤN
CREATE INDEX idx_accounts_wallet ON Accounts(wallet_address);
CREATE INDEX idx_batches_token_id ON Batches(token_id);
CREATE INDEX idx_trace_events_batch ON Trace_Events(batch_id);
CREATE INDEX idx_transfers_tx_hash ON Transfers(tx_hash);