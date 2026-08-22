import { NestFactory, Reflector } from '@nestjs/core';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { ExpressAdapter } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import express from 'express';
import cookieParser from 'cookie-parser';
import type { IncomingMessage, ServerResponse } from 'http';
import { AppModule } from '@/app.module';

/**
 * Serverless entry for Vercel.
 *
 * This file lives in `src/` on purpose: `nest build` compiles it and
 * `tsc-alias` (postbuild) rewrites every `@/...` import into a real relative
 * path in `dist/`. The Vercel function (`api/index.js`) then loads the clean,
 * alias-free `dist/serverless.js` instead of having Vercel re-transpile the
 * `src/` tree (which leaves `@/` specifiers unresolved).
 *
 * The Express instance and the initialized Nest app are cached across
 * invocations so warm Lambdas skip the bootstrap.
 */
const server = express();
let ready: Promise<void> | null = null;

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, new ExpressAdapter(server));

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
): Promise<void> {
  if (!ready) {
    ready = bootstrap();
  }
  await ready;
  server(req as express.Request, res as express.Response);
}
