import { IsBoolean, IsNumber, IsString } from 'class-validator';

export class AppConfig {
  @IsNumber()
  port!: number;

  @IsString()
  JWT_ACCESS_SECRET!: string;

  @IsString()
  JWT_REFRESH_SECRET!: string;

  @IsString()
  JWT_ACCESS_EXPIRES_IN!: string;

  @IsString()
  JWT_REFRESH_EXPIRES_IN!: string;

  @IsString()
  CLOUDINARY_CLOUD_NAME!: string;

  @IsString()
  CLOUDINARY_API_KEY!: string;

  @IsString()
  CLOUDINARY_API_SECRET!: string;

  @IsString()
  GOOGLE_CLIENT_ID!: string;

  @IsString()
  GOOGLE_CLIENT_SECRET!: string;

  @IsString()
  GOOGLE_REDIRECT_URI!: string;

  // @IsString()
  // DB_HOST!: string;

  // @IsNumber()
  // DB_PORT!: number;

  // @IsString()
  // DB_USER!: string;

  // @IsString()
  // DB_PASSWORD!: string;

  // @IsString()
  // DB_NAME!: string;

  @IsBoolean()
  DB_SYNCHRONIZE!: boolean;

  @IsBoolean()
  DB_LOGGING!: boolean;

  // @IsBoolean()
  // DB_SSL!: boolean;

  // @IsBoolean()
  // DB_SSL_REJECT_UNAUTHORIZED!: boolean;
  DATABASE_URL!: string;
}
