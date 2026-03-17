import { Module } from '@nestjs/common';
import { SupportTicketsController } from './support_tickets.controller';
import { SupportTicketsService } from './support_tickets.service';

@Module({
  controllers: [SupportTicketsController],
  providers: [SupportTicketsService],
  exports: [SupportTicketsService],
})
export class SupportTicketsModule {}
