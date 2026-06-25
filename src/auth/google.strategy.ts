import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy, VerifyCallback } from 'passport-google-oauth20';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(configService: ConfigService) {
    const clientID =
      configService.get<string>('GOOGLE_CLIENT_ID')?.trim() ||
      'google-client-id-not-configured';
    const clientSecret =
      configService.get<string>('GOOGLE_CLIENT_SECRET')?.trim() ||
      'google-client-secret-not-configured';

    super({
      clientID,
      clientSecret,
      callbackURL: configService.get<string>(
        'GOOGLE_CALLBACK_URL',
        'http://localhost:3000/api/auth/google/callback',
      ),
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
