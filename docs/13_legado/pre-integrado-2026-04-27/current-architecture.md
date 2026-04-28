# Current Architecture

Status: active source of truth  
Version: v0.2.0  
Last updated: 2026-04-27

## Summary

FolioTree is currently a fullstack Next.js application running from the repository root.

```text
Browser
  -> Next.js App Router
  -> Server Components / Server Actions / app/api/*
  -> NextAuth
  -> Prisma
  -> PostgreSQL
```

This document supersedes old MVP plans that described a pnpm monorepo, separate Fastify API, Clerk auth, or `/app/*` route structure.

## Active Runtime

- Web framework: Next.js App Router.
- API surface: `app/api/*`.
- Auth: NextAuth with credentials and Prisma adapter.
- Database access: Prisma.
- Database: PostgreSQL through `DATABASE_URL` and `DIRECT_URL`.
- Storage: disabled, local, or S3-compatible provider depending on env.
- AI integration: Gemini is optional and used for vocational-test report generation.

## Active Product Model

```text
Profile base -> Version -> Page / ResumeConfig -> Public output
```

Product language:

- Profile base: the user's canonical professional data.
- Portfolio: the public web page for a specific context or opportunity.
- Curriculo: the quicker, more objective reading mode associated with a portfolio.
- Version: an internal variation of selected profile data.
- Page: the technical/editorial entity behind a portfolio.
- Reviews: public product concept currently backed by the `Proof` model.

## Main Routes

Public:

- `/`
- `/login`
- `/register`
- `/forgot-password`
- `/{username}`
- `/{username}/{pageSlug}`
- `/{username}/{pageSlug}/resume`

Authenticated product routes:

- `/dashboard`
- `/profile`
- `/portfolios`
- `/gallery`
- `/templates`
- `/teste-vocacional/app`
- `/settings`

Authenticated technical/editor routes:

- `/pages`
- `/pages/{pageId}/editor`
- `/pages/{pageId}/resume`
- `/versions`
- `/resumes`

## Authorization Model

Middleware is a user-experience gate for logged-in app routes. It checks for known auth session cookies and redirects anonymous users to `/login`.

Middleware is not the security boundary for data access.

Server pages, server actions and API handlers must still validate the session with `auth()` or shared helpers such as `getAppViewer`, `getAppShellViewer`, `requireSessionUser`, and ownership-aware domain functions.

## Build And Validation

The build script generates Prisma Client before compiling Next.js:

```text
prisma generate && next build
```

Recommended validation for product changes:

```bash
npm run env:check
npm run db:validate
npm run typecheck
npm run lint
npm run test
```

## Historical Documents

The following documents are useful historical context but are not the active architecture contract:

- `docs/mvp-architecture.md`
- `docs/mvp-executable-plan.md`
- `docs/mvp-technical-audit.md`
- `prototipos-legados/`

Use `docs/runtime-architecture-decision.md` for the runtime decision, `docs/documentation-governance.md` for document precedence, and this file for the current code-level architecture map.
