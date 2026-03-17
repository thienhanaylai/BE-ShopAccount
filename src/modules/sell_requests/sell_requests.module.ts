import { Module } from '@nestjs/common';
import { SellRequestsController } from './sell_requests.controller';
import { SellRequestsService } from './sell_requests.service';

@Module({
  controllers: [SellRequestsController],
  providers: [SellRequestsService],
  exports: [SellRequestsService],
})
export class SellRequestsModule {}
