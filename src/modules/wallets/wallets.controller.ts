import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtUserPayload } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AdminAdjustBalanceDto } from './dto/admin-adjust-balance.dto';
import { CreateTopUpDto } from './dto/create-top-up.dto';
import { CreateTransferDto } from './dto/create-transfer.dto';
import { CreateWithdrawDto } from './dto/create-withdraw.dto';
import { WalletHistoryQueryDto } from './dto/wallet-history-query.dto';
import type { WalletHistoryResponse } from './wallets.service';
import { WalletsService } from './wallets.service';

type WalletTopUpHistoryReader = {
  getAllTopUpHistory: (
    query: WalletHistoryQueryDto,
  ) => Promise<WalletHistoryResponse>;
};

@Controller('wallets')
@UseGuards(JwtAuthGuard)
export class WalletsController {
  constructor(private readonly service: WalletsService) {}

  @Post('top-up')
  @HttpCode(HttpStatus.CREATED)
  topUp(@CurrentUser('sub') userId: string, @Body() dto: CreateTopUpDto) {
    return this.service.topUp(userId, dto);
  }

  @Post('withdraw')
  @HttpCode(HttpStatus.CREATED)
  withdraw(@CurrentUser('sub') userId: string, @Body() dto: CreateWithdrawDto) {
    return this.service.withdraw(userId, dto);
  }

  @Post('transfer')
  @HttpCode(HttpStatus.CREATED)
  transfer(@CurrentUser('sub') userId: string, @Body() dto: CreateTransferDto) {
    return this.service.transfer(userId, dto);
  }

  @Get('me/balance')
  getBalance(@CurrentUser('sub') userId: string) {
    return this.service.getBalance(userId);
  }

  @Get('me/history')
  getHistory(
    @CurrentUser('sub') userId: string,
    @Query() query: WalletHistoryQueryDto,
  ) {
    return this.service.getHistory(userId, query);
  }

  @Get('admin/top-up-history')
  getAllTopUpHistory(
    @CurrentUser('role') role: UserRole,
    @Query() query: WalletHistoryQueryDto,
  ): Promise<WalletHistoryResponse> {
    this.ensureAdminRole(role);
    const walletService = this.service as WalletTopUpHistoryReader;
    return walletService.getAllTopUpHistory(query);
  }

  @Post('admin/adjust')
  @HttpCode(HttpStatus.CREATED)
  adminAdjust(
    @CurrentUser() user: JwtUserPayload,
    @Body() dto: AdminAdjustBalanceDto,
  ) {
    this.ensureAdminRole(user.role);

    return this.service.adminAdjustBalance(dto);
  }

  private ensureAdminRole(role: UserRole): void {
    if (role !== UserRole.ADMIN) {
      throw new ForbiddenException('Admin role required');
    }
  }
}
