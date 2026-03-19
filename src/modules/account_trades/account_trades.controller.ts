import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { SellRequestStatus, UserRole } from '@prisma/client';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtUserPayload } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import {
  AccountTradesService,
  type PurchaseHistoryResult,
} from './account_trades.service';
import { BuyAccountDto } from './dto/buy-account.dto';
import { RejectSellRequestDto } from './dto/reject-sell-request.dto';

@Controller('account-trades')
@UseGuards(JwtAuthGuard)
export class AccountTradesController {
  constructor(private readonly service: AccountTradesService) {}

  @Get('me/purchases')
  getMyPurchasedAccounts(
    @CurrentUser('sub') userId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<PurchaseHistoryResult> {
    return this.service.getMyPurchasedAccounts(userId, { page, limit });
  }

  @Post('buy/:gameAccountId')
  @HttpCode(HttpStatus.CREATED)
  buyAccount(
    @CurrentUser('sub') buyerUserId: string,
    @Param('gameAccountId') gameAccountId: string,
    @Body() dto: BuyAccountDto,
  ) {
    return this.service.buyAccount({
      buyerUserId,
      gameAccountId,
      expectedPrice: dto.expectedPrice,
    });
  }

  @Post('sell-requests/:id/approve')
  @HttpCode(HttpStatus.OK)
  approveSellRequest(
    @CurrentUser() user: JwtUserPayload,
    @Param('id') id: string,
  ) {
    this.ensureAdminRole(user);
    return this.service.updateSellRequestStatus(id, SellRequestStatus.APPROVED);
  }

  @Post('sell-requests/:id/reject')
  @HttpCode(HttpStatus.OK)
  rejectSellRequest(
    @CurrentUser() user: JwtUserPayload,
    @Param('id') id: string,
    @Body() dto: RejectSellRequestDto,
  ) {
    this.ensureAdminRole(user);
    return this.service.updateSellRequestStatus(
      id,
      SellRequestStatus.REJECTED,
      dto.reason,
    );
  }

  private ensureAdminRole(user: JwtUserPayload): void {
    if (user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Admin role required');
    }
  }
}
