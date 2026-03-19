import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { UpdateWebsiteSettingsDto } from './dto/update-website-settings.dto';
import { WebsiteSettingsService } from './website_settings.service';

@Controller('website-settings')
@UseGuards(JwtAuthGuard)
export class WebsiteSettingsController {
  constructor(private readonly service: WebsiteSettingsService) {}

  @Get()
  getSettings(@CurrentUser('role') role: UserRole) {
    this.ensureAdminRole(role);
    return this.service.getSettings();
  }

  @Patch()
  updateSettings(
    @CurrentUser('sub') adminId: string,
    @CurrentUser('role') role: UserRole,
    @Body() dto: UpdateWebsiteSettingsDto,
  ) {
    this.ensureAdminRole(role);
    return this.service.updateSettings(adminId, dto);
  }

  private ensureAdminRole(role: UserRole): void {
    if (role !== UserRole.ADMIN) {
      throw new ForbiddenException('Admin role required');
    }
  }
}
