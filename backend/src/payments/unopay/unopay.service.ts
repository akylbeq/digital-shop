import {
  BadGatewayException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrdersService } from '../../orders/orders.service';
import { Product } from '../../products/product.entity';
import { OrderResponseDto } from './dto/order-response.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UnopayService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    private readonly ordersService: OrdersService,
    private readonly configService: ConfigService,
  ) {}

  async create(userId: number, dto: CreateOrderDto) {
    const product = await this.productRepository.findOne({
      where: { id: dto.productId },
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    const priceEntry = product.prices.find((p) => p.duration === dto.duration);
    if (!priceEntry) {
      throw new NotFoundException('Price not found');
    }
    const priceIndex = product.prices.indexOf(priceEntry);
    const paymentMethod = dto.payment_method ?? 'sbp';
    const isSbp = paymentMethod === 'sbp';
    const order = isSbp
      ? await this.ordersService.createUnopayOrder(
          userId,
          dto.productId,
          priceEntry.price,
          priceIndex,
        )
      : await this.ordersService.createManualCardOrder(
          userId,
          dto.productId,
          priceEntry.price,
          priceIndex,
        );

    if (!isSbp) {
      return {
        status: 'created',
        transaction_id: '',
        payment_url: null,
        amount: order.amount,
        currency: 'RUB',
        orderId: order.publicId,
      };
    }

    const orderWithUser = await this.ordersService.findByIdWithRelations(
      order.id,
    );
    const apiKey = this.configService.getOrThrow<string>('UNOPAY_API_KEY');
    const response = await fetch('https://unopay.cc/api/v1/create_payment', {
      method: 'POST',
      headers: {
        'X-Api-Key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: order.amount,
        description: 'Оплата за заказ',
        payment_method: 'sbp',
        payer_email: orderWithUser?.user?.email ?? '',
        metadata: { orderId: order.id },
      }),
    });

    if (!response.ok) {
      throw new BadGatewayException('Не удалось создать платеж в Unopay');
    }
    const payment = (await response.json()) as OrderResponseDto;

    return {
      ...payment,
      orderId: order.publicId,
    };
  }
}
