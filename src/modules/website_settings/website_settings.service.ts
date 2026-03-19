import { Injectable } from '@nestjs/common';
import { WebsiteSetting } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateWebsiteSettingsDto } from './dto/update-website-settings.dto';

const WEBSITE_SETTINGS_ID = 'default';

@Injectable()
export class WebsiteSettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async getSettings(): Promise<WebsiteSetting> {
    await this.ensureDefaultSettings();

    return this.prisma.websiteSetting.findUniqueOrThrow({
      where: { id: WEBSITE_SETTINGS_ID },
    });
  }

  async updateSettings(
    adminUserId: string,
    dto: UpdateWebsiteSettingsDto,
  ): Promise<WebsiteSetting> {
    await this.ensureDefaultSettings();

    return this.prisma.websiteSetting.update({
      where: { id: WEBSITE_SETTINGS_ID },
      data: {
        ...dto,
        updatedBy: adminUserId,
      },
    });
  }

  private async ensureDefaultSettings(): Promise<void> {
    const exists = await this.prisma.websiteSetting.findUnique({
      where: { id: WEBSITE_SETTINGS_ID },
      select: { id: true },
    });

    if (exists) return;

    await this.prisma.websiteSetting.create({
      data: {
        id: WEBSITE_SETTINGS_ID,
        siteName: 'GameAccount.vn',
        siteDescription: 'Mua ban tai khoan game uy tin #1 Viet Nam',
        contactEmail: 'support@gameaccount.vn',
        contactPhone: '1900 xxxx',
        commissionRate: 5,
        minWithdraw: 100000,
        withdrawFee: 5000,
        viettelDiscount: 20,
        vinaphoneDiscount: 20,
        mobifoneDiscount: 20,
        vietnamobileDiscount: 25,
        emailNotifications: true,
        smsNotifications: false,
        orderNotifications: true,
        depositNotifications: true,
        requireEmailVerification: true,
        requirePhoneVerification: false,
        twoFactorAuth: false,
        maintenanceMode: false,
        maintenanceMessage: 'He thong dang bao tri, vui long quay lai sau',
      },
    });
  }
}
