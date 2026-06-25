import {
  ExecutionContext,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
  constructor(private readonly configService: ConfigService) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID')?.trim();
    const clientSecret = this.configService
      .get<string>('GOOGLE_CLIENT_SECRET')
      ?.trim();

    if (!clientId || !clientSecret) {
      throw new ServiceUnavailableException(
        'Google OAuth is not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to enable it.',
      );
    }

    return super.canActivate(context);
  }
}
