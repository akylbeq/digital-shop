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

@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly configService: ConfigService,
  ) {}

  @Post('webhook/unopay')
  async unopayWebhook(
    @Body() body: UnopayWebhookBody,
    @Headers('x-unopay-signature') signature: string,
    @Req() req: RawBodyRequest<Request>,
  ) {
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

    if (
      !crypto.timingSafeEqual(
        Buffer.from(expectedSignature),
        Buffer.from(signature),
      )
    ) {
      throw new BadRequestException('Invalid signature');
    }

    const orderId = Number(body.metadata?.orderId);

    if (Number.isNaN(orderId)) {
      throw new BadRequestException('order_id отсутствует в metadata');
    }

    if (body.event === 'payment.succeeded' && body.status === 'paid') {
      await this.ordersService.markPaid(orderId);
      await this.ordersService.deliverDigitalItem(orderId);
    }

    return 'OK';
  }
}
