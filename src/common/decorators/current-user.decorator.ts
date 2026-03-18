import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserRole } from '@prisma/client';

export type JwtUserPayload = {
  sub: string;
  email: string;
  role: UserRole;
};

export const CurrentUser = createParamDecorator(
  (data: keyof JwtUserPayload | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<{ user?: JwtUserPayload }>();
    const user = request.user;
    return data ? user?.[data] : user;
  },
);
