-- ==============================================================================
-- BẢN CHỤP DỮ LIỆU ĐẦY ĐỦ (FULL SNAPSHOT) - HỆ THỐNG TRUY XUẤT NGUỒN GỐC
-- Bao gồm: Roles, Perms, Master Data, Orgs, Users, Products, Batches, Events
-- ==============================================================================

-- Bật extension pgcrypto để PostgreSQL tự băm mật khẩu chuẩn BCrypt
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==========================================
-- 0. DỌN DẸP DỮ LIỆU CŨ (Tránh lỗi Ràng buộc khóa ngoại)
-- ==========================================
DELETE FROM batch_lineage;
DELETE FROM batch_events;
DELETE FROM batches;
DELETE FROM products;

DELETE FROM notifications;
DELETE FROM notification_subscriptions;
DELETE FROM user_notification_settings;
DELETE FROM refresh_tokens;
DELETE FROM token_blacklist;

DELETE FROM user_roles;
DELETE FROM role_permissions;
DELETE FROM users;
DELETE FROM roles;
DELETE FROM permissions;

DELETE FROM organizations;
DELETE FROM master_units;
DELETE FROM master_product_categories;

-- ==========================================
-- 1. SECURITY: QUYỀN HẠN (PERMISSIONS) & VAI TRÒ (ROLES)
-- ==========================================
INSERT INTO permissions (id, code, name, module) VALUES 
('a0000000-0000-0000-0000-000000000001', 'SYSTEM_ADMIN_ALL', 'Toàn quyền hệ thống', 'SYSTEM'),
('a0000000-0000-0000-0000-000000000002', 'PRODUCT_CREATE', 'Tạo sản phẩm mới', 'TRACEABILITY'),
('a0000000-0000-0000-0000-000000000003', 'BATCH_CREATE', 'Khởi tạo lô hàng', 'TRACEABILITY'),
('a0000000-0000-0000-0000-000000000004', 'BATCH_UPDATE', 'Cập nhật, Tách, Gộp lô', 'TRACEABILITY');

INSERT INTO roles (id, code, name, description) VALUES
('b0000000-0000-0000-0000-000000000001', 'ORG_ADMIN',        'Quản trị viên Tổ chức', 'Quản lý toàn bộ tổ chức'),
('b0000000-0000-0000-0000-000000000000', 'SYSTEM_ADMIN',        'Quản trị viên Tổ chức', 'Quản lý toàn bộ tổ chức'),
('b0000000-0000-0000-0000-000000000002', 'FARM_ADMIN',       'Quản lý Nông trại',     'Tạo và quản lý lô hàng nông sản'),
('b0000000-0000-0000-0000-000000000003', 'TRANSPORT_ADMIN',  'Quản lý Vận chuyển',    'Cập nhật trạng thái vận chuyển'),
('b0000000-0000-0000-0000-000000000004', 'RETAIL_ADMIN',     'Quản lý Bán lẻ',        'Xác nhận nhận hàng và bán lẻ'),
('b0000000-0000-0000-0000-000000000005', 'STAFF',            'Nhân viên',             'Thao tác trực tiếp lô hàng');

INSERT INTO role_permissions (role_id, permission_id) VALUES
('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001'),
('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002'),
('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000003'),
('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000004'),
('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000002'),
('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000003'),
('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000004'),
('b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000003'),
('b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000004'),
('b0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000004'),
('b0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000003'),
('b0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000004');

-- ==========================================
-- 2. MASTER DATA (DANH MỤC)
-- ==========================================
INSERT INTO master_product_categories (id, code, name, description) VALUES 
('e0000000-0000-0000-0000-000000000001', 'RAW_AGRI', 'Nông sản thô', 'Chưa qua chế biến'),
('e0000000-0000-0000-0000-000000000002', 'PROCESSED_DRINK', 'Đồ uống chế biến', 'Trà, Cà phê đóng gói');

