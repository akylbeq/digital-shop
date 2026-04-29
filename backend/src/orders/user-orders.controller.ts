import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import type { RequestWithUser } from '../auth/token-auth.guard';
import { TokenAuthGuard } from '../auth/token-auth.guard';
import { OrdersService } from './orders.service';

@Controller('orders')
@UseGuards(TokenAuthGuard)
export class UserOrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get('my')
  async getMyOrders(@Req() req: RequestWithUser) {
    return this.ordersService.findPurchasesForUser(req.user.id, 100);
  }
}
