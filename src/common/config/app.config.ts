import { AppConfig } from '@/common/interfaces/env.interface';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

export async function configuration() {
  const envConfig: AppConfig = {
    port: Number(process.env.PORT),

    //Authentication configuration
    JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET!,
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET!,
    JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN!,
    JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN!,

    // Cloudinary configuration
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME!,
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY!,
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET!,
    // Database configuration
    DB_HOST: process.env.DB_HOST!,
    DB_PORT: Number(process.env.DB_PORT),
    DB_USER: process.env.DB_USER!,
    DB_PASSWORD: process.env.DB_PASSWORD!,
    DB_NAME: process.env.DB_NAME!,
    DB_SYNCHRONIZE: process.env.DB_SYNCHRONIZE === 'true' || false,
    DB_LOGGING: process.env.DB_LOGGING === 'true' || false,

    //Google OAuth configuration
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID!,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET!,
    GOOGLE_REDIRECT_URI: process.env.GOOGLE_REDIRECT_URI!,
  };

  const transformedEnv = plainToInstance(AppConfig, envConfig);

  const errors = await validate(transformedEnv);
  if (errors.length) {
    console.error('FATAL ENVIRONMENT CONFIGURATION ERROR(S) FOUND:');
    errors.forEach((err) => {
      console.error(`\nProperty: ${err.property}`);
      if (err.constraints) {
        Object.entries(err.constraints).forEach(([constraintKey, message]) => {
          console.error(`  - Constraint Failed: ${constraintKey}`);
          console.error(`    Message: ${message}`);
        });
      }
    });
    process.exit(1);
  }

  return transformedEnv;
}
