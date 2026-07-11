import { AppConfig } from '@/common/interfaces/env.interface';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy, VerifyCallback } from 'passport-google-oauth20';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(configService: ConfigService<AppConfig, true>) {
    const clientID = configService.get('GOOGLE_CLIENT_ID', {
      infer: true,
    });

    const clientSecret = configService.get('GOOGLE_CLIENT_SECRET', {
      infer: true,
    });

    super({
      clientID,
      clientSecret,
      callbackURL: configService.get('GOOGLE_REDIRECT_URI', {
        infer: true,
      }),
      scope: ['email', 'profile'],
    });
  }

  validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ): void {
    const email = profile.emails?.[0]?.value ?? '';
    done(null, {
      googleId: profile.id,
      email,
      fullName: profile.displayName,
    });
  }
}
