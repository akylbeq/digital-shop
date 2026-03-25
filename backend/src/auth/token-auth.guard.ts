import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UserDto } from '../users/dto/user.dto';
import { TokenService } from './token.service';
import { Request } from 'express';

export type RequestWithUser = Request & { user: UserDto };

@Injectable()
export class TokenAuthGuard implements CanActivate {
  constructor(private readonly token: TokenService) {}

  canActivate(context: ExecutionContext): boolean {
    const req: Request = context.switchToHttp().getRequest();
    const token = req.cookies['access_token'] as string | undefined;
    if (!token) {
      throw new UnauthorizedException('No authorization token');
    }
    try {
      const headerToken = token.replace('Bearer ', '');
      const verify = this.token.verifyAccessToken(headerToken);
      req.user = {
        id: verify.sub,
        email: verify.email,
        role: verify.role,
      };
      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
