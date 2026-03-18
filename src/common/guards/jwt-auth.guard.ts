import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserStatus } from '@prisma/client';
import { Request, Response } from 'express';
import { PrismaService } from '../../prisma/prisma.service';

type JwtPayload = {
  sub: string;
  email: string;
  role: string;
  ver?: number;
};

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const token = this.extractTokenFromHeader(request);

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
      response.setHeader('x-token-rotated', 'true');
      response.setHeader('x-access-token', this.jwtService.sign(latestPayload));
    }

    (request as Request & { user?: JwtPayload }).user = latestPayload;
    return true;
  }

  private extractTokenFromHeader(request: Request): string | null {
    const authorization = request.headers.authorization;
    if (!authorization) return null;

    const [type, token] = authorization.split(' ');
    if (type !== 'Bearer' || !token) return null;

    return token;
  }
}
