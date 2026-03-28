import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

/** Одно начисление рефереру за оплаченный заказ приглашённого */
@Entity('referral_transactions')
export class ReferralTransaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', unique: true })
  orderId: number;

  @Column()
  referrerUserId: number;

  @Column()
  referredUserId: number;

  @Column('decimal', { precision: 12, scale: 2 })
  rewardAmount: string;

  @Column('decimal', { precision: 6, scale: 2 })
  percentApplied: string;

  @CreateDateColumn()
  createdAt: Date;
}
