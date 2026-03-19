# Tai lieu su dung API - BE-ShopAccount

Cap nhat: 2026-03-19

## 1) Tong quan

- Base URL local: `http://localhost:3000`
- Swagger UI: `GET /api`
- Global ValidationPipe: `whitelist = true`
- Khong co global prefix cho route API. Nghia la endpoint dung dang `/auth/login`, `/users`, ... (khong phai `/api/auth/login`).

## 2) Xac thuc JWT

### Header

- Dung header:

```http
Authorization: Bearer <access_token>
```

### Nhan token

- Nhan token tu:
  - `POST /auth/register`
  - `POST /auth/login`

### Token rotation (tu dong)

Voi cac route co guard JWT, server co the tra them header:

- `x-token-rotated: true`
- `x-access-token: <new_token>`

Neu co 2 header nay, client nen cap nhat token moi.

## 3) Danh sach enum quan trong

### UserRole

- `CUSTOMER`
- `ADMIN`

### UserStatus

- `ACTIVE`
- `BLOCKED`

### GameAccountStatus

- `AVAILABLE`
- `RESERVED`
- `SOLD`
- `HIDDEN`

### OrderStatus

- `PENDING`
- `PAID`
- `CANCELLED`
- `COMPLETED`

### TransactionStatus

- `PENDING`
- `SUCCESS`
- `FAILED`
- `REFUNDED`

### TransactionMethod

- `TOP_UP`
- `WITHDRAW`
- `TRANSFER`
- `PAYMENT`

### SellRequestStatus

- `PENDING`
- `APPROVED`
- `REJECTED`

### SupportTicketStatus

- `PENDING`
- `IN_PROGRESS`
- `RESOLVED`
- `REJECTED`

### BalanceAdjustDirection (wallet admin)

- `CREDIT`
- `DEBIT`

## 4) Auth

### POST /auth/register

Dang ky tai khoan.

Body:

```json
{
  "username": "string (required)",
  "email": "valid email (required)",
  "password": "string >= 6 (required)",
  "phone": "string (optional)"
}
```

Response 201:

```json
{
  "accessToken": "jwt",
  "user": {
    "id": "string",
    "username": "string",
    "email": "string",
    "phone": "string|null",
    "role": "CUSTOMER|ADMIN",
    "status": "ACTIVE|BLOCKED"
  }
}
```

Loi thuong gap:

- `409` Email hoac username da ton tai

### POST /auth/login

Dang nhap.

Body:

```json
{
  "email": "valid email (required)",
  "password": "string >= 6 (required)"
}
```

Response 200: giong `register`.

Loi thuong gap:

- `401` Sai email/password
- `403` Tai khoan bi khoa

## 5) Users

Luu y: module nay hien KHONG bat JWT guard.

### POST /users

Tao user moi (role mac dinh CUSTOMER).

Body:

```json
{
  "username": "string",
  "email": "valid email",
  "password": "string >= 6",
  "phone": "string (optional)"
}
```

### GET /users

Lay danh sach users (moi nhat truoc).

### GET /users/:id

Lay chi tiet user.

### PATCH /users/:id

Cap nhat user.

Body (tat ca optional):

```json
{
  "username": "string",
  "email": "valid email",
  "password": "string >= 6",
  "phone": "string",
  "role": "CUSTOMER|ADMIN",
  "status": "ACTIVE|BLOCKED"
}
```

### DELETE /users/:id

Xoa user.
Response: `204 No Content`

## 6) Game Categories

### POST /game-categories

Tao danh muc game.

- Content-Type: `multipart/form-data`
- Co the gui 1 trong 2 cach:
  - `icon` (URL string)
  - `iconFile` (file anh)
- Neu khong co ca `icon` va `iconFile` => `400`.

Fields:

- `name` (required)
- `slug` (required)
- `description` (optional)
- `isActive` (optional, boolean)
- `icon` (optional string)
- `iconFile` (optional image file, <= 10MB)

### GET /game-categories

Lay danh sach.

### GET /game-categories/:id

Lay chi tiet.

### PATCH /game-categories/:id

Cap nhat (JSON body theo `UpdateGameCategoryDto`).

### DELETE /game-categories/:id

Xoa.
Response: `204`

## 7) Game Accounts

### POST /game-accounts

Tao game account.

- Content-Type: `multipart/form-data`
- Anh upload qua field `imageFiles` (toi da 10 file, moi file <= 10MB)
- Co the gui them `images` la mang URL

Fields:

- `categoryId` (required)
- `username` (required)
- `email` (required, email)
- `password` (required)
- `price` (required, int >= 0)
- `status` (optional: `AVAILABLE|RESERVED|SOLD|HIDDEN`)
- `level` (optional, int >= 0)
- `rank` (optional)
- `images` (optional, string[] url)
- `description` (optional)

### GET /game-accounts

Lay danh sach.

### GET /game-accounts/:id

Lay chi tiet.

### PATCH /game-accounts/:id

Cap nhat (JSON).

### DELETE /game-accounts/:id

Xoa.
Response: `204`

## 8) Orders (can JWT)

Tat ca route duoi day can `Authorization: Bearer <token>`.

### POST /orders

Body:

```json
{
  "userId": "string (required)",
  "gameAccountId": "string (required)",
  "price": "int >= 0 (required)",
  "status": "PENDING|PAID|CANCELLED|COMPLETED (optional)"
}
```

### GET /orders

Lay danh sach.

### GET /orders/:id

Lay chi tiet.

### PATCH /orders/:id

Cap nhat theo field cua create (tat ca optional).

### DELETE /orders/:id

Xoa.
Response: `204`

## 9) Transactions (can JWT)

### POST /transactions

Body:

