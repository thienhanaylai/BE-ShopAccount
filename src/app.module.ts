import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { GameAccountsModule } from './modules/game_accounts/game_accounts.module';
import { GameCategoriesModule } from './modules/game_categories/game_categories.module';
import { OrdersModule } from './modules/orders/orders.module';
import { SellRequestsModule } from './modules/sell_requests/sell_requests.module';
import { SupportTicketsModule } from './modules/support_tickets/support_tickets.module';
import { TransactionsModule } from './modules/transactions/transactions.module';
import { UsersModule } from './modules/users/users.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    GameAccountsModule,
    GameCategoriesModule,
    OrdersModule,
    TransactionsModule,
    SellRequestsModule,
    SupportTicketsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
