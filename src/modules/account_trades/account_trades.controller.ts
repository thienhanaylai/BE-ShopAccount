import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import {
  AccountTradesService,
  type PurchaseHistoryResult,
} from './account_trades.service';
import { BuyAccountDto } from './dto/buy-account.dto';

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
}
