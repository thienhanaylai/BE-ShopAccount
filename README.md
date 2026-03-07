# BE-ShopAccount

Backend API cho hệ thống **ShopAccount** — xây dựng trên [NestJS](https://nestjs.com/), TypeScript, MongoDB (Mongoose) và Prisma (PostgreSQL).

---

## Mục lục

1. [Tech Stack](#1-tech-stack)
2. [Cài đặt & Khởi chạy](#2-cài-đặt--khởi-chạy)
3. [Cấu trúc thư mục](#3-cấu-trúc-thư-mục)
4. [Quy tắc đặt tên (Naming Conventions)](#4-quy-tắc-đặt-tên-naming-conventions)
5. [Quy tắc viết code (Code Style)](#5-quy-tắc-viết-code-code-style)
6. [Quy tắc Module & Architecture](#6-quy-tắc-module--architecture)
7. [DTO & Validation](#7-dto--validation)
8. [Schema / Entity](#8-schema--entity)
9. [Xử lý lỗi (Error Handling)](#9-xử-lý-lỗi-error-handling)
10. [Biến môi trường (Environment Variables)](#10-biến-môi-trường-environment-variables)
11. [Git Workflow](#11-git-workflow)
12. [Testing](#12-testing)
13. [Checklist trước khi tạo Pull Request](#13-checklist-trước-khi-tạo-pull-request)

---

## 1. Tech Stack

| Thành phần     | Công nghệ                           |
| -------------- | ----------------------------------- |
| Runtime        | Node.js 22.x                        |
| Framework      | NestJS 11                           |
| Ngôn ngữ       | TypeScript 5                        |
| Database chính | MongoDB (Mongoose)                  |
| Database phụ   | PostgreSQL (Prisma)                 |
| Validation     | class-validator + class-transformer |
| Linting        | ESLint + typescript-eslint          |
| Formatting     | Prettier                            |
| Testing        | Jest + Supertest                    |
| Deploy         | Heroku (Procfile)                   |

---

## 2. Cài đặt & Khởi chạy

```bash
# Cài dependencies
npm install

# Chạy development (hot-reload)
npm run start:dev

# Chạy production
npm run start:prod

# Build
npm run build
```

### Biến môi trường

Tạo file `.env` tại root dựa theo `.env.example` (xem [mục 10](#10-biến-môi-trường-environment-variables)).

### Database

```bash
# Generate Prisma client
npx prisma generate

# Seed dữ liệu mẫu
npx ts-node src/database/seed.ts
```

---

## 3. Cấu trúc thư mục

```
src/
├── app.module.ts          # Root module
├── app.controller.ts      # Root controller (health check)
├── app.service.ts         # Root service
├── main.ts                # Bootstrap
├── database/
│   └── seed.ts            # Script seed dữ liệu
├── Middlewares/           # Global middlewares
└── modules/               # Feature modules
    └── <feature>/
        ├── <feature>.module.ts
        ├── <feature>.controller.ts
        ├── <feature>.service.ts
        ├── dto/
        │   ├── create-<feature>.dto.ts
        │   └── update-<feature>.dto.ts
        └── schemas/           # Mongoose schema
            └── <feature>.schema.ts
prisma/
└── schema.prisma          # Prisma schema (PostgreSQL)
test/
└── app.e2e-spec.ts        # E2E tests
```

> **Quy tắc:** Mỗi tính năng mới (`products`, `orders`, `auth`, ...) phải tạo một thư mục riêng trong `src/modules/` với đầy đủ module, controller, service, dto, schema.

---

## 4. Quy tắc đặt tên (Naming Conventions)

### File & Thư mục

| Loại           | Quy tắc                | Ví dụ                   |
| -------------- | ---------------------- | ----------------------- |
| Thư mục module | `kebab-case`           | `product-categories/`   |
| File           | `kebab-case` + suffix  | `product.service.ts`    |
| DTO file       | `create-<name>.dto.ts` | `create-product.dto.ts` |
| Schema file    | `<name>.schema.ts`     | `product.schema.ts`     |
| Test file      | `<name>.spec.ts`       | `users.service.spec.ts` |

### Code

| Loại                | Quy tắc                                | Ví dụ                            |
| ------------------- | -------------------------------------- | -------------------------------- |
| Class               | `PascalCase`                           | `UsersService`, `CreateUserDto`  |
| Interface           | `PascalCase`                           | `UserPayload`                    |
| Variable / Function | `camelCase`                            | `findAll()`, `userId`            |
| Constant            | `UPPER_SNAKE_CASE`                     | `MAX_RETRY_COUNT`                |
| Enum                | `PascalCase` (key: `UPPER_SNAKE_CASE`) | `UserRole.ADMIN`                 |
| Decorator           | Đúng theo NestJS                       | `@Controller()`, `@Injectable()` |

### API Endpoints

- Dùng **danh từ số nhiều**, **kebab-case**, **không động từ**:

```
GET    /users            # Lấy danh sách
GET    /users/:id        # Lấy 1 item
POST   /users            # Tạo mới
PATCH  /users/:id        # Cập nhật một phần
DELETE /users/:id        # Xoá

# Nested resource
GET    /orders/:id/items
```

---

## 5. Quy tắc viết code (Code Style)

### Formatting

- **Prettier** là tiêu chuẩn duy nhất. **Không** chỉnh tay indent, dấu ngoặc, dấu phẩy cuối.
- Trước khi commit, chạy:

```bash
npm run format   # prettier --write
npm run lint     # eslint --fix
```

- Cấu hình Prettier mặc định của dự án (trong `package.json` / `.prettierrc`):
  - `singleQuote: true`
  - `trailingComma: 'all'`
  - `printWidth: 100`

### TypeScript

- **Bắt buộc** khai báo kiểu tường minh cho tham số hàm và giá trị trả về (không dùng `any` nếu không có lý do).
- Ưu tiên `interface` cho object shape, `type` cho union/intersection.
- Không dùng `as any` để "tắt" lỗi TypeScript — hãy xử lý đúng kiểu.

```typescript
// ✅ Đúng
async findOne(id: string): Promise<User> { ... }

// ❌ Sai
async findOne(id) { ... }
```

### Imports

- Sắp xếp theo thứ tự: **NestJS core → thư viện ngoài → internal modules → cùng module → types**.
- Dùng **absolute path** nếu import quá sâu, tránh `../../..`.

```typescript
// ✅ Thứ tự import
import { Injectable } from '@nestjs/common'; // NestJS
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose'; // Thư viện ngoài
import { CreateUserDto } from './dto/create-user.dto'; // Internal
import { User, UserDocument } from './schemas/user.schema';
```

### Async / Await

- **Luôn** dùng `async/await`, không dùng `.then().catch()` callback chain.
- Mỗi `await` trong service phải được bọc trong try/catch hoặc throw exception NestJS.

---

## 6. Quy tắc Module & Architecture

### Nguyên tắc

- **Controller**: Chỉ nhận request, gọi service, trả response. **Không** chứa business logic.
- **Service**: Chứa toàn bộ business logic. **Không** import trực tiếp HTTP objects.
- **Module**: Khai báo đầy đủ `imports`, `controllers`, `providers`, `exports`.

```typescript
// ✅ Controller đúng chuẩn
@Post()
@HttpCode(HttpStatus.CREATED)
create(@Body() dto: CreateUserDto) {
  return this.usersService.create(dto);
}

// ❌ Sai — business logic trong controller
@Post()
create(@Body() dto: CreateUserDto) {
  if (!dto.email.includes('@')) throw new BadRequestException('...');
  // ... logic xử lý
}
```

### Dependency Injection

- **Không** dùng `new Service()` thủ công — luôn để NestJS inject qua constructor.
- Các dependency inject phải khai báo `private readonly`.

```typescript
constructor(private readonly usersService: UsersService) {}
```

### Middleware

- Đặt toàn bộ middleware trong `src/Middlewares/`.
- Đăng ký trong module liên quan, không đăng ký global trừ khi thực sự cần.

---

## 7. DTO & Validation

- **Bắt buộc** dùng DTO cho mọi request body (`@Body()`).
- Mọi field phải có decorator từ `class-validator`.
- `UpdateDto` phải kế thừa từ `PartialType(CreateDto)`:

```typescript
// update-user.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {}
```

- Ví dụ DTO đầy đủ:

```typescript
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;
}
```

- **Không** expose password hoặc dữ liệu nhạy cảm trong response — dùng `@Exclude()` từ `class-transformer`.

---

## 8. Schema / Entity

### Mongoose Schema

- Luôn bật `{ timestamps: true }` để tự động có `createdAt` / `updatedAt`.
- Các field bắt buộc phải có `required: true`.
- Export cả `Document type` và `SchemaFactory`:

```typescript
@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, min: 0 })
  price: number;
}

export type ProductDocument = HydratedDocument<Product>;
export const ProductSchema = SchemaFactory.createForClass(Product);
```

### Prisma Schema

- Mỗi model phải có `id`, `createdAt`, `updatedAt`.
- Chạy `npx prisma format` trước khi commit file `schema.prisma`.

---

## 9. Xử lý lỗi (Error Handling)

- **Chỉ** dùng các exception có sẵn của NestJS — **không** throw `new Error()` thô:

| Tình huống           | Exception                      |
| -------------------- | ------------------------------ |
| Không tìm thấy       | `NotFoundException`            |
| Dữ liệu không hợp lệ | `BadRequestException`          |
| Chưa đăng nhập       | `UnauthorizedException`        |
| Không có quyền       | `ForbiddenException`           |
| Trùng lặp dữ liệu    | `ConflictException`            |
| Lỗi server           | `InternalServerErrorException` |

```typescript
// ✅ Đúng
const user = await this.userModel.findById(id);
if (!user) throw new NotFoundException(`User #${id} not found`);

// ❌ Sai
if (!user) throw new Error('not found');
```

- Message lỗi phải **rõ ràng**, **tiếng Anh**, đủ thông tin để debug.

---

## 10. Biến môi trường (Environment Variables)

- **Không bao giờ** hardcode URL, secret, password trong code.
- Tạo file `.env.example` liệt kê đầy đủ các biến (không có giá trị thật):

```env
PORT=3000
MONGODB_URI=mongodb+srv://<user>:<password>@cluster/dbname
DATABASE_URL=postgresql://<user>:<password>@host:5432/dbname
JWT_SECRET=your_jwt_secret_here
```

- Truy cập qua `process.env.VAR_NAME` hoặc `@nestjs/config`:

```typescript
// Khuyến nghị dùng ConfigService
constructor(private readonly configService: ConfigService) {}
const secret = this.configService.get<string>('JWT_SECRET');
```

- File `.env` **phải** có trong `.gitignore`.

---

## 11. Git Workflow

### Branching

```
main          → Production (protected, không commit trực tiếp)
develop       → Integration branch
feature/<tên> → Tính năng mới
fix/<tên>     → Bug fix
hotfix/<tên>  → Fix khẩn cấp trên production
refactor/<tên>→ Refactor code
```

Ví dụ: `feature/add-product-module`, `fix/user-not-found-error`

### Commit Message

Theo chuẩn **Conventional Commits**:

```
<type>(<scope>): <mô tả ngắn>
```

| Type       | Ý nghĩa                                |
| ---------- | -------------------------------------- |
| `feat`     | Thêm tính năng mới                     |
| `fix`      | Sửa bug                                |
| `refactor` | Refactor, không thêm feature / fix bug |
| `docs`     | Cập nhật tài liệu                      |
| `test`     | Thêm / sửa test                        |
| `chore`    | Cập nhật config, dependency            |
| `style`    | Format code (không thay đổi logic)     |

```bash
# ✅ Đúng
git commit -m "feat(users): add findByEmail method"
git commit -m "fix(auth): handle expired JWT token"
git commit -m "docs: update README with env variables"

# ❌ Sai
git commit -m "fix bug"
git commit -m "update"
git commit -m "WIP"
```

### Pull Request

- Mỗi PR chỉ giải quyết **một** vấn đề / tính năng.
- Tiêu đề PR theo chuẩn commit: `feat(products): implement CRUD endpoints`.
- Phải có **ít nhất 1 reviewer** trước khi merge.
- **Không** merge nếu CI/lint/test thất bại.

### Các bước tạo Pull Request

**Bước 1 — Chuẩn bị branch**

```bash
# Đảm bảo branch local đã cập nhật từ develop mới nhất
git checkout develop
git pull origin develop

# Tạo branch mới từ develop
git checkout -b feature/<tên-tính-năng>
```

**Bước 2 — Làm việc & commit**

```bash
# Sau khi code xong, kiểm tra lint/format/test
npm run lint
npm run format
npm run test

# Stage và commit theo Conventional Commits
git add .
git commit -m "feat(<scope>): mô tả ngắn gọn"
```

**Bước 3 — Rebase / Merge develop mới nhất trước khi push**

```bash
# Luôn rebase hoặc merge develop mới nhất để tránh conflict khi review
git fetch origin
git rebase origin/develop
# Giải quyết conflict (nếu có), sau đó:
git rebase --continue
```

**Bước 4 — Push branch lên remote**

```bash
git push origin feature/<tên-tính-năng>
```

**Bước 5 — Tạo PR trên GitHub**

1. Vào repository trên GitHub → click **"Compare & pull request"**.
2. Điền đầy đủ thông tin theo template dưới đây.
3. Gán **Assignees** (chính mình) và **Reviewers** (ít nhất 1 thành viên khác).
4. Gán **Label** phù hợp (`feature`, `bug`, `refactor`, ...).
5. Link PR với Issue liên quan nếu có (dùng `Closes #<issue_number>`).

**Template mô tả PR:**

```markdown
## Mô tả

<!-- Tóm tắt ngắn gọn thay đổi này làm gì và tại sao -->

## Loại thay đổi

- [ ] feat — Tính năng mới
- [ ] fix — Sửa bug
- [ ] refactor — Tái cấu trúc code
- [ ] docs — Cập nhật tài liệu
- [ ] chore — Config / dependency

## Thay đổi chính

-
-

## Cách test thủ công

1.
2.

## Closes

Closes #<issue_number> <!-- Xoá dòng này nếu không có issue -->
```

**Bước 6 — Sau khi được approve**

```bash
# Merge vào develop bằng "Squash and merge" hoặc "Merge commit" theo quy ước team
# Sau khi merge, xoá branch trên remote và local
git checkout develop
git pull origin develop
git branch -d feature/<tên-tính-năng>
```

> **Lưu ý:**
>
> - Không tự merge PR của chính mình khi chưa có approval.
> - Không resolve conflict bằng cách force push lên `develop` hoặc `main`.
> - Nếu PR bị request changes, sửa rồi push thêm commit — **không** tạo PR mới.

---

## 12. Testing

### Chạy tests

```bash
# Unit tests
npm run test

# Unit tests (watch mode)
npm run test:watch

# Coverage report
npm run test:cov

# E2E tests
npm run test:e2e
```

### Quy tắc

- Mỗi service **phải** có file `.spec.ts` tương ứng.
- Đặt file test cạnh file nguồn (`users.service.spec.ts` trong cùng thư mục với `users.service.ts`).
- Test phải cover ít nhất các case: **happy path**, **not found**, **validation error**.
- Dùng `jest.mock()` / `@nestjs/testing` để mock dependency — **không** gọi thật DB trong unit test.

```typescript
// Cấu trúc unit test chuẩn
describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getModelToken(User.name), useValue: mockUserModel },
      ],
    }).compile();
    service = module.get<UsersService>(UsersService);
  });

  it('should return a user by id', async () => { ... });
  it('should throw NotFoundException when user not found', async () => { ... });
});
```

---

## 13. Checklist trước khi tạo Pull Request

Trước khi tạo PR, tự kiểm tra **tất cả** các mục sau:

- [ ] `npm run lint` không có lỗi
- [ ] `npm run format` đã được chạy
- [ ] `npm run test` tất cả pass
- [ ] `npm run build` thành công
- [ ] Không có `console.log()` debug còn sót lại trong code
- [ ] Không hardcode URL, secret, password
- [ ] Không có file `.env` được commit
- [ ] DTO có đầy đủ decorator validation
- [ ] Mọi endpoint mới có xử lý lỗi đúng chuẩn NestJS
- [ ] Commit message theo Conventional Commits
- [ ] Đã tự review lại diff trước khi push

---

> **Mọi thắc mắc hoặc đề xuất cải tiến quy tắc**, hãy tạo issue hoặc thảo luận trong team channel trước khi tự ý thay đổi.
