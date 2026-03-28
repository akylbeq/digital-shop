import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { Order } from './order.entity';
import { Key } from '../keys/key.entity';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { TelegramModule } from '../telegram/telegram.module';
import { OrdersPublicIdBackfillService } from './orders-public-id-backfill.service';
import { ReferralsModule } from '../referrals/referrals.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, Key]),
    AuthModule,
    ReferralsModule,
    forwardRef(() => TelegramModule),
  ],
  controllers: [OrdersController],
  providers: [OrdersService, OrdersPublicIdBackfillService],
  exports: [OrdersService],
})
export class OrdersModule {}
