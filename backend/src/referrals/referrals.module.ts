import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReferralTransaction } from './referral-transaction.entity';
import { ReferralsService } from './referrals.service';
import { User } from '../users/user.entity';
import { Order } from '../orders/order.entity';
import { Product } from '../products/product.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ReferralTransaction, User, Order, Product]),
  ],
  providers: [ReferralsService],
  exports: [ReferralsService],
})
export class ReferralsModule {}
