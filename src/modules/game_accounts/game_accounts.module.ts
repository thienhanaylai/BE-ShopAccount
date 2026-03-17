import { Module } from '@nestjs/common';
import { GameAccountsController } from './game_accounts.controller';
import { GameAccountsService } from './game_accounts.service';

@Module({
  controllers: [GameAccountsController],
  providers: [GameAccountsService],
  exports: [GameAccountsService],
})
export class GameAccountsModule {}
