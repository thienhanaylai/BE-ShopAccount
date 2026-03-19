import { Module } from '@nestjs/common';
import { GameAccountsController } from './game_accounts.controller';
import { GameAccountsService } from './game_accounts.service';
import { MediaModule } from '../media/media.module';

@Module({
  imports: [MediaModule],
  controllers: [GameAccountsController],
  providers: [GameAccountsService],
  exports: [GameAccountsService],
})
export class GameAccountsModule {}
