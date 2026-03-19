import { Module } from '@nestjs/common';
import { AccountTradesController } from './account_trades.controller';
import { AccountTradesService } from './account_trades.service';

@Module({
  controllers: [AccountTradesController],
  providers: [AccountTradesService],
  exports: [AccountTradesService],
})
export class AccountTradesModule {}
