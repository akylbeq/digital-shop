import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { UnopayService } from './unopay.service';
import { CreateOrderDto } from './dto/create-order.dto';
import type { RequestWithUser } from '../../auth/token-auth.guard';
import { TokenAuthGuard } from '../../auth/token-auth.guard';

@Controller('unopay')
export class UnopayController {
  constructor(private readonly unopayService: UnopayService) {}

  @Post()
  @UseGuards(TokenAuthGuard)
  create(@Body() data: CreateOrderDto, @Req() req: RequestWithUser) {
    return this.unopayService.create(req.user.id, data);
  }
}
