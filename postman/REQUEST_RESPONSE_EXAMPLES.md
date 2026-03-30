# Postman Request-Response Examples

Cap nhat: 2026-03-19

Tai lieu nay cung cap bo vi du request-response chi tiet cho tung endpoint. Ban co the copy body vao Postman va tao Example response tu cac mau ben duoi.

## 1. Collection variables de nghi

- baseUrl = http://localhost:3000
- authToken = de trong luc dau, set sau khi login
- userId = id user can thao tac
- targetUserId = id user nhan tien khi transfer
- gameCategoryId = id danh muc
- gameAccountId = id tai khoan game
- mediaPublicId = public_id cloudinary
- orderId = id order
- transactionId = id transaction
- sellRequestId = id sell request
- supportTicketId = id support ticket

## 2. Auth

### 2.1 POST /auth/register

Request body (raw JSON):

```json
{
  "username": "auth_postman",
  "email": "auth_postman@example.com",
  "password": "Auth@123",
  "phone": "0901234567"
}
```

Response 201:

```json
{
  "accessToken": "eyJhbGciOiJI...",
  "user": {
    "id": "usr_abc123",
    "username": "auth_postman",
    "email": "auth_postman@example.com",
    "phone": "0901234567",
    "role": "CUSTOMER",
    "status": "ACTIVE"
  }
}
```

Response loi 409:

```json
{
  "statusCode": 409,
  "message": "Email or username already exists",
  "error": "Conflict"
}
```

### 2.2 POST /auth/login

Request body (raw JSON):

```json
{
  "email": "auth_postman@example.com",
  "password": "Auth@123"
}
```

Response 200:

```json
{
  "accessToken": "eyJhbGciOiJI...",
  "user": {
    "id": "usr_abc123",
    "username": "auth_postman",
    "email": "auth_postman@example.com",
    "phone": "0901234567",
    "role": "CUSTOMER",
    "status": "ACTIVE"
  }
}
```

Response loi 401:

```json
{
  "statusCode": 401,
  "message": "Invalid email or password",
  "error": "Unauthorized"
}
```

## 3. Users (khong bat JWT)

### 3.1 POST /users

Request body:

```json
{
  "username": "user_postman",
  "email": "user_postman@example.com",
  "password": "User@123",
  "phone": "0900000000"
}
```

Response 201:

```json
{
  "id": "usr_001",
  "username": "user_postman",
  "email": "user_postman@example.com",
  "passwordHash": "$2b$10$...",
  "role": "CUSTOMER",
  "status": "ACTIVE",
  "phone": "0900000000",
  "balance": 0,
  "balanceUpdatedAt": null,
  "createdAt": "2026-03-19T08:00:00.000Z",
  "updatedAt": "2026-03-19T08:00:00.000Z"
}
```

### 3.2 GET /users

Response 200:

```json
[
  {
    "id": "usr_001",
    "username": "user_postman",
    "email": "user_postman@example.com",
    "passwordHash": "$2b$10$...",
    "role": "CUSTOMER",
    "status": "ACTIVE",
    "phone": "0900000000",
    "balance": 0,
    "balanceUpdatedAt": null,
    "createdAt": "2026-03-19T08:00:00.000Z",
    "updatedAt": "2026-03-19T08:00:00.000Z"
  }
]
```

### 3.3 GET /users/:id

URL example: {{baseUrl}}/users/{{userId}}

Response 200:

```json
{
  "id": "usr_001",
  "username": "user_postman",
  "email": "user_postman@example.com",
  "passwordHash": "$2b$10$...",
  "role": "CUSTOMER",
  "status": "ACTIVE",
  "phone": "0900000000",
  "balance": 0,
  "balanceUpdatedAt": null,
  "createdAt": "2026-03-19T08:00:00.000Z",
  "updatedAt": "2026-03-19T08:00:00.000Z"
}
```

Response loi 404:

```json
{
  "statusCode": 404,
  "message": "User #{{userId}} not found",
  "error": "Not Found"
}
```

### 3.4 PATCH /users/:id

Request body:

```json
{
  "phone": "0911111111",
  "status": "ACTIVE"
}
```

Response 200:

```json
{
  "id": "usr_001",
  "username": "user_postman",
  "email": "user_postman@example.com",
  "passwordHash": "$2b$10$...",
  "role": "CUSTOMER",
  "status": "ACTIVE",
  "phone": "0911111111",
  "balance": 0,
  "balanceUpdatedAt": null,
  "createdAt": "2026-03-19T08:00:00.000Z",
  "updatedAt": "2026-03-19T08:10:00.000Z"
}
```

