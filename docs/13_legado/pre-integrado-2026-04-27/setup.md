# FolioTree Local Setup

Status: foundation note
Last updated: 2026-04-27

## Stack

- Next.js App Router
- TypeScript strict mode
- Prisma
- PostgreSQL on Neon
- NextAuth credentials auth for the MVP
- Vercel-oriented frontend deployment
- S3-compatible or local file storage

## Environment

Copy `.env.example` to `.env` and fill the values locally.

Required variables:

- `DATABASE_URL`
- `DIRECT_URL`
- `AUTH_SECRET`
- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_APP_NAME`

Optional storage variables:

- `STORAGE_PROVIDER`
- `STORAGE_MAX_FILE_SIZE_MB`
- `STORAGE_ALLOWED_IMAGE_TYPES`
- `STORAGE_S3_ENDPOINT`
- `STORAGE_S3_REGION`
- `STORAGE_S3_BUCKET`
- `STORAGE_S3_ACCESS_KEY_ID`
- `STORAGE_S3_SECRET_ACCESS_KEY`
- `STORAGE_PUBLIC_BASE_URL`

Use `STORAGE_PROVIDER=local` for local development when an external object store is not reachable. Local uploads are written to `public/uploads/` and served by Next.js as static files.

When `STORAGE_PROVIDER=s3`, all `STORAGE_S3_*` values are required. Supabase Storage can be used only through its S3-compatible endpoint; the app does not use Supabase Auth or Supabase client helpers.

Validate configuration:

```bash
npm run env:check
```

## Database

Validate the Prisma schema:

```bash
npm run db:validate
```

## Local Server Port

The app is pinned to port `3000`. Use:

```bash
npm run dev
```

The dev launcher always starts Next.js on `127.0.0.1:3000`. If another process is already listening on port `3000`, the launcher attempts to stop that process before starting FolioTree. Extra port arguments such as `--port 3001` are intentionally ignored.

Generate Prisma Client:

```bash
npm run db:generate
```

Apply migrations locally:

```bash
npm run db:migrate
```

Deploy migrations in production:

```bash
npm run db:migrate:deploy
```

Check migration status against the configured database:

```bash
npm run db:migrate:status
```

Seed the first template:

```bash
npm run db:seed
```

## Quality Commands

```bash
npm run typecheck
npm run lint
npm run format:check
npm run test
npm run check
```

## Security Foundation

- Environment variables are validated before server dependencies are used.
- Database URLs are validated as PostgreSQL URLs for the Neon target.
- Prisma logging avoids query logs to reduce sensitive data exposure.
- API errors use normalized responses.
- Server logs record error class/scope only, not secrets or raw payloads.
- Auth login and auth mutations have an in-process rate-limit foundation.
- Resource authorization helpers are available in `lib/security/authz.ts`.
- Asset upload policy is centralized in `lib/storage/policy.ts`.
- Asset upload readiness is centralized in `lib/storage/assets.ts`; it validates policy and keeps uploads disabled until a provider is explicitly configured.
- Password reset routes generate opaque expirable tokens, store hashes only, avoid user enumeration, and never return or log raw reset tokens.
- Email delivery for password reset is currently a private no-op hook; plug in a provider before treating forgot-password as a complete production email flow.

The current rate limiter is intentionally minimal and process-local. Before production scale-out, replace its storage with Redis, Vercel KV, Upstash, or another shared store.
