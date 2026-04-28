# Runtime Architecture Decision

Status: approved for current MVP  
Version: v0.1.0  
Last updated: 2026-04-19

## Purpose

This document records the current FolioTree runtime architecture decision after the design transplant was merged into `main`.

It exists to avoid ambiguity between two possible deployment models:

- Next.js fullstack on Vercel
- Vercel frontend plus a separate Render API

## Current Decision

FolioTree will continue, for the current MVP, as a fullstack Next.js application deployed on Vercel.

The active runtime model is:

```text
Browser -> Vercel Next.js -> app/api/* -> Prisma -> PostgreSQL
```

The currently inactive alternative is:

```text
Browser -> Vercel frontend -> Render API -> Prisma -> PostgreSQL
```

At this point, `https://foliotree-web.onrender.com` is not the active API dependency for the production web app.

## What This Means In Code

The production web app calls local Next.js API routes such as:

- `/api/register`
- `/api/auth/[...nextauth]`
- `/api/profile`
- `/api/pages/...`
- `/api/templates`
- `/api/versions`
- `/api/assets`

These routes live in `app/api/*` and run inside the Vercel deployment.

They access persistence directly through Prisma, using server-side environment variables:

- `DATABASE_URL`
- `DIRECT_URL`
- `AUTH_SECRET`
- storage-related variables when uploads are enabled

Client-side code should keep using relative API calls, for example:

```ts
fetch("/api/register", ...)
```

It should not introduce a Render base URL unless the architecture decision is formally reopened.

## Why This Was Adopted

The fullstack Vercel model was adopted because it is the simplest stable architecture for the current product stage.

The current MVP benefits more from reducing operational complexity than from separating frontend and backend prematurely.

Main reasons:

- The current codebase already consolidates routes, auth, product UI, and API handlers in a single Next.js app.
- Authentication is simpler when login, cookies, session handling, protected UI, and API routes share one origin.
- Relative API calls avoid CORS, cross-domain cookie handling, and duplicated environment configuration.
- There is one primary deploy path for the MVP instead of coordinating Vercel and Render deploys.
- The current backend workload is request/response CRUD, which fits Vercel serverless functions well enough.
- The team can move faster on product closure: onboarding, templates, profile editing, publishing, auth, storage, and UX validation.

## Operational Requirements

For this architecture to work, Vercel production must have the required environment variables configured.

Minimum production variables:

- `DATABASE_URL`
- `DIRECT_URL`
- `AUTH_SECRET`
- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_APP_NAME`
- `STORAGE_PROVIDER`

When using Prisma on Vercel, the build must generate the Prisma Client during the build process.

The current required build command is:

```text
npm run build
```

And the `build` script must include:

```text
prisma generate && next build
```

Without this, Vercel dependency caching can deploy an outdated Prisma Client and cause runtime 500 errors in routes such as `/api/register`.

## Advantages Of The Current Model

- Fewer moving parts.
- Fewer production failure points.
- Easier auth and session handling.
- Easier local-to-production parity.
- Faster MVP iteration.
- Simpler deployment ownership.
- No CORS layer between frontend and backend.
- No duplicated API contracts between a separate frontend app and a separate backend service.

## Tradeoffs

The current model intentionally accepts some coupling.

Known tradeoffs:

- API routes are coupled to the Next.js application.
- Long-running jobs are not ideal inside the Vercel request lifecycle.
- Background workers, queues, and persistent processes may need a separate runtime later.
- A future mobile app or public API may benefit from a backend service with a more explicit external contract.
- Deploying frontend and backend changes happens as one application release.

These tradeoffs are acceptable for the current MVP because the product still needs speed, clarity, and fewer integration surfaces.

## Render API Cut Point

Render should be reconsidered only when at least one clear trigger below becomes true.

Adopt or reintroduce a Render API when:

- FolioTree needs a public API consumed by clients outside the web app.
- A mobile app needs to consume the same backend independently from the Next.js web runtime.
- The product needs long-running jobs, workers, queues, scheduled processing, or heavy async workflows that do not fit Vercel functions.
- The product needs WebSockets or persistent server processes.
- Serverless cold starts, connection pooling, execution limits, or function duration become measurable production blockers.
- Multiple frontends need a stable backend contract independent from Next.js route handlers.
- The backend team needs an independent release cycle from the web app.
- Compliance, observability, or infrastructure requirements demand a separate backend runtime.

Do not move to Render only because a Render URL exists.

The migration should be based on an actual product or runtime constraint.

## Migration Rule If The Cut Point Is Reached

If the project adopts Render API later, the migration should be explicit and controlled.

Required steps:

1. Define the API contract that Render owns.
2. Decide the auth strategy for cross-origin requests.
3. Add a server/client environment variable such as `NEXT_PUBLIC_API_URL` only after the contract exists.
4. Replace relative calls like `/api/register` only where the Render API owns the endpoint.
5. Keep or remove Next.js `app/api/*` routes intentionally; do not leave duplicate live paths without ownership.
6. Configure CORS, cookies, tokens, and CSRF deliberately.
7. Add deploy validation for both Vercel and Render.
8. Document the new architecture in this file and update `docs/README.md`.

## Current Recommendation

Keep the current Vercel fullstack architecture through the MVP closure phase.

Revisit Render only when one of the defined cut points is reached with evidence from product requirements or production behavior.
