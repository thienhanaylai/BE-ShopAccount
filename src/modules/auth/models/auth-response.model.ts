import { UserRole, UserStatus } from '@prisma/client';

export class AuthUserModel {
  id: string;
  username: string;
  email: string;
  phone?: string | null;
  role: UserRole;
  status: UserStatus;
}

export class AuthResponseModel {
  accessToken: string;
  user: AuthUserModel;
}