### 3.5 DELETE /users/:id

Response 204: khong co body

### 3.6 PATCH /users/:id/admin-update (ADMIN only)

Chi cho phep cap nhat: `phone`, `role`, `status`.

Khong cho phep cap nhat qua endpoint nay: `username`, `email`, `password`, `balance`, `balanceUpdatedAt`.

Request body:

```json
{
  "phone": "0911222333",
  "role": "CUSTOMER",
  "status": "ACTIVE"
}
```

Response 200:

```json
{
  "id": "usr_001",
  "username": "user_postman",
  "email": "user_postman@example.com",
  "passwordHash": "$2b$10$...",
  "role": "CUSTOMER",
  "status": "ACTIVE",
  "phone": "0911222333",
  "balance": 0,
  "balanceUpdatedAt": null,
  "createdAt": "2026-03-19T08:00:00.000Z",
  "updatedAt": "2026-03-19T08:15:00.000Z"
}
```

Response loi 403:

```json
{
  "statusCode": 403,
  "message": "Admin role required",
  "error": "Forbidden"
}
```

## 4. Game Categories

### 4.1 POST /game-categories

Content-Type: form-data

Form-data sample:

- name = Valorant
- slug = valorant
- description = Valorant accounts
- isActive = true
- iconFile = (chon file anh)

Hoac gui icon URL:

- icon = https://example.com/icon.png

Response 201:

```json
{
  "id": "cat_001",
  "name": "Valorant",
  "slug": "valorant",
  "icon": "https://res.cloudinary.com/demo/image/upload/v1/cat.png",
  "description": "Valorant accounts",
  "isActive": true,
  "createdAt": "2026-03-19T08:20:00.000Z",
  "updatedAt": "2026-03-19T08:20:00.000Z"
}
```

### 4.2 GET /game-categories

Response 200:

```json
[
  {
    "id": "cat_001",
    "name": "Valorant",
    "slug": "valorant",
    "icon": "https://res.cloudinary.com/demo/image/upload/v1/cat.png",
    "description": "Valorant accounts",
    "isActive": true,
    "createdAt": "2026-03-19T08:20:00.000Z",
    "updatedAt": "2026-03-19T08:20:00.000Z"
  }
]
```

### 4.3 GET /game-categories/:id

Response 200: 1 object category (giong item trong list)

### 4.4 PATCH /game-categories/:id

Request body:

```json
{
  "description": "Updated category description",
  "isActive": true
}
```

Response 200:

```json
{
  "id": "cat_001",
  "name": "Valorant",
  "slug": "valorant",
  "icon": "https://res.cloudinary.com/demo/image/upload/v1/cat.png",
  "description": "Updated category description",
  "isActive": true,
  "createdAt": "2026-03-19T08:20:00.000Z",
  "updatedAt": "2026-03-19T08:25:00.000Z"
}
```

### 4.5 DELETE /game-categories/:id

Response 204: khong co body

## 5. Game Accounts

### 5.1 POST /game-accounts

Content-Type: form-data

Form-data sample:

- categoryId = {{gameCategoryId}}
- username = ga_postman_001
- email = ga_postman_001@example.com
- password = secret001
- price = 120000
- status = AVAILABLE
- level = 20
- rank = Gold
- description = Postman created account
- imageFiles = (chon 1 hoac nhieu file anh)

Response 201:

```json
{
  "id": "ga_001",
  "categoryId": "cat_001",
  "username": "ga_postman_001",
  "email": "ga_postman_001@example.com",
  "password": "secret001",
  "price": 120000,
  "status": "AVAILABLE",
  "level": 20,
  "rank": "Gold",
  "images": ["https://res.cloudinary.com/demo/image/upload/v1/ga1.png"],
  "description": "Postman created account",
  "createdAt": "2026-03-19T08:30:00.000Z",
  "updatedAt": "2026-03-19T08:30:00.000Z"
}
```

### 5.2 GET /game-accounts

Response 200: list game accounts

```json
[
  {
    "id": "ga_001",
    "categoryId": "cat_001",
    "username": "ga_postman_001",
    "email": "ga_postman_001@example.com",
    "password": "secret001",
    "price": 120000,
    "status": "AVAILABLE",
    "level": 20,
    "rank": "Gold",
    "images": ["https://res.cloudinary.com/demo/image/upload/v1/ga1.png"],
    "description": "Postman created account",
    "createdAt": "2026-03-19T08:30:00.000Z",
    "updatedAt": "2026-03-19T08:30:00.000Z"
  }
]
```

