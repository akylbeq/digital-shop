import { JwtService } from '@nestjs/jwt';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { User } from '../users/user.entity';

export type AccessTokenPayload = { sub: number; email: string; role: string };
export type RefreshPayload = { sub: number };

@Injectable()
export class TokenService {
  constructor(private readonly jwt: JwtService) {}

  createAccessToken(user: User): string {
    return this.jwt.sign(
      {
        sub: user.id,
        email: user.email ?? '',
        role: user.role,
      },
      { expiresIn: '2h' },
    );
  }

  createRefreshToken(userID: number): string {
    return this.jwt.sign({ sub: userID }, { expiresIn: '7d' });
  }

  verifyAccessToken(token: string): AccessTokenPayload {
    try {
      return this.jwt.verify<AccessTokenPayload>(token);
    } catch {
      throw new UnauthorizedException('Access token is invalid or expired');
    }
  }

  verifyRefreshToken(token: string): RefreshPayload {
    try {
      return this.jwt.verify<RefreshPayload>(token);
    } catch {
      throw new UnauthorizedException('Refresh token is invalid or expired');
    }
  }
}
