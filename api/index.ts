import 'tsconfig-paths/register';
import { NestFactory, Reflector } from '@nestjs/core';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { ExpressAdapter } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import express from 'express';
import cookieParser from 'cookie-parser';
import { AppModule } from '../src/app.module';
import type { IncomingMessage, ServerResponse } from 'http';

const server = express();
let bootstrapPromise: Promise<void> | null = null;

async function bootstrap() {
  const adapter = new ExpressAdapter(server);
  const app = await NestFactory.create(AppModule, adapter);

  app.setGlobalPrefix('api');
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  app.enableCors({
    origin: process.env.CORS_ORIGIN?.split(',') ?? '*',
    exposedHeaders: ['X-New-Access-Token', 'X-New-Refresh-Token'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  });
  app.use(cookieParser());

  const swaggerConfig = new DocumentBuilder()
    .setTitle('News Backend API')
    .setDescription(
      'API for multilingual news content, users, categories, tags, and engagement data.',
    )
    .setVersion('1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'JWT-auth',
    )
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: { persistAuthorization: true },
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.init();
}

export default async function handler(
  req: IncomingMessage,
  res: ServerResponse,
) {
  if (!bootstrapPromise) {
    bootstrapPromise = bootstrap();
  }
  await bootstrapPromise;
  server(req, res);
}
