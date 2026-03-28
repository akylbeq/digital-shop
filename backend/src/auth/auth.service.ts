import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { TokenService } from './token.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly tokens: TokenService,
  ) {}

  async login(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new UnauthorizedException('Неверный email или пароль');
    if (!user.password) {
      throw new UnauthorizedException('Неверный email или пароль');
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) throw new UnauthorizedException('Неверный email или пароль');

    const accessToken = this.tokens.createAccessToken(user);
    const refreshToken = this.tokens.createRefreshToken(user.id);

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        created_at: user.created_at,
      },
      accessToken,
      refreshToken,
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
        created_at: user.created_at,
      },
      accessToken,
      refreshToken,
    };
  }

  me(token: string) {
    const user = this.tokens.verifyAccessToken(token);
    if (!user) throw new NotFoundException('User does not exist');
    return user;
  }

  async refresh(refreshToken: string) {
    const payload = this.tokens.verifyRefreshToken(refreshToken);
    const user = await this.usersService.findById(payload.sub);
    if (!user) throw new UnauthorizedException('User not found');
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...userWithoutPassword } = user;

      const accessToken = this.tokens.createAccessToken(user);
      return { accessToken, user: userWithoutPassword };
    } catch (e) {
      if (e instanceof UnauthorizedException) throw e;
      throw new UnauthorizedException('Refresh token expired');
    }
  }
}
