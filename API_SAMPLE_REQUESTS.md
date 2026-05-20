# API Sample Requests (All Controllers)

> Base URL: `{{BASE_URL}}`

## Auth (`/api/v1/auth`)

### POST /api/v1/auth/login
Mô tả: API đăng nhập.

```json
{
  "email": "",
  "password": ""
}
```

### POST /api/v1/auth/logout
Mô tả: API đăng xuất.

```json
{
  "token": ""
}
```

### POST /api/v1/auth/refresh
Mô tả: API làm mới access token.

```json
{
  "refreshToken": ""
}
```

### POST /api/v1/auth/introspect
Mô tả: API kiểm tra token.

```json
{
  "token": ""
}
```

## Identity - Users (`/api/v1/users`)

### POST /api/v1/users
Mô tả: API tạo user (nhân viên).

```json
{
  "email": "",
  "password": "",
  "fullName": "",
  "roleCodes": [""
  ]
}
```

### GET /api/v1/users
Mô tả: API lấy danh sách nhân viên trong tổ chức.

### GET /api/v1/users/me
Mô tả: API lấy hồ sơ cá nhân.

### PUT /api/v1/users/{id}/roles
Mô tả: API gán/cập nhật vai trò cho nhân viên.

```json
{
  "roleCodes": [""
  ]
}
```

### DELETE /api/v1/users/{id}
Mô tả: API vô hiệu hóa tài khoản nhân viên.

## Identity - Roles (`/api/v1/roles`)

### GET /api/v1/roles
Mô tả: API lấy danh sách vai trò.

## Identity - Permissions (`/api/v1/permissions`)

### GET /api/v1/permissions
Mô tả: API lấy danh sách quyền.

## Identity - Organizations (`/api/v1/organizations`)

### POST /api/v1/organizations/register
Mô tả: API đăng ký tổ chức (kèm tạo admin).

```json
{
  "orgWalletAddress": "",
  "name": "",
  "taxCode": "",
  "representativeName": "",
  "documents": [
    {
      "documentType": "",
      "documentName": "",
      "cid": "",
      "expirationDate": ""
    }
  ],
  "addressDetail": "",
  "orgType": "",
  "adminEmail": "",
  "adminPassword": "",
  "adminFullName": ""
}
```

### GET /api/v1/organizations
Mô tả: API lấy danh sách tất cả tổ chức.

### GET /api/v1/organizations/{id}
Mô tả: API lấy thông tin chi tiết tổ chức.

### PUT /api/v1/organizations/{id}
Mô tả: API cập nhật thông tin tổ chức.

```json
{
  "name": "",
  "taxCode": "",
  "representativeName": "",
  "addressDetail": ""
}
```

### PATCH /api/v1/organizations/{id}/status?status=
Mô tả: API cập nhật trạng thái tổ chức.

### POST /api/v1/organizations/{id}/documents
Mô tả: API thêm tài liệu/chứng chỉ cho tổ chức.

```json
{
  "documentType": "",
  "documentName": "",
  "cid": "",
  "expirationDate": ""
}
```

## Master Data (`/api/v1/master`)

### GET /api/v1/master/categories
Mô tả: API lấy danh mục loại sản phẩm.

### GET /api/v1/master/units
Mô tả: API lấy danh mục đơn vị tính.

## Traceability - Products (`/api/v1/products`)

### POST /api/v1/products
Mô tả: API tạo sản phẩm.

```json
{
  "categoryId": "",
  "name": "",
  "description": "",
  "skuCode": "",
  "imageCids": [""
  ],
  "attributes": {
  }
}
```

### GET /api/v1/products
Mô tả: API lấy danh sách sản phẩm theo tổ chức.

### GET /api/v1/products/{id}
Mô tả: API lấy chi tiết sản phẩm.

### PUT /api/v1/products/{id}
Mô tả: API cập nhật sản phẩm.

```json
{
  "categoryId": "",
  "name": "",
  "description": "",
  "skuCode": "",
  "imageCids": [""
  ],
  "attributes": {
  }
}
```

## Traceability - Batches (`/api/v1/batches`)

### POST /api/v1/batches
Mô tả: API tạo lô hàng.

```json
{
  "batchCode": "",
  "productId": "",
  "productType": "",
  "initialQuantity": null,
  "unitId": ""
}
```

### POST /api/v1/batches/{batchId}/events
Mô tả: API thêm sự kiện cho lô hàng.

```json
{
  "eventType": "",
  "gpsLatitude": null,
  "gpsLongitude": null,
  "deviceInfo": "",
  "imageCids": [""
  ],
  "metadata": {
  }
}
```

### PATCH /api/v1/batches/{batchId}/status?status=
Mô tả: API cập nhật trạng thái lô hàng.

### GET /api/v1/batches
Mô tả: API lấy danh sách lô hàng theo tổ chức.

### GET /api/v1/batches/{batchId}
Mô tả: API lấy chi tiết lô hàng.

### GET /api/v1/batches/{batchId}/events
Mô tả: API lấy danh sách sự kiện của lô hàng.

## Traceability - Batch Graph (`/api/v1`)

### POST /api/v1/batches/merge
Mô tả: API gộp lô hàng.

```json
{
  "newBatchCode": "",
  "newProductId": "",
  "productType": "",
  "producedQuantity": null,
  "unitId": "",
  "parents": [
    {
      "batchId": "",
      "quantityUsed": null
    }
  ]
}
```

### POST /api/v1/batches/split
Mô tả: API tách lô hàng.

```json
{
  "parentBatchId": "",
  "children": [
    {
      "newBatchCode": "",
      "targetOrgId": "",
      "quantity": null
    }
  ]
}
```

### GET /api/v1/traceability/{batchId}/tree
Mô tả: API lấy cây truy xuất nguồn gốc.

## IPFS (`/api/v1/ipfs`)

### POST /api/v1/ipfs/upload
Mô tả: API upload file lên IPFS (multipart/form-data).

```
form-data
file:
```
{
"newBatchCode": "KIMCHI-M2",
"newProductId": "pro00000-0000-0000-0000-000000000002",
"productType": "PROCESSED_FOOD",
"producedQuantity": 150,
"unitId": "uni00000-0000-0000-0000-000000000002",
"parents": [
{
"batchId": "bat00000-0000-0000-0000-000000000002",
"quantityUsed": 300.00
}
]
}

#### 2. HTX tách nốt 500kg Bắp cải gốc để bán nốt
* **URL:** `POST {{BASE_URL}}/api/v1/batches/split`
* **Headers:** * `X-Org-Id: org00000-0000-0000-0000-000000000001` (Hợp tác xã)
    * `X-User-Id: usr00000-0000-0000-0000-000000000001`
* **Body:**
```json
{
    "parentBatchId": "bat00000-0000-0000-0000-000000000001",
    "children": [
        {
            "newBatchCode": "DALAT-BC-KHAC",
            "targetOrgId": "org00000-0000-0000-0000-000000000003",
            "quantity": 500.00
        }
    ]
}

Giờ đây, bạn có một nền tảng dữ liệu đồ thị chằng chịt, được thiết kế hoàn hảo để chúng ta bắt đầu **Phase 5 (Viết câu lệnh SQL Đệ quy WITH RECURSIVE)** truy vết từ hộp Kim chi trong siêu thị (`bat00000...04`) ngược về tận cây bắp cải ở Đà Lạt (`bat00000...01`). Nếu bạn sẵn sàng, chúng ta sẽ bắt đầu Phase 5 ngay lập tức!