### 5.3 GET /game-accounts/:id

Response 200: 1 object game account

### 5.4 PATCH /game-accounts/:id

Request body:

```json
{
  "price": 150000,
  "status": "RESERVED",
  "description": "Reserved by test order"
}
```

Response 200:

```json
{
  "id": "ga_001",
  "categoryId": "cat_001",
  "username": "ga_postman_001",
  "email": "ga_postman_001@example.com",
  "password": "secret001",
  "price": 150000,
  "status": "RESERVED",
  "level": 20,
  "rank": "Gold",
  "images": ["https://res.cloudinary.com/demo/image/upload/v1/ga1.png"],
  "description": "Reserved by test order",
  "createdAt": "2026-03-19T08:30:00.000Z",
  "updatedAt": "2026-03-19T08:35:00.000Z"
}
```

### 5.5 DELETE /game-accounts/:id

Response 204: khong co body

## 6. Orders (can JWT)

Header:

- Authorization: Bearer {{authToken}}

### 6.1 POST /orders

Request body:

```json
{
  "userId": "{{userId}}",
  "gameAccountId": "{{gameAccountId}}",
  "price": 150000,
  "status": "PENDING"
}
```

Response 201:

```json
{
  "id": "ord_001",
  "userId": "usr_001",
  "gameAccountId": "ga_001",
  "price": 150000,
  "status": "PENDING",
  "createdAt": "2026-03-19T08:40:00.000Z",
  "updatedAt": "2026-03-19T08:40:00.000Z"
}
```

### 6.2 GET /orders

Response 200:

```json
[
  {
    "id": "ord_001",
    "userId": "usr_001",
    "gameAccountId": "ga_001",
    "price": 150000,
    "status": "PENDING",
    "createdAt": "2026-03-19T08:40:00.000Z",
    "updatedAt": "2026-03-19T08:40:00.000Z"
  }
]
```

### 6.3 GET /orders/:id

Response 200: 1 object order

### 6.4 PATCH /orders/:id

Request body:

```json
{
  "status": "PAID"
}
```

Response 200:

```json
{
  "id": "ord_001",
  "userId": "usr_001",
  "gameAccountId": "ga_001",
  "price": 150000,
  "status": "PAID",
  "createdAt": "2026-03-19T08:40:00.000Z",
  "updatedAt": "2026-03-19T08:50:00.000Z"
}
```

### 6.5 DELETE /orders/:id

Response 204: khong co body

## 7. Transactions (can JWT)

Header:

- Authorization: Bearer {{authToken}}

### 7.1 POST /transactions

Request body:

```json
{
  "userId": "{{userId}}",
  "orderId": "{{orderId}}",
  "method": "PAYMENT",
  "price": 150000,
  "status": "SUCCESS"
}
```

Response 201:

```json
{
  "id": "txn_001",
  "userId": "usr_001",
  "orderId": "ord_001",
  "recipientUserId": null,
  "method": "PAYMENT",
  "price": 150000,
  "status": "SUCCESS",
  "createdAt": "2026-03-19T08:55:00.000Z",
  "updatedAt": "2026-03-19T08:55:00.000Z"
}
```

Transfer example body:

```json
{
  "userId": "{{userId}}",
  "method": "TRANSFER",
  "recipientUserId": "{{targetUserId}}",
  "price": 50000,
  "status": "SUCCESS"
}
```

### 7.2 GET /transactions

Response 200: list transactions

### 7.3 GET /transactions/:id

Response 200: 1 object transaction

### 7.4 PATCH /transactions/:id

Request body:

```json
{
  "status": "REFUNDED"
}
```

Response 200:

```json
{
  "id": "txn_001",
  "userId": "usr_001",
  "orderId": "ord_001",
  "recipientUserId": null,
  "method": "PAYMENT",
  "price": 150000,
  "status": "REFUNDED",
  "createdAt": "2026-03-19T08:55:00.000Z",
  "updatedAt": "2026-03-19T09:00:00.000Z"
}
```

### 7.5 DELETE /transactions/:id

Response 204: khong co body

## 8. Wallets (can JWT)

Header:

- Authorization: Bearer {{authToken}}

### 8.1 POST /wallets/top-up

Request body:

```json
{
  "amount": 200000,
  "channel": "BANK_TRANSFER",
  "referenceId": "TOPUP_20260319_0001",
  "note": "Nap tien test"
}
```

