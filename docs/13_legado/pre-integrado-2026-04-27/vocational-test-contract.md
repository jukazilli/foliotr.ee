# Vocational Test Contract

Status: implementation contract  
Last updated: 2026-04-26

## Goal

Bring the standalone professional orientation app into the main FolioTree Next.js product without loading the standalone Vite app at runtime.

The authenticated route `/teste-vocacional/app` must provide a complete test flow:

- collect lightweight context from the user;
- present the vocational questionnaire;
- persist progress and final result for the authenticated user;
- calculate deterministic scores on the server;
- generate an optional final narrative report with Gemini when `GEMINI_API_KEY` is configured.

## Source Material

The standalone source lives at:

`prototipos-legados/orientacao-profissional-app`

Implementation rule:

- copy and adapt the data, scoring and UI logic into the main app;
- do not import or execute the Vite app at runtime;
- use the main app design tokens from `app/globals.css`;
- use `app/api/*` as the production backend surface, per `docs/runtime-architecture-decision.md`.

## Data Contract

The test method version is `vocational-v1`.

`UserProfile`:

- `name`: display name used only for report personalization;
- `moment`: current decision moment;
- `goal`: free-text expectation for the test.

`Answers`:

- object keyed by question id;
- each value must be an integer from 1 to 5;
- completion requires all known questions to be answered.

`TestResult`:

- Big Five score map;
- RIASEC score map and three-letter code;
- motivational archetype score map;
- ranked career-area recommendations;
- strengths;
- attention points;
- confidence score and label;
- deterministic summary;
- completion timestamp.

## Persistence Contract

Prisma model: `VocationalTestSession`.

One user can have multiple sessions. The UI reads the latest updated session.

Persisted fields:

- `userId`;
- `methodVersion`;
- `status`: `draft` or `completed`;
- `currentQuestionIndex`;
- `profile` JSON;
- `answers` JSON;
- `result` JSON;
- `aiReport` text;
- `reportProvider`;
- `reportModel`;
- `reportGeneratedAt`;
- `publicInPortfolio`;
- `publicInResume`;
- `completedAt`.

## API Contract

`GET /api/vocational-test/session`

- requires authentication;
- returns the latest session for the current user, or `null`.
- returns the latest completed sessions for profile consultation and publication settings.

`PUT /api/vocational-test/session`

- requires authentication;
- creates or updates the current draft session;
- accepts profile, answers and current question index;
- returns the saved session.

`POST /api/vocational-test/complete`

- requires authentication;
- validates complete answers;
- calculates the deterministic result server-side;
- saves a completed session;
- attempts Gemini report generation when `GEMINI_API_KEY` exists;
- returns deterministic result plus optional `aiReport`.

`PATCH /api/vocational-test/sessions/[sessionId]`

- requires authentication;
- updates `publicInPortfolio` and/or `publicInResume`;
- only completed sessions owned by the current user can be changed.

## Canonical Output Contract

The public behavioral analysis section is controlled by the session publication flags.

- Portfolio section uses `publicInPortfolio`.
- Resume section uses `publicInResume`.
- The generated charts are Big Five and RIASEC only.
- The archetype appears as narrative identity, not as a chart/code.
- The section can be hidden in templates by hiding the canonical `portfolio.behavioral-analysis` block.

## Gemini Contract

The Gemini request must run only on the server.

Required env var:

- `GEMINI_API_KEY`

Optional env var:

- `GEMINI_MODEL`, default `gemini-2.0-flash`

If Gemini is not configured or fails, the API still returns the deterministic result and stores the session without `aiReport`.

## Checklist

- [x] Documentation source checked: `docs/README.md`, `docs/tonal system.md`, `docs/runtime-architecture-decision.md`.
- [x] Runtime rule defined: Next API routes, no runtime import from standalone app.
- [x] Persistence contract defined before implementation.
- [x] Prisma model and migration added.
- [x] Server scoring and Gemini integration added.
- [x] Authenticated UI implemented with global color tokens.
- [x] Profile history and publication flags added.
- [x] Canonical portfolio/resume behavioral section added.
- [x] Validation commands executed.
