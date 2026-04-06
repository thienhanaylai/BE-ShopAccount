import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { JwtAuthModule } from './common/guards/jwt-auth.module';
import { AuthModule } from './modules/auth/auth.module';
import { GameAccountsModule } from './modules/game_accounts/game_accounts.module';
import { GameCategoriesModule } from './modules/game_categories/game_categories.module';
import { OrdersModule } from './modules/orders/orders.module';
import { SupportTicketsModule } from './modules/support_tickets/support_tickets.module';
import { TransactionsModule } from './modules/transactions/transactions.module';
import { UsersModule } from './modules/users/users.module';
import { WalletsModule } from './modules/wallets/wallets.module';
import { MediaModule } from 'src/modules/media/media.module';
import { AccountTradesModule } from './modules/account_trades/account_trades.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    JwtAuthModule,
    PrismaModule,
    AuthModule,
    UsersModule,
    GameAccountsModule,
    GameCategoriesModule,
    OrdersModule,
    MediaModule,
    TransactionsModule,
    WalletsModule,
    AccountTradesModule,
    SupportTicketsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