Response 201:

```json
{
  "userId": "usr_001",
  "balanceBefore": 300000,
  "balanceAfter": 500000,
  "balanceUpdatedAt": "2026-03-19T09:05:00.000Z",
  "transaction": {
    "id": "txn_topup_001",
    "userId": "usr_001",
    "orderId": null,
    "recipientUserId": null,
    "method": "TOP_UP",
    "price": 200000,
    "status": "SUCCESS",
    "createdAt": "2026-03-19T09:05:00.000Z",
    "updatedAt": "2026-03-19T09:05:00.000Z"
  }
}
```

### 8.2 POST /wallets/withdraw

Request body:

```json
{
  "amount": 100000,
  "provider": "VCB",
  "accountNumber": "0123456789",
  "accountName": "NGUYEN VAN A",
  "note": "Rut tien test"
}
```

Response 201:

```json
{
  "userId": "usr_001",
  "balanceBefore": 500000,
  "balanceAfter": 400000,
  "balanceUpdatedAt": "2026-03-19T09:10:00.000Z",
  "transaction": {
    "id": "txn_withdraw_001",
    "userId": "usr_001",
    "orderId": null,
    "recipientUserId": null,
    "method": "WITHDRAW",
    "price": 100000,
    "status": "SUCCESS",
    "createdAt": "2026-03-19T09:10:00.000Z",
    "updatedAt": "2026-03-19T09:10:00.000Z"
  }
}
```

Response loi 400:

```json
{
  "statusCode": 400,
  "message": "Insufficient balance",
  "error": "Bad Request"
}
```

### 8.3 POST /wallets/transfer

Request body:

```json
{
  "toUserId": "{{targetUserId}}",
  "amount": 50000,
  "message": "Chuyen tien test"
}
```

Response 201:

```json
{
  "fromUser": {
    "userId": "usr_001",
    "balanceBefore": 400000,
    "balanceAfter": 350000,
    "transaction": {
      "id": "txn_transfer_debit_001",
      "userId": "usr_001",
      "recipientUserId": "usr_002",
      "method": "TRANSFER",
      "price": 50000,
      "status": "SUCCESS"
    }
  },
  "toUser": {
    "userId": "usr_002",
    "balanceBefore": 100000,
    "balanceAfter": 150000,
    "transaction": {
      "id": "txn_transfer_credit_001",
      "userId": "usr_002",
      "recipientUserId": "usr_001",
      "method": "TRANSFER",
      "price": 50000,
      "status": "SUCCESS"
    }
  }
}
```

### 8.4 GET /wallets/me/balance

Response 200:

```json
{
  "userId": "usr_001",
  "balance": 350000,
  "balanceUpdatedAt": "2026-03-19T09:15:00.000Z"
}
```

### 8.5 GET /wallets/me/history

Query sample:

- page=1
- limit=20
- type=TRANSFER
- status=SUCCESS

Response 200:

```json
{
  "data": [
    {
      "id": "txn_transfer_debit_001",
      "userId": "usr_001",
      "orderId": null,
      "recipientUserId": "usr_002",
      "method": "TRANSFER",
      "price": 50000,
      "status": "SUCCESS",
      "createdAt": "2026-03-19T09:15:00.000Z",
      "updatedAt": "2026-03-19T09:15:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "totalPages": 1
  }
}
```

### 8.6 POST /wallets/admin/adjust (ADMIN only)

Request body:

```json
{
  "userId": "{{targetUserId}}",
  "amount": 70000,
  "direction": "CREDIT",
  "reason": "Manual adjustment by admin"
}
```

Response 201:

```json
{
  "userId": "usr_002",
  "balanceBefore": 150000,
  "balanceAfter": 220000,
  "balanceUpdatedAt": "2026-03-19T09:20:00.000Z",
  "reason": "Manual adjustment by admin",
  "transaction": {
    "id": "txn_admin_adjust_001",
    "userId": "usr_002",
    "orderId": null,
    "recipientUserId": null,
    "method": "TOP_UP",
    "price": 70000,
    "status": "SUCCESS"
  }
}
```

Response loi 403:

```json
{
  "statusCode": 403,
  "message": "Admin role required",
  "error": "Forbidden"
}
```

## 9. Media (can JWT)

Header:

- Authorization: Bearer {{authToken}}

### 9.1 POST /media/upload

Content-Type: form-data

Form-data sample:

- file = (chon file anh)
- folder = shop-account

Response 201:

