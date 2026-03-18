import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AdminOnlyMiddleware } from '../../Middlewares/admin-only.middleware';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PrismaModule } from '../../prisma/prisma.module';
import { WalletsController } from './wallets.controller';
import { WalletsService } from './wallets.service';

@Module({
  imports: [
    PrismaModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET', 'dev-secret-key'),
      }),
    }),
  ],
  controllers: [WalletsController],
  providers: [WalletsService, JwtAuthGuard, AdminOnlyMiddleware],
  exports: [WalletsService],
})
export class WalletsModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(AdminOnlyMiddleware).forRoutes({
      path: 'wallets/admin/adjust',
      method: RequestMethod.POST,
    });
  }
}
