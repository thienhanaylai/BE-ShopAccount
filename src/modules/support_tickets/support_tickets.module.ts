import { Module } from '@nestjs/common';
import { SupportTicketsController } from './support_tickets.controller';
import { SupportTicketsService } from './support_tickets.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { PrismaModule } from 'src/prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

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
  controllers: [SupportTicketsController],
  providers: [SupportTicketsService, JwtAuthGuard],
  exports: [SupportTicketsService],
})
export class SupportTicketsModule {}