```json
{
  "publicId": "shop-account/demo_123",
  "url": "https://res.cloudinary.com/demo/image/upload/v1/shop-account/demo_123.jpg",
  "width": 1024,
  "height": 768,
  "format": "jpg",
  "bytes": 125300,
  "folder": "shop-account"
}
```

### 9.2 GET /media/details?publicId={{mediaPublicId}}

Response 200:

```json
{
  "publicId": "shop-account/demo_123",
  "url": "https://res.cloudinary.com/demo/image/upload/v1/shop-account/demo_123.jpg",
  "width": 1024,
  "height": 768,
  "format": "jpg",
  "bytes": 125300,
  "createdAt": "2026-03-19T09:25:00.000Z"
}
```

### 9.3 GET /media/url?publicId={{mediaPublicId}}

Response 200:

```json
{
  "url": "https://res.cloudinary.com/demo/image/upload/v1/shop-account/demo_123.jpg"
}
```

## 10. Sell Requests (can JWT)

Header:

- Authorization: Bearer {{authToken}}

### 10.1 POST /sell-requests

Request body:

```json
{
  "userId": "{{userId}}",
  "price": 300000,
  "accountUsername": "seller_game_acc",
  "accountPassword": "seller_pass_001",
  "status": "PENDING",
  "description": "Account rank Diamond"
}
```

Response 201:

```json
{
  "id": "sr_001",
  "userId": "usr_001",
  "price": 300000,
  "status": "PENDING",
  "description": "Account rank Diamond",
  "rejectReason": null,
  "accountUsername": "seller_game_acc",
  "accountPassword": "seller_pass_001",
  "createdAt": "2026-03-19T09:30:00.000Z",
  "updatedAt": "2026-03-19T09:30:00.000Z"
}
```

### 10.2 GET /sell-requests

Response 200: list sell requests

### 10.3 GET /sell-requests/:id

Response 200: 1 object sell request

### 10.4 PATCH /sell-requests/:id

Request body:

```json
{
  "status": "APPROVED",
  "rejectReason": null
}
```

Response 200:

```json
{
  "id": "sr_001",
  "userId": "usr_001",
  "price": 300000,
  "status": "APPROVED",
  "description": "Account rank Diamond",
  "rejectReason": null,
  "accountUsername": "seller_game_acc",
  "accountPassword": "seller_pass_001",
  "createdAt": "2026-03-19T09:30:00.000Z",
  "updatedAt": "2026-03-19T09:35:00.000Z"
}
```

### 10.5 DELETE /sell-requests/:id

Response 204: khong co body

## 11. Support Tickets (can JWT)

Header:

- Authorization: Bearer {{authToken}}

Luu y phan quyen:

- User thuong chi xem duoc ticket cua chinh ho.
- User thuong khong duoc doi `status` qua PATCH.
- Admin moi duoc start-processing/reply va cap nhat trang thai xu ly.

### 11.1 POST /support-tickets

Request body:

```json
{
  "title": "Cannot login game account",
  "description": "Bought account but login failed",
  "category": "account"
}
```

Response 201:

```json
{
  "id": "st_001",
  "userId": "usr_001",
  "title": "Cannot login game account",
  "description": "Bought account but login failed",
  "category": "account",
  "status": "PENDING",
  "handledBy": null,
  "handledAt": null,
  "resolvedAt": null,
  "replies": [],
  "createdAt": "2026-03-19T09:40:00.000Z",
  "updatedAt": "2026-03-19T09:40:00.000Z"
}
```

### 11.2 GET /support-tickets

Response 200: list support tickets

### 11.3 GET /support-tickets/:id

Response 200: 1 object support ticket

### 11.4 PATCH /support-tickets/:id

Request body:

```json
{
  "status": "IN_PROGRESS",
  "description": "Agent is checking login logs"
}
```

Response 200:

```json
{
  "id": "st_001",
  "userId": "usr_001",
  "title": "Cannot login game account",
  "description": "Agent is checking login logs",
  "category": "account",
  "status": "IN_PROGRESS",
  "createdAt": "2026-03-19T09:40:00.000Z",
  "updatedAt": "2026-03-19T09:45:00.000Z"
}
```

### 11.5 POST /support-tickets/:id/start-processing (Admin)

Request body: `{}`

Response 200:

```json
{
  "id": "st_001",
  "status": "IN_PROGRESS",
  "handledBy": "admin_001",
  "handledAt": "2026-03-19T09:46:00.000Z",
  "resolvedAt": null
}
```

