# BE-ShopAccount

Backend API cho he thong ShopAccount, xay dung voi NestJS + Prisma + PostgreSQL.

## 1. Tech Stack

- Runtime: Node.js 22.x
- Framework: NestJS 11
- Language: TypeScript 5
- Database: PostgreSQL + Prisma ORM
- Validation: class-validator + class-transformer
- Auth-related hashing: bcrypt
- Test: Jest + Supertest

## 2. Clone Va Chay Nhanh (Quick Start)

```bash
git clone <repo-url>
cd BE-ShopAccount
npm install
```

Tao file moi truong:

```bash
cp .env.example .env
```

Neu dung PowerShell tren Windows:

```powershell
Copy-Item .env.example .env
```

Cap nhat gia tri trong .env cho dung may local, sau do chay:

```bash
npm run prisma:generate
npm run prisma:migrate
npm run db:seed
npm run start:dev
```

API mac dinh chay o:

- http://localhost:3000

## 3. Cau Hinh PostgreSQL Local

Co 2 cach pho bien:

### Cach A: Da co PostgreSQL san tren may

1. Dam bao PostgreSQL dang chay.
2. Tao database moi, vi du `shopaccount_dev`.
3. Tao user/password hoac dung user san co.
4. Dien lai bien `DATABASE_URL` trong file .env.

Vi du `DATABASE_URL`:

```env
DATABASE_URL=postgresql://postgres:123456@localhost:5432/shopaccount_dev?schema=public
```

### Cach B: Dung Docker (khuyen nghi cho team)

```bash
docker run --name shopaccount-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=123456 \
  -e POSTGRES_DB=shopaccount_dev \
  -p 5432:5432 \
  -d postgres:16
```

Khi do `DATABASE_URL` co the dat:

```env
DATABASE_URL=postgresql://postgres:123456@localhost:5432/shopaccount_dev?schema=public
```

## 4. Bien Moi Truong (.env)

Su dung file mau [.env.example](.env.example) va tao file `.env` tai root.

Cac bien toi thieu:

```env
PORT=3000
DATABASE_URL=postgresql://postgres:123456@localhost:5432/shopaccount_dev?schema=public
JWT_SECRET=replace_with_strong_secret
JWT_EXPIRES_IN=1d
```

Luu y:

- Khong commit file `.env`.
- Moi truong local moi nguoi co the khac user/password DB.
- `JWT_SECRET` phai du manh va khong dung secret demo tren production.

## 5. Prisma Workflow

Sau khi clone repo hoac sau khi pull thay doi lien quan schema, thuc hien:

```bash
npm run prisma:generate
npm run prisma:migrate
```

Giai thich nhanh:

- `prisma:generate`: generate Prisma Client theo schema hien tai.
- `prisma:migrate`: tao/ap dung migration tren DB local.
- `prisma:deploy`: dung cho moi truong deploy.

Neu can seed du lieu mau:

```bash
npm run db:seed
```

## 6. Dung Seed Data

Script seed o [src/database/seed.ts](src/database/seed.ts).

Seed hien tai:

- Su dung bcrypt de hash mat khau.
- Tao user admin/customer mau.
- Tao game categories, game accounts, orders, transactions, sell requests, support tickets.

Tai khoan mau:

- admin@shopaccount.local / Admin@123
- customer01@shopaccount.local / Customer@123
- customer02@shopaccount.local / Customer@123

## 7. Bao Mat Va Quy Uoc Role

Theo thay doi hien tai:

- Password user duoc hash bang bcrypt.
- API tao user/registration khong cho client tu truyen role de tu nang quyen admin.
- Role mac dinh khi tao moi user la `CUSTOMER` (tru khi tao bang luong admin/noi bo).

## 8. Scripts Hay Dung

```bash
npm run start:dev      # Chay local co watch
npm run build          # Build TypeScript
npm run lint           # Lint va fix
npm run format         # Prettier format
npm run test           # Unit test
npm run test:e2e       # E2E test
npm run test:schema    # Schema smoke test
```

## 9. Quy Trinh Cho Team Member Moi

1. Clone repo va `npm install`.
2. Tao `.env` tu `.env.example`.
3. Dam bao PostgreSQL local da san sang.
4. Chay `npm run prisma:generate`.
5. Chay `npm run prisma:migrate`.
6. Chay `npm run db:seed` (neu can du lieu mau).
7. Chay `npm run start:dev`.
8. Kiem tra API qua Postman collection trong [postman/BE-ShopAccount.postman_collection.json](postman/BE-ShopAccount.postman_collection.json).

## 10. Troubleshooting Nhanh

### Loi ket noi DB

- Kiem tra `DATABASE_URL` dung host/port/user/password.
- Kiem tra PostgreSQL service hoac container co dang chay khong.

### Loi Prisma Client

Chay lai:

```bash
npm run prisma:generate
npm run build
```

### Loi migration khi DB da co du lieu cu

- Tao DB local moi de onboard nhanh hon, roi chay lai migrate + seed.

## 11. Checklist Truoc Khi Push

- `npm run build` pass
- `npm run lint` pass
- Migration/schema dong bo
- Khong commit `.env`
- Neu thay doi schema, cap nhat migration va huong dan trong README neu can
