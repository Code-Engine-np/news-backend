# News Backend

A NestJS backend for a multilingual news site with PostgreSQL, TypeORM, JWT authentication, RBAC, Swagger documentation, and Docker-based development.

## Features

- JWT auth with `admin`, `editor`, and `viewer` roles
- Shared TypeORM entities for users, categories, tags, articles, comments, media, article views, article likes, and newsletter subscriptions
- English and Nepali content fields for article data
- Swagger API docs
- Docker Compose setup for the app and database

## Prerequisites

- Node.js 22+
- pnpm 10+
- Docker and Docker Compose

## Project Setup

```bash
pnpm install
cp .env.example .env
```

## Environment Variables

The application reads configuration from `.env`.

Key variables:

- `PORT` - application port
- `DB_HOST` - PostgreSQL host
- `DB_PORT` - PostgreSQL port
- `DB_USER` - PostgreSQL user
- `DB_PASSWORD` - PostgreSQL password
- `DB_NAME` - PostgreSQL database name
- `DB_SYNCHRONIZE` - TypeORM schema sync flag for local development
- `DB_LOGGING` - enable TypeORM SQL logging
- `JWT_SECRET` - JWT signing secret
- `JWT_EXPIRES_IN` - JWT expiration time
- `SEED_ADMIN_EMAIL` - initial admin email seed
- `SEED_ADMIN_PASSWORD` - initial admin password seed

## Run Locally

```bash
pnpm run start:dev
```

The API will be available at:

- `http://localhost:3000/api`
- Swagger UI: `http://localhost:3000/docs`

## Run with Docker

```bash
docker compose up --build
```

This starts:

- PostgreSQL on port `5432`
- The NestJS API on port `3000`

## Available Roles

- `admin` - full access
- `editor` - content creation and editing access
- `viewer` - read-only authenticated access

## API Overview

### Auth

- `POST /api/auth/login`
- `GET /api/auth/me`

### Users

- `GET /api/users`
- `POST /api/users`

### Articles

- `GET /api/articles/published`
- `GET /api/articles`
- `GET /api/articles/:id`
- `POST /api/articles`
- `PATCH /api/articles/:id`
- `DELETE /api/articles/:id`

## Entity Layout

All shared entities live in `src/entities` so they can be reused from any module without scattered imports.

- `src/entities/user.entity.ts`
- `src/entities/category.entity.ts`
- `src/entities/tag.entity.ts`
- `src/entities/article-tag.entity.ts`
- `src/entities/comment.entity.ts`
- `src/entities/media.entity.ts`
- `src/entities/article-view.entity.ts`
- `src/entities/article-like.entity.ts`
- `src/entities/news-article.entity.ts`
- `src/entities/newsletter-subscription.entity.ts`
- `src/entities/index.ts`

## Scripts

```bash
pnpm run build
pnpm run start
pnpm run start:dev
pnpm run test
pnpm run test:e2e
pnpm run lint
```

## Notes

- Swagger is mounted at `/docs` and the app routes are prefixed with `/api`.
- The Docker setup uses PostgreSQL and can seed an initial admin user from environment variables.
- For production, prefer database migrations instead of `DB_SYNCHRONIZE=true`.