### 11.6 POST /support-tickets/:id/reply (Admin)

Request body:

```json
{
  "message": "Da tiep nhan ticket, chung toi dang kiem tra.",
  "status": "IN_PROGRESS"
}
```

Response 200:

```json
{
  "id": "st_001",
  "status": "IN_PROGRESS",
  "handledBy": "admin_001",
  "handledAt": "2026-03-19T09:46:00.000Z",
  "replies": [
    {
      "id": "str_001",
      "message": "Da tiep nhan ticket, chung toi dang kiem tra.",
      "admin": {
        "id": "admin_001",
        "username": "admin",
        "email": "admin@shopaccount.local"
      },
      "createdAt": "2026-03-19T09:47:00.000Z"
    }
  ]
}
```

### 11.7 DELETE /support-tickets/:id

Response 204: khong co body

## 12. Postman tests goi y de tu dong luu bien

Ban co the them script nay vao tab Tests cua request login:

```javascript
pm.test('Login success', function () {
  pm.response.to.have.status(200);
});

const jsonData = pm.response.json();
if (jsonData.accessToken) {
  pm.collectionVariables.set('authToken', jsonData.accessToken);
}
if (jsonData.user && jsonData.user.id) {
  pm.collectionVariables.set('userId', jsonData.user.id);
}
```

Script luu id sau khi tao category/account/order:

```javascript
const jsonData = pm.response.json();
if (jsonData.id) {
  pm.collectionVariables.set('gameCategoryId', jsonData.id);
}
```

(doi key bien theo endpoint: gameAccountId, orderId, transactionId, sellRequestId, supportTicketId)

## 13. Xu ly loi thuong gap khi goi sai API (NestJS)

Muc nay giup debug nhanh cac loi hay gap khi goi sai endpoint/method/header/body trong Postman.

### 13.1 404 Cannot GET/POST/PATCH...

Dau hieu response:

```json
{
  "statusCode": 404,
  "message": "Cannot GET /api/users",
  "error": "Not Found"
}
```

Nguyen nhan thuong gap:

- Sai path. Du an nay khong dung global prefix cho API route.
- Goi nham method (vi du endpoint chi ho tro POST nhung lai goi GET).
- Sai path param (vi du /users/id thay vi /users/{{userId}}).

Cach xu ly nhanh:

- Kiem tra lai baseUrl: http://localhost:3000
- Doi tu /api/users thanh /users neu dang goi nham prefix.
- Doi dung method theo controller.

### 13.2 401 Unauthorized

Dau hieu response:

```json
{
  "statusCode": 401,
  "message": "Missing bearer token",
  "error": "Unauthorized"
}
```

hoac:

```json
{
  "statusCode": 401,
  "message": "Invalid token",
  "error": "Unauthorized"
}
```

Nguyen nhan thuong gap:

- Quen header Authorization.
- Sai format token (thieu chu Bearer).
- Token het hieu luc hoac token copy sai.

Cach xu ly nhanh:

- Header phai dung: Authorization = Bearer {{authToken}}
- Dang nhap lai qua /auth/login de lay token moi.
- Kiem tra script Tests co luu authToken thanh cong hay chua.

### 13.3 403 Forbidden

Dau hieu response:

```json
{
  "statusCode": 403,
  "message": "Admin role required",
  "error": "Forbidden"
}
```

hoac:

```json
{
  "statusCode": 403,
  "message": "Your account has been blocked",
  "error": "Forbidden"
}
```

Nguyen nhan thuong gap:

- Goi route chi danh cho admin (vd: /wallets/admin/adjust) bang token customer.
- Tai khoan dang o trang thai BLOCKED.

Cach xu ly nhanh:

- Dang nhap bang tai khoan role ADMIN.
- Kiem tra status user trong DB (ACTIVE/BLOCKED).

### 13.4 400 Bad Request (validation sai)

Dau hieu response:

```json
{
  "statusCode": 400,
  "message": [
    "email must be an email",
    "password must be longer than or equal to 6 characters"
  ],
  "error": "Bad Request"
}
```

Nguyen nhan thuong gap:

- Sai kieu du lieu (gui string thay vi number, sai enum, sai email format).
- Thieu field bat buoc.
- Gui body sai mode (dang can form-data nhung lai gui raw JSON).

Cach xu ly nhanh:

- Doi chieu DTO cua endpoint.
- Voi upload anh, chuyen sang Body -> form-data.
- Voi wallet/transaction, dam bao amount/price la so hop le.

