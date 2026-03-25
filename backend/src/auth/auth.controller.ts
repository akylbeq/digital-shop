import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';
import type { Request, Response } from 'express';
import { UsersService } from '../users/users.service';
import {
  getAccessCookieOptions,
  getRefreshCookieOptions,
} from './cookie.config';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UsersService,
  ) {}

  @Post('login')
  async auth(
    @Body() data: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { user, accessToken, refreshToken } = await this.authService.login(
      data.email,
      data.password,
    );
    res.cookie('access_token', accessToken, getAccessCookieOptions());
    res.cookie('refresh_token', refreshToken, getRefreshCookieOptions());
    return user;
  }

  @Post('register')
  async registerUser(
    @Body() data: CreateUserDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { user, accessToken, refreshToken } =
      await this.authService.register(data);
    res.cookie('access_token', accessToken, getAccessCookieOptions());
    res.cookie('refresh_token', refreshToken, getRefreshCookieOptions());
    return user;
  }

  @Get('me')
  async me(@Req() req: Request) {
    const token = req.cookies['access_token'] as string;
    if (!token) {
      throw new UnauthorizedException('Token not found');
    }
    const user = this.authService.me(token);
    const getUser = await this.userService.findById(user.sub);
    return { ...getUser, password: undefined };
  }

  @Post('refresh')
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const token = req.cookies['refresh_token'] as string;
    if (!token) {
      throw new UnauthorizedException('Refresh token not found ' + token);
    }

    const { accessToken, user } = await this.authService.refresh(token);

    res.cookie('access_token', accessToken, getAccessCookieOptions());

    return { user };
  }

  @Delete('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    res.cookie('access_token', '', {
      httpOnly: true,
      path: '/',
      expires: new Date(0),
    });

    res.cookie('refresh_token', '', {
      httpOnly: true,
      expires: new Date(0),
      path: '/auth/refresh',
    });

    return { message: 'Logged out successfully' };
  }
}
