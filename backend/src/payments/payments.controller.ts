import {
  BadRequestException,
  Body,
  Controller,
  Post,
  Req,
  Headers,
} from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OrdersService } from '../orders/orders.service';
import { UnopayWebhookBody } from './unopay/dto/webhook.dto';
import crypto from 'node:crypto';
import { OrderPaymentSource } from '../orders/order.entity';

@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly configService: ConfigService,
  ) {}

  @Post('webhook/unopay')
  async unopayWebhook(
    @Body() body: any,
    @Headers('x-unopay-signature') signature: string,
    @Req() req: RawBodyRequest<Request>,
  ) {
    console.log(body);
    if (!signature) {
      throw new BadRequestException('Подпись отсутствует');
    }
    if (!req.rawBody) {
      throw new BadRequestException('Raw body отсутствует');
    }
    const apiKey = this.configService.getOrThrow<string>('UNOPAY_API_KEY');
    const expectedSignature = crypto
      .createHmac('sha256', apiKey)
      .update(req.rawBody)
      .digest('hex');
    const expectedBuffer = Buffer.from(expectedSignature);
    const signatureBuffer = Buffer.from(signature);

    if (
      expectedBuffer.length !== signatureBuffer.length ||
      !crypto.timingSafeEqual(expectedBuffer, signatureBuffer)
    ) {
      throw new BadRequestException('Invalid signature');
    }

    const orderId = Number(body.metadata?.orderId);

    console.log(orderId);

    if (Number.isNaN(orderId)) {
      throw new BadRequestException('order_id отсутствует в metadata');
    }

    if (body.event === 'payment.succeeded' && body.status === 'paid') {
      const order = await this.ordersService.findById(orderId);
      if (!order) {
        throw new BadRequestException('Заказ не найден');
      }
      if (order.paymentSource !== OrderPaymentSource.UNOPAY) {
        throw new BadRequestException('Некорректный источник оплаты');
      }
      await this.ordersService.markPaid(orderId);
      if (!order.isDelivered) {
        await this.ordersService.deliverDigitalItem(orderId);
      }
    }

    return 'OK';
  }
}