### 13.5 409 Conflict (duplicate unique)

Dau hieu response:

```json
{
  "statusCode": 409,
  "message": "Email or username already exists",
  "error": "Conflict"
}
```

Nguyen nhan thuong gap:

- Tao user trung email/username.
- Tao game category trung slug/name.

Cach xu ly nhanh:

- Doi gia tri unique truoc khi goi lai.

### 13.6 413 Payload Too Large

Dau hieu response:

- Upload file qua lon (tren 10MB) o cac endpoint upload anh.

Cach xu ly nhanh:

- Nen/compress anh nho hon 10MB.
- Kiem tra dung field file:
  - game-categories: iconFile
  - game-accounts: imageFiles
  - media/upload: file

### 13.7 Loi business trong wallet/transaction

Vi du response:

```json
{
  "statusCode": 400,
  "message": "Insufficient balance",
  "error": "Bad Request"
}
```

Hoac:

```json
{
  "statusCode": 400,
  "message": "Cannot transfer to the same user",
  "error": "Bad Request"
}
```

Cach xu ly nhanh:

- Goi GET /wallets/me/balance truoc khi withdraw/transfer.
- Dam bao toUserId khac user dang dang nhap.
- Neu method = TRANSFER trong /transactions, bat buoc co recipientUserId.

### 13.8 Checklist debug 30 giay trong Postman

1. URL da dung chua (khong them /api o route business)?
2. HTTP method da dung chua?
3. Header Content-Type va Authorization da dung chua?
4. Body mode da dung chua (raw JSON hay form-data)?
5. Bien {{...}} trong collection da co gia tri chua?
6. Token co bi het han/khong hop le khong?
7. Co vi pham rule business (so du, role admin, transfer cung user) khong?

Neu can, chay lai theo thu tu: register/login -> luu token -> tao du lieu nen (category/account/user) -> goi endpoint can test.

## 14. Account Trades (module moi)

Tat ca endpoint can JWT.

Header:

- Authorization: Bearer {{authToken}}

### 14.0 GET /account-trades/me/purchases?page=1&limit=20

Lay lich su account da mua cua user hien tai.

Response 200:

```json
{
  "data": [
    {
      "id": "ORD001",
      "userId": "USR001",
      "gameAccountId": "GA001",
      "price": 120000,
      "status": "PAID",
      "createdAt": "2026-03-19T11:00:00.000Z",
      "updatedAt": "2026-03-19T11:00:00.000Z",
      "gameAccount": {
        "id": "GA001",
        "categoryId": "CAT001",
        "username": "acc_login",
        "email": "acc@mail.com",
        "password": "acc_password",
        "price": 120000,
        "status": "SOLD",
        "level": 20,
        "rank": "Gold",
        "images": ["https://res.cloudinary.com/demo/image/upload/v1/ga1.png"],
        "description": "Postman created account"
      },
      "transactions": [
        {
          "id": "TXN001",
          "userId": "USR001",
          "orderId": "ORD001",
          "method": "PAYMENT",
          "price": 120000,
          "status": "SUCCESS"
        }
      ]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "totalPages": 1
  }
}
```

### 14.1 POST /account-trades/buy/{{gameAccountId}}

Request body (co the de `{}` neu khong can check gia):

```json
{
  "expectedPrice": 120000
}
```

Response 201:

```json
{
  "message": "Buy account success",
  "buyer": {
    "userId": "USR001",
    "balanceBefore": 500000,
    "balanceAfter": 380000,
    "balanceUpdatedAt": "2026-03-19T11:00:00.000Z"
  },
  "order": {
    "id": "ORD001",
    "userId": "USR001",
    "gameAccountId": "GA001",
    "price": 120000,
    "status": "PAID",
    "createdAt": "2026-03-19T11:00:00.000Z",
    "updatedAt": "2026-03-19T11:00:00.000Z"
  },
  "transaction": {
    "id": "TXN001",
    "userId": "USR001",
    "orderId": "ORD001",
    "recipientUserId": null,
    "method": "PAYMENT",
    "price": 120000,
    "status": "SUCCESS",
    "createdAt": "2026-03-19T11:00:00.000Z",
    "updatedAt": "2026-03-19T11:00:00.000Z"
  },
  "purchasedAccount": {
    "id": "GA001",
    "categoryId": "CAT001",
    "username": "acc_login",
    "email": "acc@mail.com",
    "password": "acc_password",
    "rank": "Gold",
    "level": 20,
    "images": ["https://res.cloudinary.com/demo/image/upload/v1/ga1.png"],
    "description": "Postman created account",
    "soldPrice": 120000,
    "status": "SOLD"
  }
}
```