INSERT INTO master_units (id, code, name) VALUES 
('f0000000-0000-0000-0000-000000000001', 'KG', 'Kilogram'),
('f0000000-0000-0000-0000-000000000002', 'BOX', 'Hộp');

-- ==========================================
-- 3. ĐỊNH DANH (ORGANIZATIONS)
-- ==========================================
INSERT INTO organizations (id, name, org_wallet_address, org_type, status) VALUES
('c0000000-0000-0000-0000-000000000000', 'Ban Quản Trị BlockAgridence',    '0x0000000000000000000000000000000000000000', 'SYSTEM_ADMIN', 'VERIFIED'),
('c0000000-0000-0000-0000-000000000001', 'Hợp Tác Xã Cà Phê Đắk Lắk',     '0x1111111111111111111111111111111111111111', 'FARM',         'VERIFIED'),
('c0000000-0000-0000-0000-000000000002', 'Vận tải Trường Giang',            '0x2222222222222222222222222222222222222222', 'TRANSPORTER',  'VERIFIED'),
('c0000000-0000-0000-0000-000000000003', 'Nhà máy Rang xay Highlands',      '0x3333333333333333333333333333333333333333', 'FACTORY',      'VERIFIED'),
('c0000000-0000-0000-0000-000000000004', 'Chuỗi Cửa Hàng The Coffee House', '0x4444444444444444444444444444444444444444', 'RETAILER',     'VERIFIED');

