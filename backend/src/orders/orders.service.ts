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

  /** Публичный вызов после онлайн-оплаты (Pally) */
  async tryCreditReferralReward(orderId: number): Promise<void> {
    await this.referralsService.tryCreditForPaidOrder(orderId);
  }

  async createPendingOrder(userId: number, itemId: number, amount: number) {
    const order = this.ordersRepository.create({
      publicId: randomUUID(),
      userId,
      itemId,
      amount,
      status: OrderStatus.PENDING,
      paymentSource: OrderPaymentSource.PALLY,
      pallyBillId: null,
      deliveredKey: null,
      isDelivered: false,
      selectedPriceIndex: null,
    });

    return this.ordersRepository.save(order);
  }

  async createManualCardOrder(
    userId: number,
    itemId: number,
    amount: number,
    selectedPriceIndex: number | null,
  ) {
    const order = this.ordersRepository.create({
      publicId: randomUUID(),
      userId,
      itemId,
      amount,
      status: OrderStatus.WAITING_PAYMENT,
      paymentSource: OrderPaymentSource.MANUAL_CARD,
      pallyBillId: null,
      deliveredKey: null,
      isDelivered: false,
      selectedPriceIndex,
    });

    return this.ordersRepository.save(order);
  }

  async attachPallyBill(orderId: number, billId: string) {
    const order = await this.ordersRepository.findOne({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException('Заказ не найден');
    }

    order.pallyBillId = billId;
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

  async findByPublicId(publicId: string) {
    return this.ordersRepository.findOne({
      where: { publicId },
      relations: ['user', 'product'],
    });
  }

  async findOrdersForUser(userId: number, take = 20) {
    return this.ordersRepository.find({
      where: { userId, status: OrderStatus.PAID },
      order: { id: 'DESC' },
      take,
      relations: ['product'],
    });
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

      console.log(duration);

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

  /**
   * Одобрить ручную оплату и выдать ключ (общая логика с Pally после markPaid).
   * Возвращает флаг, удалось ли выдать ключ.
   */
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

  async getOrderPublicStatus(orderId: number) {
    const order = await this.findById(orderId);

    if (!order) {
      throw new NotFoundException('Заказ не найден');
    }

    return {
      id: order.id,
      status: order.status,
      isDelivered: order.isDelivered,
      deliveredKey:
        order.status === OrderStatus.PAID ? order.deliveredKey : null,
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
