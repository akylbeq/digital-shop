import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from '../orders/order.entity';
import { Key } from '../keys/key.entity';
import { PaymentsController } from './payments.controller';
import { OrdersService } from './orders.service';
import { PallyService } from './pally/pally.service';

@Module({
  imports: [TypeOrmModule.forFeature([Order, Key])],
  controllers: [PaymentsController],
  providers: [OrdersService, PallyService],
})
export class PaymentsModule {}
