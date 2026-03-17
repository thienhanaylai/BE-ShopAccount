import { Module } from '@nestjs/common';
import { GameCategoriesController } from './game_categories.controller';
import { GameCategoriesService } from './game_categories.service';

@Module({
  controllers: [GameCategoriesController],
  providers: [GameCategoriesService],
  exports: [GameCategoriesService],
})
export class GameCategoriesModule {}
