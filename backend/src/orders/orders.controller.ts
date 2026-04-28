import {
  Body,
  Controller,
  Get,
  Inject,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
  forwardRef,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { TokenAuthGuard } from '../auth/token-auth.guard';
import { PermitAuthGuard } from '../auth/permit-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { AdminOrdersQueryDto } from './dto/admin-orders-query.dto';
import { RejectOrderDto } from './dto/reject-order.dto';
import { TelegramBotService } from '../telegram/telegram-bot.service';

@Controller('admin/orders')
@UseGuards(TokenAuthGuard, PermitAuthGuard)
@Roles('admin')
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    @Inject(forwardRef(() => TelegramBotService))
    private readonly telegramBot: TelegramBotService,
  ) {}

  @Get()
  list(@Query() query: AdminOrdersQueryDto) {
    return this.ordersService.listForAdmin({
      status: query.status,
      page: query.page,
      limit: query.limit,
    });
  }

  @Get(':id')
  async one(@Param('id', ParseIntPipe) id: number) {
    const order = await this.ordersService.findByIdWithRelations(id);
    if (!order) {
      throw new NotFoundException('Заказ не найден');
    }
    let paymentProofUrl: string | null = null;
    if (order.paymentProofTelegramFileId) {
      paymentProofUrl = await this.telegramBot.getPublicFileUrl(
        order.paymentProofTelegramFileId,
      );
    }
    return { ...order, paymentProofUrl };
  }

  @Get('public/:id')
  async getById(@Param('id') id: string) {
    return this.ordersService.getOrderPublic(id);
  }

  @Post(':id/approve')
  async approve(@Param('id', ParseIntPipe) id: number) {
    const result = await this.ordersService.approveManualOrder(id);
    await this.telegramBot.notifyAfterWebAdminDecision(id, result);
    return result;
  }

  @Post(':id/reject')
  async reject(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: RejectOrderDto,
  ) {
    const order = await this.ordersService.rejectManualOrder(id, body.comment);
    await this.telegramBot.notifyAfterWebReject(id, order);
    return order;
  }
}
