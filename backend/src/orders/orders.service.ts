import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, LessThan, Repository } from 'typeorm';
import { randomUUID } from 'crypto';
import { Order, OrderPaymentSource, OrderStatus } from './order.entity';
import { Key, KeyStatus } from '../keys/key.entity';
import { User } from '../users/user.entity';
import { ReferralsService } from '../referrals/referrals.service';
import { Product } from 'src/products/product.entity';

export interface OrderListFilters {
  status?: OrderStatus;
  page: number;
  limit: number;
}

export interface UserPurchaseItem {
  amount: string;
  status: OrderStatus;
  paymentSource: OrderPaymentSource | null;
  deliveredKey: string | null;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  private stripUserSecrets(order: Order | null | undefined) {
    if (!order?.user) return;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _p, ...rest } = order.user as User & {
      password?: string | null;
    };
    order.user = rest as User;
  }

  constructor(
    @InjectRepository(Order)
    private readonly ordersRepository: Repository<Order>,
    @InjectRepository(Key)
    private readonly keysRepository: Repository<Key>,
    private readonly dataSource: DataSource,
    private readonly referralsService: ReferralsService,
  ) {}

  async createManualCardOrder(
    userId: number,
    itemId: number,
    amount: number,
    selectedPriceIndex: number | null,
  ) {
    return this.createOrderWithSource({
      userId,
      itemId,
      amount,
      selectedPriceIndex,
      paymentSource: OrderPaymentSource.MANUAL_CARD,
    });
  }

  async createUnopayOrder(
    userId: number,
    itemId: number,
    amount: number,
    selectedPriceIndex: number | null,
  ) {
    return this.createOrderWithSource({
      userId,
      itemId,
      amount,
      selectedPriceIndex,
      paymentSource: OrderPaymentSource.UNOPAY,
    });
  }

  private async createOrderWithSource(params: {
    userId: number;
    itemId: number;
    amount: number;
    selectedPriceIndex: number | null;
    paymentSource: OrderPaymentSource;
  }) {
    const order = this.ordersRepository.create({
      publicId: randomUUID(),
      userId: params.userId,
      itemId: params.itemId,
      amount: params.amount,
      status: OrderStatus.WAITING_PAYMENT,
      paymentSource: params.paymentSource,
      deliveredKey: null,
      isDelivered: false,
      selectedPriceIndex: params.selectedPriceIndex,
    });

    return this.ordersRepository.save(order);
  }

  async findById(orderId: number) {
    return this.ordersRepository.findOne({
      where: { id: orderId },
    });
  }

  async findByIdWithRelations(orderId: number) {
    const order = await this.ordersRepository.findOne({
      where: { id: orderId },
      relations: ['user', 'product'],
    });
    this.stripUserSecrets(order);
    return order;
  }

  async findOrdersForUser(userId: number, take = 20) {
    return this.ordersRepository.find({
      where: { userId, status: OrderStatus.PAID },
      order: { id: 'DESC' },
      take,
      relations: ['product'],
    });
  }

  async findPurchasesForUser(
    userId: number,
    take = 100,
  ): Promise<UserPurchaseItem[]> {
    const rows = await this.ordersRepository
      .createQueryBuilder('o')
      .leftJoin(Key, 'k', 'k.orderId = o.id')
      .where('o.userId = :userId', { userId })
      .andWhere('o.status = :status', { status: OrderStatus.PAID })
      .orderBy('o.id', 'DESC')
      .take(take)
      .select([
        'o.amount AS amount',
        'o.status AS status',
        'o.paymentSource AS "paymentSource"',
        'o.deliveredKey AS "deliveredKey"',
        'o.createdAt AS "createdAt"',
        'o.updatedAt AS "updatedAt"',
      ])
      .addSelect('k.key', 'soldKey')
      .getRawMany<{
        amount: string;
        status: OrderStatus;
        paymentSource: OrderPaymentSource | null;
        deliveredKey: string | null;
        soldKey: string | null;
        createdAt: Date;
        updatedAt: Date;
      }>();

    return rows.map((row) => ({
      amount: row.amount,
      status: row.status,
      paymentSource: row.paymentSource,
      deliveredKey: row.deliveredKey ?? row.soldKey ?? null,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    }));
  }

  async findLastWaitingPaymentForUser(userId: number) {
    return this.ordersRepository.findOne({
      where: { userId, status: OrderStatus.WAITING_PAYMENT },
      order: { id: 'DESC' },
    });
  }

  async listForAdmin(filters: OrderListFilters) {
    const { status, page, limit } = filters;
    const qb = this.ordersRepository
      .createQueryBuilder('o')
      .leftJoinAndSelect('o.user', 'user')
      .leftJoinAndSelect('o.product', 'product')
      .orderBy('o.id', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (status) {
      qb.andWhere('o.status = :status', { status });
    }

    const [data, total] = await qb.getManyAndCount();
    for (const o of data) {
      this.stripUserSecrets(o);
    }
    return { data, total, page, limit };
  }

  async markPaid(orderId: number) {
    const order = await this.findById(orderId);

    if (!order) {
      throw new NotFoundException('Заказ не найден');
    }

    if (order.status === OrderStatus.PAID) {
      return order;
    }

    order.status = OrderStatus.PAID;
    return this.ordersRepository.save(order);
  }

  async markFailed(orderId: number) {
    const order = await this.findById(orderId);

    if (!order) {
      throw new NotFoundException('Заказ не найден');
    }

    order.status = OrderStatus.FAILED;
    return this.ordersRepository.save(order);
  }

  async deliverDigitalItem(orderId: number) {
    await this.dataSource.transaction(async (em) => {
      const locked = await em
        .createQueryBuilder(Order, 'o')
        .setLock('pessimistic_write')
        .where('o.id = :id', { id: orderId })
        .getOne();

      if (!locked) {
        throw new NotFoundException('Заказ не найден');
      }

      if (locked.status !== OrderStatus.PAID) {
        throw new BadRequestException('Заказ не оплачен');
      }

      if (locked.isDelivered) {
        return;
      }

      const product = await em.findOne(Product, {
        where: { id: locked.itemId },
      });

      const prices = product?.prices ?? [];
      const selectedPrice = prices[locked.selectedPriceIndex ?? 0];

      const duration = selectedPrice
        ? parseInt(selectedPrice.duration, 10)
        : null;

      const freeKey = await em.findOne(Key, {
        where: {
          productId: locked.itemId,
          status: KeyStatus.ACTIVE,
          ...(duration ? { duration } : {}),
        },
        order: { id: 'ASC' },
      });

      if (!freeKey) {
        throw new BadRequestException('Нет доступных ключей');
      }

      freeKey.status = KeyStatus.SOLD;
      freeKey.orderId = locked.id;
      await em.save(freeKey);

      locked.deliveredKey = freeKey.key;
      locked.isDelivered = true;
      await em.save(locked);
    });
  }

  /**
   * Прикрепить скрин оплаты (Telegram). Переводит заказ в PENDING_REVIEW.
   */
  async attachTelegramPaymentProof(
    orderId: number,
    telegramFileId: string,
    path: string | null,
  ) {
    const order = await this.findById(orderId);
    if (!order) {
      throw new NotFoundException('Заказ не найден');
    }
    if (order.status !== OrderStatus.WAITING_PAYMENT) {
      throw new BadRequestException(
        'Скрин можно прикрепить только к заказу в статусе ожидания оплаты',
      );
    }
    order.paymentProofTelegramFileId = telegramFileId;
    order.paymentProofPath = path;
    order.status = OrderStatus.PENDING_REVIEW;
    return this.ordersRepository.save(order);
  }

  async approveManualOrder(orderId: number): Promise<{
    order: Order;
    keyDelivered: boolean;
    noKeysAvailable: boolean;
  }> {
    const order = await this.findById(orderId);
    if (!order) {
      throw new NotFoundException('Заказ не найден');
    }
    if (order.status === OrderStatus.PAID) {
      return { order, keyDelivered: true, noKeysAvailable: false };
    }
    if (order.status !== OrderStatus.PENDING_REVIEW) {
      throw new BadRequestException('Заказ не ожидает решения администратора');
    }
    if (order.paymentSource !== OrderPaymentSource.MANUAL_CARD) {
      throw new BadRequestException('Некорректный тип оплаты заказа');
    }

    order.status = OrderStatus.PAID;
    await this.ordersRepository.save(order);
    await this.referralsService.tryCreditForPaidOrder(orderId);

    try {
      await this.deliverDigitalItem(orderId);
      const fresh = await this.findByIdWithRelations(orderId);
      return {
        order: fresh!,
        keyDelivered: true,
        noKeysAvailable: false,
      };
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : '';
      if (msg.includes('Нет доступных ключей')) {
        const fresh = await this.findByIdWithRelations(orderId);
        this.logger.warn(
          `Заказ ${orderId} оплачен вручную, но ключей нет в наличии`,
        );
        return {
          order: fresh!,
          keyDelivered: false,
          noKeysAvailable: true,
        };
      }
      throw e;
    }
  }

  async rejectManualOrder(orderId: number, comment?: string) {
    const order = await this.findById(orderId);
    if (!order) {
      throw new NotFoundException('Заказ не найден');
    }
    if (order.status !== OrderStatus.PENDING_REVIEW) {
      throw new BadRequestException('Отклонить можно только заказ на проверке');
    }
    order.status = OrderStatus.REJECTED;
    if (comment !== undefined) {
      order.adminReviewComment = comment;
    }
    return this.ordersRepository.save(order);
  }

  async getOrderPublic(orderId: string) {
    const order = await this.ordersRepository.findOne({
      where: { publicId: orderId },
      relations: ['product'],
    });

    if (!order) {
      throw new NotFoundException('Заказ не найден');
    }

    const priceEntry =
      order.selectedPriceIndex !== null
        ? (order.product.prices?.[order.selectedPriceIndex] ?? null)
        : null;

    return {
      id: order.id,
      publicId: order.publicId,
      status: order.status,
      isDelivered: order.isDelivered,
      product: order.product.name,
      amount: order.amount,
      duration: priceEntry?.duration ?? null,
      deliveredKey:
        order.status === OrderStatus.PAID ? order.deliveredKey : null,
      createdAt: order.createdAt,
    };
  }

  async cancelOrder(orderId: number) {
    const order = await this.findById(orderId);
    if (!order) {
      throw new NotFoundException('Заказ не найден');
    }
    order.status = OrderStatus.CANCELLED;
    return this.ordersRepository.save(order);
  }

  async expireOrder(orderId: number) {
    const order = await this.findById(orderId);
    if (!order) {
      throw new NotFoundException('Заказ не найден');
    }
    order.status = OrderStatus.EXPIRED;
    return this.ordersRepository.save(order);
  }

  async expireOldOrders(): Promise<Order[]> {
    const threshold = new Date(Date.now() - 30 * 60 * 1000);

    const expiredOrders = await this.ordersRepository.find({
      where: {
        status: OrderStatus.WAITING_PAYMENT,
        createdAt: LessThan(threshold),
      },
      relations: ['user'],
    });

    for (const order of expiredOrders) {
      await this.expireOrder(order.id);
    }

    return expiredOrders;
  }
}
