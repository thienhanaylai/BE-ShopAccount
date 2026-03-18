import {
  ForbiddenException,
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserRole, UserStatus } from '@prisma/client';
import { NextFunction, Request, Response } from 'express';
import { PrismaService } from '../prisma/prisma.service';

type JwtPayload = {
  sub: string;
  email: string;
  role: UserRole;
  ver?: number;
};

@Injectable()
export class AdminOnlyMiddleware implements NestMiddleware {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction): Promise<void> {
    const token = this.extractBearerToken(req);

    if (!token) {
      throw new UnauthorizedException('Missing bearer token');
    }

    let payload: JwtPayload;
    try {
      payload = this.jwtService.verify<JwtPayload>(token);
    } catch {
      throw new UnauthorizedException('Invalid token');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User no longer exists');
    }

    if (user.status === UserStatus.BLOCKED) {
      throw new ForbiddenException('Your account has been blocked');
    }

    if (user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Admin role required');
    }

    const latestPayload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      ver: Math.floor(user.updatedAt.getTime() / 1000),
    };

    const shouldRotateToken =
      payload.email !== latestPayload.email ||
      payload.role !== latestPayload.role ||
      payload.ver !== latestPayload.ver;

    if (shouldRotateToken) {
      res.setHeader('x-token-rotated', 'true');
      res.setHeader('x-access-token', this.jwtService.sign(latestPayload));
    }

    (req as Request & { user?: JwtPayload }).user = latestPayload;
    next();
  }

  private extractBearerToken(req: Request): string | null {
    const authorization = req.headers.authorization;
    if (!authorization) return null;

    const [type, token] = authorization.split(' ');
    if (type !== 'Bearer' || !token) return null;

    return token;
  }
}