-- ==========================================
-- 4. USERS (Sử dụng hàm crypt để băm mật khẩu trực tiếp)
-- Mật khẩu chung: Admin@123
-- ==========================================
INSERT INTO users (id, org_id, email, password_hash, full_name) VALUES
('d0000000-0000-0000-0000-000000000000', 'c0000000-0000-0000-0000-000000000000', 'admin@system.com',        crypt('Admin@123', gen_salt('bf', 10)), 'Super Admin'),
('d0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'giamdoc@daklak.com',      crypt('Admin@123', gen_salt('bf', 10)), 'Y Tý (Giám Đốc HTX)'),
('d0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000001', 'nongdan@daklak.com',      crypt('Admin@123', gen_salt('bf', 10)), 'A Phủ (Nông Dân)'),
('d0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000002', 'taixe@truonggiang.com',   crypt('Admin@123', gen_salt('bf', 10)), 'Lê Tài Xế'),
('d0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000003', 'quandoc@highlands.com',  crypt('Admin@123', gen_salt('bf', 10)), 'Trần Quản Đốc'),
('d0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000004', 'kho@thecoffeehouse.com', crypt('Admin@123', gen_salt('bf', 10)), 'Nhân viên Siêu Thị');

-- Map Users → Roles (khớp với OrganizationService switch: FARM→FARM_ADMIN, TRANSPORTER→TRANSPORT_ADMIN, RETAILER→RETAIL_ADMIN)
INSERT INTO user_roles (user_id, role_id) VALUES
('d0000000-0000-0000-0000-000000000000', 'b0000000-0000-0000-0000-000000000001'), -- admin → ORG_ADMIN
('d0000000-0000-0000-0000-000000000000', 'b0000000-0000-0000-0000-000000000000'),
('d0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000002'), -- giamdoc → FARM_ADMIN
('d0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000005'), -- nongdan → STAFF
('d0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000003'), -- taixe → TRANSPORT_ADMIN
('d0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000002'), -- quandoc → FARM_ADMIN (FACTORY dùng FARM_ADMIN tạm)
('d0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000004'); -- kho → RETAIL_ADMIN

-- ==========================================
-- 5. PRODUCTS (SẢN PHẨM KHAI BÁO)
-- ==========================================
INSERT INTO products (id, org_id, category_id, name, sku_code, description, image_cids, attributes, is_approved, created_at) VALUES 
('11111111-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001', 'Cà phê Robusta Đắk Lắk', 'CF-ROB-01', 'Cà phê nhân xanh chất lượng cao', '["QmHashCoffee1", "QmHashCoffee2"]', '{"humidity": "12.5", "grade": "Grade 1"}', TRUE, CURRENT_TIMESTAMP - INTERVAL '60 days'),
('11111111-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001', 'Hạt tiêu đen Gia Lai', 'PP-BLK-01', 'Hạt tiêu đen nguyên hạt sấy khô', '["QmHashPepper1"]', '{"piperine_content": "5.5%", "density": "500g/l"}', TRUE, CURRENT_TIMESTAMP - INTERVAL '55 days'),
('11111111-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001', 'Thịt heo hữu cơ', 'PORK-ORG-01', 'Thịt heo nuôi theo tiêu chuẩn hữu cơ', '["QmHashPork1"]', '{"fat_percentage": "15%", "storage_temp": "-18°C"}', TRUE, CURRENT_TIMESTAMP - INTERVAL '30 days');

-- ==========================================
-- 6. CÂY PHẢ HỆ VÀ SỰ KIỆN TRUY XUẤT (TRACEABILITY GRAPH)
-- ==========================================

-- LÔ 1: Farm tạo lô 5000kg (Cách đây 30 ngày) -> Xẻ 2000kg -> Còn 3000kg
INSERT INTO batches (id, batch_code, product_id, creator_org_id, current_owner_org_id, product_type, status, initial_quantity, current_quantity, unit_id, created_at) VALUES 
('22222222-0000-0000-0000-000000000001', 'DAKLAK-CF-TONG', '11111111-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'RAW_MATERIAL', 'CREATED', 5000.00, 3000.00, 'f0000000-0000-0000-0000-000000000001', CURRENT_TIMESTAMP - INTERVAL '30 days');

INSERT INTO batch_events (id, batch_id, actor_user_id, event_type, metadata, created_by, created_at) VALUES 
(gen_random_uuid(), '22222222-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000002', 'CREATED', '{"note":"Thu hoạch rộ đợt 1"}', 'nongdan@daklak.com', CURRENT_TIMESTAMP - INTERVAL '30 days'),
(gen_random_uuid(), '22222222-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000002', 'FARMING_ACTIVITY', '{"action":"Phơi khô tự nhiên"}', 'nongdan@daklak.com', CURRENT_TIMESTAMP - INTERVAL '25 days'),
(gen_random_uuid(), '22222222-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 'SPLIT', '{"total_split_quantity": 2000.00}', 'giamdoc@daklak.com', CURRENT_TIMESTAMP - INTERVAL '20 days');


-- LÔ 2: Lô 2000kg CF Nhân sang tay Nhà máy -> Bị chế biến hết -> Còn 0kg (DEPLETED)
INSERT INTO batches (id, batch_code, product_id, creator_org_id, current_owner_org_id, product_type, status, initial_quantity, current_quantity, unit_id, created_at) VALUES
('22222222-0000-0000-0000-000000000002', 'FACTORY-RAW-01', '11111111-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000003', 'RAW_MATERIAL', 'DEPLETED', 2000.00, 0.00, 'f0000000-0000-0000-0000-000000000001', CURRENT_TIMESTAMP - INTERVAL '20 days');

INSERT INTO batch_lineage (parent_batch_id, child_batch_id, action_type, quantity, created_at) VALUES 
('22222222-0000-0000-0000-000000000001', '22222222-0000-0000-0000-000000000002', 'SPLIT', 2000.00, CURRENT_TIMESTAMP - INTERVAL '20 days');

INSERT INTO batch_events (id, batch_id, actor_user_id, event_type, metadata, created_by, created_at) VALUES
(gen_random_uuid(), '22222222-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000001', 'CREATED_FROM_SPLIT',  '{"parent":"DAKLAK-CF-TONG"}',                          'giamdoc@daklak.com',    CURRENT_TIMESTAMP - INTERVAL '20 days'),
(gen_random_uuid(), '22222222-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000004', 'STORED_AND_VERIFIED', '{"note":"Nhà máy đã nhận hàng"}',                       'quandoc@highlands.com', CURRENT_TIMESTAMP - INTERVAL '18 days'),
(gen_random_uuid(), '22222222-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000004', 'MERGED',              '{"used_quantity": 2000.00, "child_batch":"HL-ROASTED-B1"}', 'quandoc@highlands.com', CURRENT_TIMESTAMP - INTERVAL '15 days');


-- LÔ 3: Nhà máy chế biến ra 500 Hộp CF -> Bán 100 hộp cho Siêu thị -> Còn 400 hộp
INSERT INTO batches (id, batch_code, product_id, creator_org_id, current_owner_org_id, product_type, status, initial_quantity, current_quantity, unit_id, created_at) VALUES
('22222222-0000-0000-0000-000000000003', 'HL-ROASTED-B1', '11111111-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000003', 'PROCESSED_FOOD', 'READY_FOR_SALE', 500.00, 400.00, 'f0000000-0000-0000-0000-000000000002', CURRENT_TIMESTAMP - INTERVAL '15 days');

INSERT INTO batch_lineage (parent_batch_id, child_batch_id, action_type, quantity, created_at) VALUES 
('22222222-0000-0000-0000-000000000002', '22222222-0000-0000-0000-000000000003', 'MERGE', 2000.00, CURRENT_TIMESTAMP - INTERVAL '15 days');

INSERT INTO batch_events (id, batch_id, actor_user_id, event_type, metadata, created_by, created_at) VALUES
(gen_random_uuid(), '22222222-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000004', 'CREATED_FROM_MERGE', '{"note":"Đóng gói hoàn tất"}',          'quandoc@highlands.com', CURRENT_TIMESTAMP - INTERVAL '15 days'),
(gen_random_uuid(), '22222222-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000004', 'PROCESSING',        '{"action":"Kiểm tra ISO 9001: Đạt"}',    'quandoc@highlands.com', CURRENT_TIMESTAMP - INTERVAL '10 days'),
(gen_random_uuid(), '22222222-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000004', 'SPLIT',             '{"total_split_quantity": 100.00}',        'quandoc@highlands.com', CURRENT_TIMESTAMP - INTERVAL '5 days');


-- LÔ 4: 100 Hộp CF đã nằm tại quầy Siêu thị The Coffee House
INSERT INTO batches (id, batch_code, product_id, creator_org_id, current_owner_org_id, product_type, status, initial_quantity, current_quantity, unit_id, created_at) VALUES
('22222222-0000-0000-0000-000000000004', 'TCH-ROASTED-RETAIL', '11111111-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000004', 'PROCESSED_FOOD', 'READY_FOR_SALE', 100.00, 100.00, 'f0000000-0000-0000-0000-000000000002', CURRENT_TIMESTAMP - INTERVAL '5 days');

INSERT INTO batch_lineage (parent_batch_id, child_batch_id, action_type, quantity, created_at) VALUES
('22222222-0000-0000-0000-000000000003', '22222222-0000-0000-0000-000000000004', 'SPLIT', 100.00, CURRENT_TIMESTAMP - INTERVAL '5 days');

INSERT INTO batch_events (id, batch_id, actor_user_id, event_type, metadata, created_by, created_at) VALUES
(gen_random_uuid(), '22222222-0000-0000-0000-000000000004', 'd0000000-0000-0000-0000-000000000004', 'CREATED_FROM_SPLIT',  '{"parent":"HL-ROASTED-B1"}',         'quandoc@highlands.com',   CURRENT_TIMESTAMP - INTERVAL '5 days'),
(gen_random_uuid(), '22222222-0000-0000-0000-000000000004', 'd0000000-0000-0000-0000-000000000005', 'STORED_AND_VERIFIED', '{"note":"Đã lên kệ siêu thị TCH"}',  'kho@thecoffeehouse.com',  CURRENT_TIMESTAMP - INTERVAL '2 days');