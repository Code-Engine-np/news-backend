import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { verifyPassword } from '../common/security/password-hash.util';
import { hashToken, verifyToken } from '../common/security/token-hash.util';
import { GoogleProfileDto } from './dto/google-profile.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { User } from '../entities';
import { Role } from '../common/enums/role.enum';

type TokenPayload = {
  sub: string;
  email: string;
  role: Role;
};

function parseDurationToSeconds(
  value: string,
  fallbackSeconds: number,
): number {
  const match = /^(\d+)([smhd])$/.exec(value.trim());

  if (!match) {
    return fallbackSeconds;
  }

  const amount = Number(match[1]);
  const unit = match[2];

  switch (unit) {
    case 's':
      return amount;
    case 'm':
      return amount * 60;
    case 'h':
      return amount * 60 * 60;
    case 'd':
      return amount * 60 * 60 * 24;
    default:
      return fallbackSeconds;
  }
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByEmail(loginDto.email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordMatches = verifyPassword(
      loginDto.password,
      user.passwordHash,
    );
    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.issueTokens(user);
  }

  async refresh(refreshToken: RefreshTokenDto) {
    const payload = await this.verifyRefreshToken(refreshToken.refreshToken);
    const user = await this.usersService.findById(payload.sub);

    if (!user || !user.refreshTokenHash) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (!verifyToken(refreshToken.refreshToken, user.refreshTokenHash)) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    return this.issueTokens(user);
  }

  async logout(userId: string): Promise<{ success: boolean }> {
    await this.usersService.updateRefreshTokenHash(userId, null);
    return { success: true };
  }

  async googleLogin(profile: GoogleProfileDto) {
    if (!profile.email) {
      throw new UnauthorizedException('Google account has no email');
    }

    const user = await this.usersService.createGoogleUser({
      googleId: profile.id,
      email: profile.email,
      fullName: profile.fullName,
    });

    return this.issueTokens(user);
  }

  private async issueTokens(user: User) {
    const payload: TokenPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>(
        'JWT_ACCESS_SECRET',
        this.configService.get<string>(
          'JWT_SECRET',
          'dev_jwt_secret_change_me',
        ),
      ),
      expiresIn: parseDurationToSeconds(
        this.configService.get<string>('JWT_ACCESS_EXPIRES_IN', '15m'),
        15 * 60,
      ),
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>(
        'JWT_REFRESH_SECRET',
        'dev_refresh_secret_change_me',
      ),
      expiresIn: parseDurationToSeconds(
        this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '7d'),
        7 * 24 * 60 * 60,
      ),
    });

    await this.usersService.updateRefreshTokenHash(
      user.id,
      hashToken(refreshToken),
    );

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        fullName: user.fullName,
      },
    };
  }

  private async verifyRefreshToken(token: string) {
    try {
      return await this.jwtService.verifyAsync<TokenPayload>(token, {
        secret: this.configService.get<string>(
          'JWT_REFRESH_SECRET',
          'dev_refresh_secret_change_me',
        ),
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