```json
{
  "userId": "string (required)",
  "orderId": "string (optional)",
  "method": "TOP_UP|WITHDRAW|TRANSFER|PAYMENT (required)",
  "recipientUserId": "string (required neu method=TRANSFER)",
  "price": "int >= 0 (required)",
  "status": "PENDING|SUCCESS|FAILED|REFUNDED (optional)"
}
```

Rule bo sung:

- Neu `method != TRANSFER`, `recipientUserId` se bi bo qua.
- Neu `method = TRANSFER`:
  - bat buoc co `recipientUserId`
  - `recipientUserId` khong duoc trung `userId`

### GET /transactions

Lay danh sach.

### GET /transactions/:id

Lay chi tiet.

### PATCH /transactions/:id

Cap nhat transaction.

### DELETE /transactions/:id

Xoa.
Response: `204`

## 10) Wallets (can JWT)

### POST /wallets/top-up

Body:

```json
{
  "amount": "int >= 1 (required)",
  "channel": "string (required)",
  "referenceId": "string <= 100 (optional)",
  "note": "string <= 255 (optional)"
}
```

Response tra ve thong tin so du truoc/sau + transaction.

### POST /wallets/withdraw

Body:

```json
{
  "amount": "int >= 1 (required)",
  "provider": "string (required)",
  "accountNumber": "string <= 50 (required)",
  "accountName": "string <= 100 (required)",
  "note": "string <= 255 (optional)"
}
```

Loi thuong gap:

- `400` Insufficient balance

### POST /wallets/transfer

Body:

```json
{
  "toUserId": "string (required)",
  "amount": "int >= 1 (required)",
  "message": "string <= 255 (optional)"
}
```

Loi thuong gap:

- `400` Cannot transfer to the same user
- `400` Insufficient balance

### GET /wallets/me/balance

Lay so du user hien tai.

### GET /wallets/me/history

Query:

- `page` (optional, int, default 1)
- `limit` (optional, int 1..100, default 20)
- `type` (optional: TransactionMethod)
- `status` (optional: TransactionStatus)
- `fromDate` (optional: ISO date string)
- `toDate` (optional: ISO date string)

Response:

```json
{
  "data": ["...transactions"],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

### POST /wallets/admin/adjust

Can role `ADMIN`.

Body:

```json
{
  "userId": "string (required)",
  "amount": "int >= 1 (required)",
  "direction": "CREDIT|DEBIT (required)",
  "reason": "string <= 255 (required)"
}
```

Loi thuong gap:

- `403` Admin role required
- `400` Insufficient balance (khi `DEBIT`)

## 11) Media (can JWT)

### POST /media/upload

Upload 1 anh len Cloudinary.

- Content-Type: `multipart/form-data`
- Fields:
  - `file` (required, image, <= 10MB)
  - `folder` (optional, <= 120)

Response:

```json
{
  "publicId": "string",
  "url": "string",
  "width": 100,
  "height": 100,
  "format": "jpg",
  "bytes": 12345,
  "folder": "string|undefined"
}
```

### GET /media/details?publicId=...

Lay metadata anh.

### GET /media/url?publicId=...

Lay URL anh:

```json
{ "url": "https://..." }
```

## 12) Sell Requests (can JWT)

### POST /sell-requests

Body:

```json
{
  "userId": "string (required)",
  "price": "int >= 0 (required)",
  "accountUsername": "string (required)",
  "accountPassword": "string (required)",
  "status": "PENDING|APPROVED|REJECTED (optional)",
  "description": "string (optional)",
  "rejectReason": "string (optional)"
}
```

### GET /sell-requests

Lay danh sach.

### GET /sell-requests/:id

Lay chi tiet.

### PATCH /sell-requests/:id

Cap nhat.

### DELETE /sell-requests/:id

Xoa.
Response: `204`

## 13) Support Tickets (can JWT)

### POST /support-tickets

Body:

```json
{
  "userId": "string (required)",
  "title": "string (required)",
  "description": "string (required)",
  "category": "string (required)",
  "status": "PENDING|IN_PROGRESS|RESOLVED|REJECTED (optional)"
}
```

### GET /support-tickets

Lay danh sach.

### GET /support-tickets/:id

Lay chi tiet.

### PATCH /support-tickets/:id

Cap nhat.

### DELETE /support-tickets/:id

Xoa.
Response: `204`

## 14) Loi chung va ma trang thai

- `200`: Thanh cong
- `201`: Tao moi thanh cong
- `204`: Xoa thanh cong (khong co body)
- `400`: Sai du lieu, vi pham business rule (vd: khong du so du)
- `401`: Thieu token/invalid token/sai thong tin dang nhap
- `403`: Bi khoa tai khoan hoac khong du quyen admin
- `404`: Khong tim thay tai nguyen
- `409`: Trung du lieu unique

## 15) Vi du goi nhanh bang curl

### Dang nhap

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@shopaccount.local","password":"Admin@123"}'
```

### Lay so du vi

```bash
curl http://localhost:3000/wallets/me/balance \
  -H "Authorization: Bearer <token>"
```

### Upload anh

```bash
curl -X POST http://localhost:3000/media/upload \
  -H "Authorization: Bearer <token>" \
  -F "file=@C:/tmp/demo.jpg" \
  -F "folder=game-accounts"
```

## 16) Luu y van hanh

- Module media se fail ngay luc khoi dong neu thieu bien moi truong Cloudinary:
  - `CLOUDINARY_CLOUD_NAME`
  - `CLOUDINARY_API_KEY`
  - `CLOUDINARY_API_SECRET`
- `Order.gameAccountId` la unique trong DB: 1 game account chi thuoc 1 order.
- Nhiem vu phan quyen hien tai chu yeu nam o guard JWT va check role tai route admin wallet.