Response loi 400 (vi du):

```json
{
  "statusCode": 400,
  "message": "Insufficient balance",
  "error": "Bad Request"
}
```

### 14.2 POST /account-trades/sell-requests/{{sellRequestId}}/approve

Chi danh cho ADMIN.

Request body: de trong (`{}`)

Response 200:

```json
{
  "id": "SR001",
  "userId": "USR002",
  "price": 300000,
  "status": "APPROVED",
  "description": "Account rank Diamond",
  "rejectReason": null,
  "accountUsername": "seller_game_acc",
  "accountPassword": "seller_pass_001",
  "createdAt": "2026-03-19T10:00:00.000Z",
  "updatedAt": "2026-03-19T11:10:00.000Z"
}
```

Response loi 403:

```json
{
  "statusCode": 403,
  "message": "Admin role required",
  "error": "Forbidden"
}
```

### 14.3 POST /account-trades/sell-requests/{{sellRequestId}}/reject

Chi danh cho ADMIN.

Request body:

```json
{
  "reason": "Thong tin account khong hop le"
}
```

Response 200:

```json
{
  "id": "SR001",
  "userId": "USR002",
  "price": 300000,
  "status": "REJECTED",
  "description": "Account rank Diamond",
  "rejectReason": "Thong tin account khong hop le",
  "accountUsername": "seller_game_acc",
  "accountPassword": "seller_pass_001",
  "createdAt": "2026-03-19T10:00:00.000Z",
  "updatedAt": "2026-03-19T11:15:00.000Z"
}
```

## 15. Website Settings (can JWT, ADMIN only)

Header:

- Authorization: Bearer {{authToken}}

### 15.1 GET /website-settings

Response 200:

```json
{
  "id": "default",
  "siteName": "GameAccount.vn",
  "siteDescription": "Mua ban tai khoan game uy tin #1 Viet Nam",
  "contactEmail": "support@gameaccount.vn",
  "contactPhone": "1900 xxxx",
  "commissionRate": 5,
  "minWithdraw": 100000,
  "withdrawFee": 5000,
  "viettelDiscount": 20,
  "vinaphoneDiscount": 20,
  "mobifoneDiscount": 20,
  "vietnamobileDiscount": 25,
  "emailNotifications": true,
  "smsNotifications": false,
  "orderNotifications": true,
  "depositNotifications": true,
  "requireEmailVerification": true,
  "requirePhoneVerification": false,
  "twoFactorAuth": false,
  "maintenanceMode": false,
  "maintenanceMessage": "He thong dang bao tri, vui long quay lai sau",
  "updatedBy": "admin_001",
  "createdAt": "2026-03-19T12:00:00.000Z",
  "updatedAt": "2026-03-19T12:00:00.000Z"
}
```

### 15.2 PATCH /website-settings

Request body:

```json
{
  "siteName": "ShopAccount Pro",
  "contactEmail": "admin@shopaccount.vn",
  "commissionRate": 7,
  "withdrawFee": 8000,
  "maintenanceMode": true,
  "maintenanceMessage": "He thong dang bao tri tu 23:00 den 01:00"
}
```

Response 200:

```json
{
  "id": "default",
  "siteName": "ShopAccount Pro",
  "siteDescription": "Mua ban tai khoan game uy tin #1 Viet Nam",
  "contactEmail": "admin@shopaccount.vn",
  "contactPhone": "1900 xxxx",
  "commissionRate": 7,
  "minWithdraw": 100000,
  "withdrawFee": 8000,
  "viettelDiscount": 20,
  "vinaphoneDiscount": 20,
  "mobifoneDiscount": 20,
  "vietnamobileDiscount": 25,
  "emailNotifications": true,
  "smsNotifications": false,
  "orderNotifications": true,
  "depositNotifications": true,
  "requireEmailVerification": true,
  "requirePhoneVerification": false,
  "twoFactorAuth": false,
  "maintenanceMode": true,
  "maintenanceMessage": "He thong dang bao tri tu 23:00 den 01:00",
  "updatedBy": "admin_001",
  "createdAt": "2026-03-19T12:00:00.000Z",
  "updatedAt": "2026-03-19T12:10:00.000Z"
}
```

Response loi 403:

```json
{
  "statusCode": 403,
  "message": "Admin role required",
  "error": "Forbidden"
}
```
