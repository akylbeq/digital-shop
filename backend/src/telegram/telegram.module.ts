import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TelegramBotService } from './telegram-bot.service';
import { UsersModule } from '../users/users.module';
import { CategoriesModule } from '../categories/categories.module';
import { ProductsModule } from '../products/products.module';
import { KeysModule } from '../keys/keys.module';
import { OrdersModule } from '../orders/orders.module';

@Module({
  imports: [
    ConfigModule,
    forwardRef(() => OrdersModule),
    UsersModule,
    CategoriesModule,
    ProductsModule,
    KeysModule,
  ],
  providers: [TelegramBotService],
  exports: [TelegramBotService],
})
export class TelegramModule {}
