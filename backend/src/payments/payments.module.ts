import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { OrdersModule } from '../orders/orders.module';
import { UnopayController } from './unopay/unopay.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from '../orders/order.entity';
import { UnopayService } from './unopay/unopay.service';
import { AuthModule } from '../auth/auth.module';
import { Product } from '../products/product.entity';

@Module({
  imports: [
    OrdersModule,
    TypeOrmModule.forFeature([Order, Product]),
    AuthModule,
  ],
  controllers: [PaymentsController, UnopayController],
  providers: [UnopayService],
})
export class PaymentsModule {}
