import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { OrdersService } from './orders.service';
import { PallyService } from './pally/pally.service';
import { PallyWebhookBody } from './pally/types';
import { PaymentCreateDto } from './dto/payment-create.dto';

@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly pallyService: PallyService,
    private readonly configService: ConfigService,
  ) {}

  @Post('create')
  async createPayment(@Body() body: PaymentCreateDto) {
    const { userId, itemId, amount } = body;

    if (!userId || !itemId || !amount) {
      throw new BadRequestException('userId, itemId, amount обязательны');
    }

    const order = await this.ordersService.createPendingOrder(
      userId,
      itemId,
      amount,
    );

    const payment = await this.pallyService.createBill(
      Number(order.amount),
      String(order.id),
    );

    await this.ordersService.attachPallyBill(order.id, payment.bill_id);

    return {
      orderId: order.id,
      paymentUrl: payment.link_page_url,
      billId: payment.bill_id,
    };
  }

  @Post('webhook/pally')
  async pallyWebhook(@Body() body: PallyWebhookBody) {
    const { Status, InvId, OutSum, SignatureValue } = body;

    if (!InvId || !OutSum || !SignatureValue) {
      throw new BadRequestException('Неверный webhook body');
    }

    const token = this.configService.getOrThrow<string>('PALLY_API_TOKEN');

    const expectedSignature = crypto
      .createHash('md5')
      .update(`${OutSum}:${InvId}:${token}`)
      .digest('hex')
      .toUpperCase();

    if (expectedSignature !== String(SignatureValue).toUpperCase()) {
      throw new BadRequestException('Invalid signature');
    }

    const orderId = Number(InvId);

    if (Number.isNaN(orderId)) {
      throw new BadRequestException('InvId должен быть числом');
    }

    if (Status === 'SUCCESS') {
      await this.ordersService.markPaid(orderId);
      await this.ordersService.deliverDigitalItem(orderId);
    } else if (Status === 'FAIL') {
      await this.ordersService.markFailed(orderId);
    }

    return 'OK';
  }

  @Get(':id/status')
  async getOrderStatus(@Param('id') id: string) {
    const orderId = Number(id);

    if (Number.isNaN(orderId)) {
      throw new BadRequestException('Некорректный id заказа');
    }

    return this.ordersService.getOrderPublicStatus(orderId);
  }
}
