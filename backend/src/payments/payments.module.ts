import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { OrdersModule } from '../orders/orders.module';
import { PallyService } from './pally/pally.service';

@Module({
  imports: [OrdersModule],
  controllers: [PaymentsController],
  providers: [PallyService],
})
export class PaymentsModule {}
