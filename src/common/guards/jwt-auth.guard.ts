import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request, Response } from 'express';
import { hashToken, verifyToken } from '../security/token-hash.util';
import { UsersService } from '../../users/users.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<Request & { user?: unknown }>();
    const response = context.switchToHttp().getResponse<Response>();

    const accessToken = this.extractToken(request);
    const refreshToken = this.extractRefreshToken(request);

    // 1. Try to validate access token first
    let payload: { sub: string; email: string; role: string } | null = null;

    if (accessToken) {
      try {
        payload = (await this.jwtService.verifyAsync(accessToken, {
          secret:
            process.env.JWT_ACCESS_SECRET ||
            process.env.JWT_SECRET ||
            'dev_jwt_secret_change_me',
        })) as { sub: string; email: string; role: string };
      } catch {
        // Access token expired or invalid, will try refresh below
      }
    }

    // 2. If access token is invalid/expired, try to use refresh token
    if (!payload && refreshToken) {
      payload = await this.tryRefresh(refreshToken, response);
    }

    if (!payload) {
      throw new UnauthorizedException('Authentication required');
    }

    request.user = payload;
    return true;
  }

  private extractToken(request: Request): string | undefined {
    const auth = request.headers.authorization;
    if (!auth) return undefined;
    const [scheme, token] = auth.split(' ');
    return scheme === 'Bearer' && token ? token : undefined;
  }

  private extractRefreshToken(request: Request): string | undefined {
    const raw = request.headers['x-refresh-token'];
    if (typeof raw === 'string') return raw;
    return undefined;
  }

  private async tryRefresh(
    refreshToken: string,
    response: Response,
  ): Promise<{ sub: string; email: string; role: string } | null> {
    try {
      const payload = (await this.jwtService.verifyAsync(refreshToken, {
        secret:
          process.env.JWT_REFRESH_SECRET || 'dev_refresh_secret_change_me',
      })) as { sub: string; email: string; role: string };

      const user = await this.usersService.findById(payload.sub);
      if (!user || !user.refreshTokenHash) {
        return null;
      }

      if (!verifyToken(refreshToken, user.refreshTokenHash)) {
        return null;
      }

      // Issue new token pair -------------------------------------------------
      const newAccessToken = await this.jwtService.signAsync(
        { sub: user.id, email: user.email, role: user.role },
        {
          secret:
            process.env.JWT_ACCESS_SECRET ||
            process.env.JWT_SECRET ||
            'dev_jwt_secret_change_me',
          expiresIn: 15 * 60,
        },
      );

      const newRefreshToken = await this.jwtService.signAsync(
        { sub: user.id, email: user.email, role: user.role },
        {
          secret:
            process.env.JWT_REFRESH_SECRET || 'dev_refresh_secret_change_me',
          expiresIn: 7 * 24 * 60 * 60,
        },
      );

      // Store new refresh token hash
      await this.usersService.updateRefreshTokenHash(
        user.id,
        hashToken(newRefreshToken),
      );

      // Send new tokens back in headers so the client can update its store
      response.setHeader('X-New-Access-Token', newAccessToken);
      response.setHeader('X-New-Refresh-Token', newRefreshToken);

      return { sub: user.id, email: user.email, role: user.role };
    } catch {
      return null;
    }
  }
}
