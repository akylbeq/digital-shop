import { Body, Controller, Get, Injectable, Post, Req, Res, Delete, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';
import type {Response, Request} from 'express';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
import { UsersService } from '../users/users.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UsersService
  ) {}

  @Post('login')
  async auth(@Body() data: LoginDto, @Res({passthrough: true}) res: Response) {
     const {user, accessToken, refreshToken} = await this.authService.login(data.email, data.password);
    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Только HTTPS в продакшене
      sameSite: 'lax',
      path: '/',
      domain: 'localhost',
      maxAge: 2 * 60 * 60 * 1000, // 2 часа
    })
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/auth/refresh', // Кука будет слаться только на эндпоинт обновления
      domain: 'localhost',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 дней
    })
     return user
  }

  @Post('register')
  async registerUser(@Body() data: CreateUserDto, @Res({passthrough: true}) res: Response) {
    const {user, accessToken, refreshToken} = await this.authService.register(data);
    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Только HTTPS в продакшене
      sameSite: 'lax',
      path: '/',
      maxAge: 2 * 60 * 60 * 1000, // 2 часа
    })
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/auth/refresh', // Кука будет слаться только на эндпоинт обновления
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 дней
    })
    return user
  }

  @Get('me')
  async me(@Req() req: Request) {
    const token = req.cookies['access_token'];
    if (!token) {
      throw new UnauthorizedException('Token not found');
    }
    const user = await this.authService.me(token)
    const getUser = await this.userService.findById(user.sub)
    return {...getUser, password: undefined}
  }

  @Post('refresh')
  async refresh(@Req() req: Request, @Res({passthrough: true}) res: Response) {
    const token = req.cookies['refresh_token'];
    if (!token) {
      throw new UnauthorizedException('Refresh token not found ' + token);
    }

    const { accessToken, user } = await this.authService.refresh(token);

    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 2 * 60 * 60 * 1000,
    });

    return { user };
  }

  @Delete('logout')
  async logout(@Res({ passthrough: true }) res) {
    res.cookie('access_token', '', {
      httpOnly: true,
      path: '/',
      expires: new Date(0)
    });

    res.cookie('refresh_token', '', {
      httpOnly: true,
      expires: new Date(0),
      path: '/auth/refresh'
    });

    return { message: 'Logged out successfully' };
  }
}