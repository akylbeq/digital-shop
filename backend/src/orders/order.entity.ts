import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Product } from '../products/product.entity';

export enum OrderStatus {
  /** Создан, ожидает оплаты через Pally */
  PENDING = 'PENDING',
  /** Ручная оплата: ждём скриншот */
  WAITING_PAYMENT = 'WAITING_PAYMENT',
  /** Скрин получен, ждём решения админа */
  PENDING_REVIEW = 'PENDING_REVIEW',
  /** Оплата подтверждена (Pally или админ) */
  PAID = 'PAID',
  /** Админ отклонил ручную оплату */
  REJECTED = 'REJECTED',
  /** Платёж не прошёл (Pally) */
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED',
}

export enum OrderPaymentSource {
  PALLY = 'pally',
  MANUAL_CARD = 'manual_card',
}

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  /** Публичный номер заказа (у старых строк может временно отсутствовать до backfill) */
  @Column({ type: 'varchar', length: 36, unique: true, nullable: true })
  publicId: string | null;

  @Column()
  userId: number;

  /**
   * Без FK в БД: synchronize не сможет навесить constraint, если в orders есть
   * «осиротевшие» userId/itemId (старые данные). Связь нужна для join в запросах.
   */
  @ManyToOne(() => User, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'userId' })
  user: User;

  /** product id */
  @Column()
  itemId: number;

  @ManyToOne(() => Product, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'itemId' })
  product: Product;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  /** Индекс в product.prices[], если заказ с сайта/бота с выбором периода */
  @Column({ type: 'int', nullable: true })
  selectedPriceIndex: number | null;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  status: OrderStatus;

  @Column({
    type: 'enum',
    enum: OrderPaymentSource,
    nullable: true,
  })
  paymentSource: OrderPaymentSource | null;

  @Column({ type: 'varchar', nullable: true })
  pallyBillId: string | null;

  @Column({ type: 'varchar', length: 512, nullable: true })
  paymentProofTelegramFileId: string | null;

  @Column({ type: 'varchar', nullable: true })
  paymentProofPath: string | null;

  @Column({ type: 'text', nullable: true })
  adminReviewComment: string | null;

  @Column({ type: 'varchar', nullable: true })
  deliveredKey: string | null;

  @Column({ default: false })
  isDelivered: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
