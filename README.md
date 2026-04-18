# FolioTree

FolioTree turns professional trajectory into clear, lively, fast-to-understand evidence.

## Workspace

```text
apps/web        Next.js App Router frontend
apps/api        Fastify API + Prisma
packages/domain Shared schemas, enums, fixtures, and template foundation
docs            Source-of-truth product and design documentation
```

## Local Setup

```bash
pnpm install
pnpm prisma:generate
pnpm dev
```

Useful commands:

```bash
pnpm lint
pnpm typecheck
pnpm build
pnpm prisma:validate
```

The frontend runs at `http://localhost:3000`.
The API runs at `http://localhost:4000`.

## Environment

Copy `.env.example` to `.env.local` or configure the equivalent platform variables.

Required for persistence:

- `DATABASE_URL`

Required for production auth/storage:

- `CLERK_SECRET_KEY`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `BLOB_READ_WRITE_TOKEN`

## MVP Navigation

The product model is:

```text
Profile -> Versions -> Pages / Resumes
```

Public routes:

- `/`
- `/login`
- `/register`
- `/forgot-password`
- `/p/[slug]`
- `/cv/[slug]`

Logged-in routes:

- `/app/start`
- `/app/profile`
- `/app/versions`
- `/app/pages`
- `/app/resumes`
- `/app/templates`
- `/app/settings`
