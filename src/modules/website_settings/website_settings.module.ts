import { Module } from '@nestjs/common';
import { WebsiteSettingsController } from './website_settings.controller';
import { WebsiteSettingsService } from './website_settings.service';

@Module({
  controllers: [WebsiteSettingsController],
  providers: [WebsiteSettingsService],
  exports: [WebsiteSettingsService],
})
export class WebsiteSettingsModule {}
