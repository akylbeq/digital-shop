import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { TokenService } from './token.service';
import { NotFoundError } from 'rxjs';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly tokens: TokenService
  ) {
  }

  async login(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new UnauthorizedException('Неверный email или пароль');

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) throw new UnauthorizedException('Неверный email или пароль');

    const accessToken = this.tokens.createAccessToken(user);
    const refreshToken = this.tokens.createRefreshToken(user.id);

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        created_at: user.created_at
      },
      accessToken,
      refreshToken
    };
  }

  async register(userData: CreateUserDto) {
    const user = await this.usersService.createUser(userData);

    const accessToken = this.tokens.createAccessToken(user);
    const refreshToken = this.tokens.createRefreshToken(user.id);

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        created_at: user.created_at
      },
      accessToken,
      refreshToken
    };
  }

  async me(token: string) {
    const user = await this.tokens.verifyAccessToken(token);
    if (!user) throw new NotFoundError('User does not exist');
    return user;
  }

  async refresh(refreshToken: string) {
    try {
      const payload = this.tokens.verifyRefreshToken(refreshToken);
      const user = await this.usersService.findById(payload.sub);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      const { password, ...userWithoutPassword } = user;

      const accessToken = this.tokens.createAccessToken(user);
      return {accessToken, user: userWithoutPassword};
    } catch {
      throw new UnauthorizedException('Refresh token expired');
    }
  }
}
