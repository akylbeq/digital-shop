import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import type { RequestWithUser } from '../auth/token-auth.guard';
import { TokenAuthGuard } from '../auth/token-auth.guard';
import { PermitAuthGuard } from 'src/auth/permit-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(TokenAuthGuard, PermitAuthGuard)
  @Roles('admin')
  @Get()
  getUsers(@Req() req: RequestWithUser) {
    return req.user;
  }
}
