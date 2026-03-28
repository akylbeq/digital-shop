import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { ReferralTransaction } from './referral-transaction.entity';
import { User } from '../users/user.entity';
import { Order, OrderStatus } from '../orders/order.entity';
import { Product } from '../products/product.entity';

@Injectable()
export class ReferralsService {
  private readonly logger = new Logger(ReferralsService.name);

  constructor(
    private readonly config: ConfigService,
    private readonly dataSource: DataSource,
    @InjectRepository(ReferralTransaction)
    private readonly txRepo: Repository<ReferralTransaction>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
  ) {}

  /**
   * Начислить рефереру после подтверждённой оплаты заказа (один раз на orderId).
   */
  async tryCreditForPaidOrder(orderId: number): Promise<void> {
    const dup = await this.txRepo.findOne({ where: { orderId } });
    if (dup) return;

    const order = await this.orderRepo.findOne({ where: { id: orderId } });
    if (!order || order.status !== OrderStatus.PAID) return;

    const buyer = await this.userRepo.findOne({ where: { id: order.userId } });
    if (!buyer?.referredByUserId) return;
    if (buyer.referredByUserId === buyer.id) return;

    const referrer = await this.userRepo.findOne({
      where: { id: buyer.referredByUserId },
    });
    if (!referrer) return;

    const product = await this.productRepo.findOne({
      where: { id: order.itemId },
    });
    const defaultPct = Number(
      this.config.get<string>('REFERRAL_DEFAULT_PERCENT') ?? '10',
    );
    const pctRaw = product?.referralPercent;
    const pct =
      pctRaw !== null && pctRaw !== undefined ? Number(pctRaw) : defaultPct;
    if (!Number.isFinite(pct) || pct <= 0) return;

    const amount = Number(order.amount);
    const reward = Math.round(amount * (pct / 100) * 100) / 100;
    if (reward <= 0) return;

    const rewardStr = reward.toFixed(2);
    const pctStr = pct.toFixed(2);

    await this.dataSource.transaction(async (em) => {
      const tx = em.create(ReferralTransaction, {
        orderId,
        referrerUserId: referrer.id,
        referredUserId: buyer.id,
        rewardAmount: rewardStr,
        percentApplied: pctStr,
      });
      await em.save(tx);

      const refFresh = await em.findOne(User, { where: { id: referrer.id } });
      if (!refFresh) return;
      const bal = Number(refFresh.referralBalance ?? 0);
      const tot = Number(refFresh.totalReferralEarned ?? 0);
      refFresh.referralBalance = (bal + reward).toFixed(2);
      refFresh.totalReferralEarned = (tot + reward).toFixed(2);
      await em.save(refFresh);
    });

    this.logger.log(
      `Реферальное начисление: заказ ${orderId}, реферер ${referrer.id}, ${rewardStr} ₽`,
    );
  }

  async getStatsForUser(userId: number): Promise<{
    invitedUsersCount: number;
    successfulReferralsCount: number;
    totalReferralEarned: string;
    referralBalance: string;
  }> {
    const invitedUsersCount = await this.userRepo.count({
      where: { referredByUserId: userId },
    });
    const successfulReferralsCount = await this.txRepo.count({
      where: { referrerUserId: userId },
    });
    const user = await this.userRepo.findOne({ where: { id: userId } });
    return {
      invitedUsersCount,
      successfulReferralsCount,
      totalReferralEarned: user?.totalReferralEarned ?? '0',
      referralBalance: user?.referralBalance ?? '0',
    };
  }
}
