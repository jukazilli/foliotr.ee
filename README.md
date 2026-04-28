# FolioTree

FolioTree turns a professional identity into public portfolios, quick resumes, reviews, presentations and career context.

## Current Runtime

The active app is a fullstack Next.js application at the repository root.

```text
Browser -> Next.js App Router -> app/api/* -> Prisma -> PostgreSQL
```

The current production model is documented in:

- `docs/current-architecture.md`
- `docs/runtime-architecture-decision.md`

Older workspace/API plans in `docs/mvp-*.md` are historical references, not the active runtime contract.

## Main Product Flow

```text
Profile base -> Portfolios -> Public profile / portfolio / quick resume
```

Public routes:

- `/`
- `/login`
- `/register`
- `/forgot-password`
- `/{username}`
- `/{username}/{pageSlug}`
- `/{username}/{pageSlug}/resume`

Logged-in routes:

- `/dashboard`
- `/profile`
- `/portfolios`
- `/gallery`
- `/templates`
- `/teste-vocacional/app`
- `/settings`

Technical routes still exist for deep links and editor flows:

- `/pages`
- `/pages/{pageId}/editor`
- `/pages/{pageId}/resume`
- `/versions`
- `/resumes`

## Local Setup

```bash
npm install
npm run db:generate
npm run dev
```

The app runs at `http://localhost:3000`.

Useful commands:

```bash
npm run env:check
npm run db:validate
npm run typecheck
npm run lint
npm run test
npm run build
```

## Environment

Copy `.env.example` to `.env.local` or configure equivalent platform variables.

Required minimum variables:

- `DATABASE_URL`
- `DIRECT_URL`
- `AUTH_SECRET`
- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_APP_NAME`
- `STORAGE_PROVIDER`

Optional integrations include S3-compatible image storage and Gemini for vocational-test report generation.

## Documentation

Start here:

- `docs/README.md`
- `docs/current-architecture.md`
- `docs/architecture-checkup-2026-04-27.md`
- `docs/architecture-optimization-slices.md`

Brand and design references:

- `docs/brand-core.md`
- `docs/brand-deck.md`
- `docs/tonal system.md`
- `docs/tipografia-system.md`
