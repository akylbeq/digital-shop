import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from '../orders/order.entity';
import { Key, KeyStatus } from '../keys/key.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly ordersRepository: Repository<Order>,
    @InjectRepository(Key)
    private readonly keysRepository: Repository<Key>,
  ) {}

  async createPendingOrder(userId: number, itemId: number, amount: number) {
    const order = this.ordersRepository.create({
      userId,
      itemId,
      amount,
      status: OrderStatus.PENDING,
      pallyBillId: null,
      deliveredKey: null,
      isDelivered: false,
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
    const order = await this.findById(orderId);

    if (!order) {
      throw new NotFoundException('Заказ не найден');
    }

    if (order.status !== OrderStatus.PAID) {
      throw new BadRequestException('Заказ не оплачен');
    }

    if (order.isDelivered) {
      return order;
    }

    const freeKey = await this.keysRepository.findOne({
      where: {
        productId: order.itemId,
        status: KeyStatus.ACTIVE,
      },
      order: {
        id: 'ASC',
      },
    });

    if (!freeKey) {
      throw new BadRequestException('Нет доступных ключей');
    }

    freeKey.status = KeyStatus.SOLD;
    await this.keysRepository.save(freeKey);

    order.deliveredKey = freeKey.key;
    order.isDelivered = true;

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
}
