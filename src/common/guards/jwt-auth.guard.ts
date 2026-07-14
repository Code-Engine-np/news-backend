import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request, Response } from 'express';
import { hashToken, verifyToken } from '../security/token-hash.util';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from '@/common/interfaces/jwt-payload';
import { UsersService } from '@/users/users.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<Request & { user?: JwtPayload }>();
    const response = context.switchToHttp().getResponse<Response>();

    const accessToken = this.extractToken(request);
    const refreshToken = this.extractRefreshToken(request);

    // 1. Try to validate access token first
    let payload: JwtPayload | null = null;

    if (accessToken) {
      try {
        payload = await this.jwtService.verifyAsync<JwtPayload>(accessToken, {
          secret: this.configService.get<string>('JWT_ACCESS_SECRET', {
            infer: true,
          }),
        });
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
  ): Promise<JwtPayload | null> {
    try {
      const payload: JwtPayload = await this.jwtService.verifyAsync<JwtPayload>(
        refreshToken,
        {
          secret: this.configService.get<string>('JWT_REFRESH_SECRET', {
            infer: true,
          }),
        },
      );

      const user = await this.usersService.findById(payload.sub);
      if (!user || !user.refreshTokenHash) {
        return null;
      }

      if (!verifyToken(refreshToken, user.refreshTokenHash)) {
        // return null;
        await this.usersService.updateRefreshTokenHash(user.id, null);
        throw new UnauthorizedException(
          'Refresh token is invalid or has been revoked',
        );
      }

      // Issue new token pair -------------------------------------------------
      return this.usersService.refreshWithLock(
        user.id,
        async (): Promise<JwtPayload> => {
          const newAccessToken = await this.jwtService.signAsync(
            { sub: user.id, email: user.email, role: user.role },
            {
              secret: this.configService.get<string>('JWT_ACCESS_SECRET', {
                infer: true,
              }),
              expiresIn: 15 * 60,
            },
          );

          const newRefreshToken = await this.jwtService.signAsync(
            { sub: user.id, email: user.email, role: user.role },
            {
              secret: this.configService.get<string>('JWT_REFRESH_SECRET', {
                infer: true,
              }),
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
        },
      );
    } catch (err) {
      if (err instanceof UnauthorizedException) {
        throw err;
      }
      return null;
    }
  }
}
