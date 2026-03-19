import { Module } from '@nestjs/common';
import { GameCategoriesController } from './game_categories.controller';
import { GameCategoriesService } from './game_categories.service';
import { MediaModule } from '../media/media.module';

@Module({
  imports: [MediaModule],
  controllers: [GameCategoriesController],
  providers: [GameCategoriesService],
  exports: [GameCategoriesService],
})
export class GameCategoriesModule {}
