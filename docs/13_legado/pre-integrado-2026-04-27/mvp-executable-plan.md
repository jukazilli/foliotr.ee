# FolioTree MVP Executable Technical Plan

Status: historical planning audit, superseded by `docs/current-architecture.md` and `docs/architecture-optimization-slices.md`  
Date: 2026-04-18  
Scope: current repository state + `/doc` source of truth

> Historical note: this document remains useful as planning context, but it is not the active architecture or execution contract. Use `docs/current-architecture.md` for the current runtime map and `docs/architecture-optimization-slices.md` for the active optimization plan.

## 0. Sources And Precedence

Sources reviewed:

- `doc/README.md`
- `doc/brand-core.md`
- `doc/brand-deck.md`
- `doc/setup.md`
- `doc/mvp-technical-audit.md`
- `prototipos-legados/design-system-legado/Brand Core.html`
- `prototipos-legados/design-system-legado/Tonal System.html`
- `prototipos-legados/design-system-legado/Typography System.html`
- `package.json`
- `prisma/schema.prisma`
- `prisma/seed.ts`
- `auth.ts`
- `middleware.ts`
- `lib/validations.ts`
- `lib/security/*`
- `lib/auth/password-reset.ts`
- `lib/storage/policy.ts`
- `app/` routes and route handlers
- `components/` route support components
- `tests/`

Precedence rule:

1. Product and brand meaning come from `/doc`.
2. Visual direction and public UI rules come from `prototipos-legados/design-system-legado/*.html`, with the current implementation rule of Sora for display, Inter for UI, and IBM Plex Mono for data/meta.
3. Runtime truth comes from the current Next.js, Prisma, route handlers, middleware, and tests.
4. The Design System prototype is a visual/interaction reference, not a backend, routing, or persistence contract.

Validation baseline observed during this audit:

- `npm run typecheck`: passing
- `npm run test`: passing, 5 files / 14 tests
- `npm run lint`: passing
- `npm run format:check`: passing

Important repository note:

- The worktree is already dirty with many modified and untracked files. Treat the current filesystem as the observable working state until the branch is cleaned or committed.

## 1. Product Summary In Technical Language

### Problem Resolved

Professionals maintain fragmented career evidence across resumes, profiles, portfolios, social links, messages, and opportunity-specific submissions. This creates duplicated rewriting, weak proof, inconsistent narratives, and slow value perception for recruiters, clients, collaborators, and the professional.

FolioTree solves this by creating a structured professional identity base that can be reused to generate multiple outputs.

### Differential

FolioTree is not a resume builder, not a portfolio-only tool, not a Linktree clone, and not a LinkedIn skin.

Its differential is:

- a central professional identity base
- structured evidence instead of only presence
- contextual versions for different opportunities
- public pages and recruiter-friendly reading outputs generated from the same source
- expressive but structured presentation

Core strategic contrast:

`LinkedIn shows. FolioTree proves.`

### Domain Mental Architecture

The MVP domain should be understood as:

`User -> Profile -> Version -> Output`

Where:

- `User` owns authentication and account identity.
- `Profile` is the central source of professional truth.
- `Version` adapts profile data to a specific context.
- `Page` renders a public visual output from a version and template.
- `ResumeConfig` renders a recruiter-friendly reading mode from a version.
- `Template` and `TemplateBlockDef` define reusable output structure.

### Main System Objects

- `User`: account, email, password hash, username.
- `Profile`: central identity and professional data base.
- `Experience`: professional history.
- `Project`: concrete work evidence.
- `Education`: education and certifications.
- `Skill`: capabilities and tools.
- `Achievement` / `Highlight`: strong accomplishments and outcomes. MVP should use `Achievement` as the implementation object and `Highlight` as product language unless a separate model becomes necessary.
- `Proof`: evidence with title, metric, URL, media, tags, and context.
- `ProfileLink`: professional/social/contact links.
- `Asset`: metadata for uploaded or externally stored media.
- `Version`: context-specific adaptation of a profile.
- `Page`: public page generated from a version/template.
- `PageBlock`: block instance for a page.
- `Template`: reusable page/template identity.
- `TemplateBlockDef`: allowed block definitions for a template.
- `ResumeConfig`: reading/print configuration for a version.
- `PublishState`: product concept for draft/published/archived semantics. Not yet implemented as enum.

## 2. Current Technical State

### Already In Place

- Next.js App Router app at repository root.
- TypeScript strict mode.
- Prisma schema for the intended domain.
- PostgreSQL/Neon environment shape through `DATABASE_URL` and `DIRECT_URL`.
- NextAuth credentials auth using JWT sessions.
- Password hashing with bcrypt.
- Register route creating `User`, `Profile`, and default `Version`.
- Login route through NextAuth credentials provider.
- Forgot/reset password route handlers with opaque token generation, token hashing, expiration, and no user enumeration in the forgot response.
- Middleware protecting authenticated route groups by session cookie.
- Server-side auth gate in `app/(app)/layout.tsx`.
- Onboarding route/API updates username/headline and gates app access.
- `GET /api/profile` and `PATCH /api/profile` use real authenticated data.
- Public `/{username}` reads Prisma profile/version/page data.
- Public `/{username}/resume` reads Prisma profile/default version/resume config.
- Template and template block seed exists in `prisma/seed.ts`.
- Storage policy helper exists, but upload runtime is not implemented.
- Rate-limit helper exists, but it is process-local.
- Tests exist for env validation, rate-limit, storage policy, token foundation, and reset routes.

### Still Mock Or Incomplete

- Dashboard progress is mock-based.
- Authenticated profile screen is mostly UI shell and empty section cards, not full CRUD.
- Versions screen is mock-based.
- Pages screen is mock-based.
- Resumes screen is mock-based and references PDF generation that is not implemented.
- Public page route supports default published page fallback, but version/page-specific public routes do not exist.
- Page creation/editor/publish APIs do not exist.
- Version CRUD APIs do not exist.
- Resume configuration APIs do not exist.
- Upload API and storage provider integration do not exist.
- `PublishState` enum does not exist; publication is represented with booleans.
- Some Portuguese strings in code output display mojibake in terminal reads and should be normalized before copy/UI hardening.
- Some block types in `components/blocks/index.ts` are placeholders mapped to unrelated block components.

## 3. MVP Functional Requirements

### Landing

Acceptance:

- Route `/` is public and does not require auth.
- First fold explains the product quickly.
- Primary CTA goes to `/register`.
- Secondary CTA goes to `/login` or a safe public example once examples exist.
- Copy follows `brand-core.md` and `brand-deck.md`.
- Visual system follows Design System sources:
  - Sora display
  - Inter UI
  - IBM Plex Mono for data/meta
  - Blue 500 + Lime 500 as expressive landing pair
  - no heavy dark background dominating the experience

Current status:

- Implemented as public route.
- Needs future public example once real published sample data exists.

### Login

Acceptance:

- `/login` validates email and password client-side and server-side.
- Invalid credentials produce a generic error.
- Login uses NextAuth credentials provider.
- Authenticated users are redirected away from auth pages.
- Protected routes have server-side enforcement.
- Auth route has rate limiting.

Current status:

- Functional through NextAuth credentials.
- Rate-limit exists in `auth.ts`.
- Middleware redirects auth/protected pages.

### Register

Acceptance:

- `/register` validates name, email, password, and password confirmation.
- Registration creates `User`, `Profile`, and default `Version` in one transaction.
- Password is hashed with bcrypt.
- Unique email conflicts are normalized and do not leak internals.
- Post-register path sends the user to onboarding or login.
- Route has rate limiting.

Current status:

- Functional in `app/api/register/route.ts`.
- Uses bcrypt and Prisma transaction.

### Forgot Password

Acceptance:

- `/forgot-password` exists with complete UI.
- API response is generic and does not expose account existence.
- Reset token is opaque, hashed at rest, expirable, and one-time use.
- Reset request route is rate limited.
- Reset completion route validates token and password server-side.
- Email delivery can be a documented no-op for MVP only if the UI does not claim production email delivery as complete.

Current status:

- UI and backend foundation exist.
- Token creation/reset route exist.
- Email delivery hook is currently no-op and must be wired before production.

### Shell Pós-login

Acceptance:

- `app/(app)/layout.tsx` enforces auth server-side.
- Onboarding gate remains server-side.
- Navigation exposes Dashboard, Profile, Versions, Pages, Resumes, Settings.
- Shell feels like a social/professional platform, not a cold ERP/dashboard.
- Shell reads enough real data to guide the user.

Current status:

- Auth and onboarding gates exist.
- Sidebar/Header exist.
- Dashboard still uses mock progress.

### Perfil

Acceptance:

- Profile is the central editable base.
- Identity fields first:
  - display name
  - headline
  - bio
  - location
  - website
  - public email
  - pronouns
  - avatar/banner later via Asset
- CRUD slices for:
  - experiences
  - education
  - skills
  - projects
  - achievements/highlights
  - proofs
  - links
- Every mutation enforces owner checks on the server.
- Inputs use Zod at API boundaries.

Current status:

- `GET/PATCH /api/profile` supports identity-level profile fields.
- Section CRUD is not implemented yet.

### Versões

Acceptance:

- Users can list versions from the database.
- Users can create/edit/delete versions they own.
- Users can set one default version.
- Version can override headline/bio.
- Version can select experiences, projects, skills, achievements.
- Later: decide whether versions also select links/proofs.

Current status:

- Data model exists.
- Default version is created during registration.
- Authenticated versions UI is mock-based.
- Version APIs are missing.

### Páginas

Acceptance:

- Users can create a page from a version and active template.
- Page gets a validated collision-safe slug.
- Page has `PageBlock` instances based on template block definitions.
- Users can edit block order, visibility, and safe config.
- Users can publish/unpublish pages.
- Public routes render only published pages.
- Unknown or unpublished routes return not found.

Current status:

- Data model exists.
- Public default username route can render a published default page if one exists.
- Authenticated pages UI is mock-based.
- Page APIs/editor are missing.

### Currículo / Modo Leitura

Acceptance:

- Resume/read mode derives from `Version`, not duplicated content.
- `ResumeConfig` stores layout/section preferences.
- Public/private publication rules are explicit.
- Print mode works before PDF export is attempted.
- PDF generation is deferred unless implemented reliably.

Current status:

- `ResumeConfig` model exists.
- `/{username}/resume` renders default version/profile data.
- Authenticated resumes UI is mock-based.
- PDF generation is not implemented.

### Base Do Sistema De Templates

Acceptance:

- At least one active template is seeded.
- Template block definitions include hero, about, experience, projects, achievements/highlights, proof, links/contact.
- Block registry maps every supported `blockType` to a dedicated safe renderer.
- Page block configs are validated before save/render.
- No arbitrary HTML rendering without sanitization.

Current status:

- `Template`, `TemplateBlockDef`, `PageBlock` models exist.
- Seed creates `classic` template and block definitions.
- Registry exists but some block types are placeholders.
- Config validation for block save/render is not complete.

## 4. Non-functional Requirements

### Security

Required:

- Auth server-side for every private page/API.
- Resource ownership checks server-side for every profile-owned mutation.
- Zod validation at route/API boundaries.
- Generic auth/reset errors to prevent user enumeration.
- bcrypt password hashing.
- Password reset tokens hashed at rest, expirable, one-time use.
- Rate limit on auth-sensitive routes.
- No secrets/tokens/raw payloads in logs.
- Public routes expose only published data.
- Uploads validate type, size, ownership, and storage key.
- No arbitrary HTML rendering without sanitization.

Current gaps:

- Rate limiter is process-local and must move to Redis/KV for multi-instance production.
- Section CRUD/page/version APIs still need owner checks.
- Email delivery for password reset is not connected.

### Performance

Required:

- Prefer server components for page-level data loads.
- Keep API payloads route-specific.
- Avoid returning the entire profile for small UI needs.
- Public pages should be cacheable after publish invalidation exists.
- Avoid global browser state as source of truth.
- Avoid image transformation/storage work until asset pipeline exists.

Current gaps:

- `GET /api/profile` returns a broad profile graph.
- Public caching/invalidation not defined.

### Accessibility

Required:

- Semantic headings and landmarks.
- Forms with labels, errors, loading states, keyboard submission.
- Icon-only buttons need accessible labels.
- Public pages and resumes need semantic content order.
- Contrast must be checked against Tonal System pairs.
- Focus states must remain visible.

Current gaps:

- Some icon buttons in authenticated screens need explicit aria labels before production.
- Block renderers need a semantic heading audit.

### Navigation Clarity

Required:

- Core path should be obvious:
  `Profile -> Versions -> Pages / Resume`
- User should understand that editing the central base feeds every output.
- Empty states should point to the next smallest useful action.

Current gaps:

- Dashboard progress is mock-based.
- Pages/versions/resumes empty states are not connected to real creation flows.

### Maintainability

Required:

- Keep TypeScript strict.
- No `any` without explicit local justification.
- Keep route-owned components until repetition is real.
- Keep validation and authorization near API boundaries.
- Avoid large abstractions before APIs stabilize.
- Keep tests focused on every completed slice.
- Do not mix Design System prototype global state into the real app.

Current gaps:

- Some UI copy and route comments show mojibake in terminal output.
- Several mock arrays need removal once real APIs exist.

## 5. Recommended Stack

Respecting current decisions and requested deployment direction:

### Frontend

- Next.js App Router
- React
- TypeScript strict
- Tailwind CSS
- Vercel for frontend deployment

Rationale:

- The repository already uses Next.js App Router.
- Public pages, auth pages, server-rendered routes, and visual system are already in this structure.

### Backend

Target stack:

- Node/TypeScript backend on Railway or Render
- Prisma
- PostgreSQL on Neon
- Shared Zod/domain contracts where useful

MVP transition rule:

- Current API behavior lives in Next.js route handlers.
- Do not split into Railway/Render backend until the first backend-only boundary is clear, such as assets, page publishing jobs, emails, or dedicated API scaling.
- When split happens, preserve Prisma models and route contracts; migrate route handlers gradually.

### Database

- PostgreSQL on Neon
- Prisma Client and Prisma Migrate

### Auth

- Current MVP: NextAuth credentials with JWT sessions.
- Password hashing: bcrypt.
- OAuth can be deferred.
- Production hardening requires shared rate-limit storage and email provider integration.

### Storage

- Current: storage policy helper only.
- MVP provider candidates:
  - Vercel Blob if frontend-centric
  - S3-compatible provider/R2 if backend service controls uploads
  - Supabase Storage only if project wants its auth/storage ecosystem later
- Store only metadata in `Asset`.

## 6. Proposed Architecture

### Frontend

Ownership:

- `app/`: route ownership, server/client boundaries.
- `components/landing/`: public landing.
- `components/brand/`: brand primitives.
- `components/ui/`: generic primitives.
- `components/app/`: authenticated shell.
- `components/blocks/`: public page block renderers.
- `components/resume/`: resume/read mode renderer.

Rules:

- Keep public/auth pages polished and lightweight.
- Keep authenticated pages server-gated.
- Replace mock screens with route-owned real components slice by slice.

### Backend/API

Current route handlers:

- `POST /api/register`
- `POST /api/forgot-password`
- `POST /api/reset-password`
- `POST/PATCH /api/onboarding`
- `GET/PATCH /api/profile`
- `GET/POST /api/auth/[...nextauth]`

Needed MVP route handlers:

- `GET/POST /api/profile/experiences`
- `PATCH/DELETE /api/profile/experiences/[id]`
- equivalent section APIs for projects, links, achievements, proofs, skills, education
- `GET/POST /api/versions`
- `GET/PATCH/DELETE /api/versions/[id]`
- `POST /api/versions/[id]/default`
- `GET /api/templates`
- `POST /api/pages`
- `GET/PATCH/DELETE /api/pages/[id]`
- `POST /api/pages/[id]/publish`
- `POST /api/pages/[id]/unpublish`
- `GET/PATCH /api/resumes/[versionId]`
- `POST /api/assets` when storage is selected

### Auth

Rules:

- Keep NextAuth credentials for MVP.
- Keep middleware as broad route guard.
- Keep route-level `auth()` checks because middleware is not authorization.
- Use `lib/security/authz.ts` for owner checks.
- Normalize errors through `lib/server/api.ts`.

### Storage

Rules:

- Do not implement uploads until provider is selected.
- Validate file type and size before upload.
- Store `Asset` rows after successful upload only.
- Never expose raw private storage keys in public payloads.

### Publication

Rules:

- Public access must be explicit.
- MVP can keep:
  - `Page.published`
  - `Page.publishedAt`
  - `ResumeConfig.published`
  - `ResumeConfig.publishedAt`
- Add `PublishState` enum when draft/published/archived semantics are needed across multiple outputs.

### Templates

Rules:

- Keep data-driven templates but render only known block types.
- Use `TemplateBlockDef` as allowed block source.
- Validate `PageBlock.config` against per-block schemas before save.
- Avoid arbitrary HTML.

### Modo Currículo

Rules:

- Resume is derived from `Version`.
- `ResumeConfig` stores section/layout preferences only.
- Print-friendly view is MVP.
- PDF export comes after print view and data selection are stable.

## 7. Route Map

### Public Routes

Existing:

- `/`
- `/login`
- `/register`
- `/forgot-password`
- `/reset-password`
- `/[username]`
- `/[username]/resume`

Needed:

- `/[username]/[pageSlug]` for version/page-specific public pages.
- Optional `/[username]/[pageSlug]/resume` only if product requires page-specific resume links.

### Authenticated Routes

Existing:

- `/onboarding`
- `/dashboard`
- `/profile`
- `/versions`
- `/pages`
- `/resumes`
- `/settings`

Needed:

- `/versions/new`
- `/versions/[versionId]`
- `/pages/new`
- `/pages/[pageId]/editor`
- `/resumes/[versionId]`
- optional `/templates` if template selection becomes a distinct workflow

### Internal MVP APIs

Existing:

- `/api/auth/[...nextauth]`
- `/api/register`
- `/api/forgot-password`
- `/api/reset-password`
- `/api/onboarding`
- `/api/profile`

Needed:

- `/api/profile/*` section CRUD
- `/api/versions`
- `/api/versions/[id]`
- `/api/pages`
- `/api/pages/[id]`
- `/api/pages/[id]/publish`
- `/api/pages/[id]/unpublish`
- `/api/templates`
- `/api/resumes/[versionId]`
- `/api/assets`

## 8. Initial Data Model Plan

### User

Exists.

Use for:

- auth identity
- email
- password hash
- username

Gap:

- Decide account deletion/export later, outside MVP.

### Profile

Exists.

Use for:

- central identity base
- owner root for experiences/projects/proofs/links/assets/versions

Gap:

- CRUD APIs for child sections.

### Version

Exists.

Use for:

- context-specific profile adaptation
- custom headline/bio
- selected experiences/projects/skills/achievements

Gap:

- Enforce exactly one default version per profile in server logic.
- Decide whether selected links/proofs belong in MVP.

### Page

Exists.

Use for:

- public output from version + template
- slug/title/published status

Gap:

- Global unique `slug` exists. Product may prefer user-scoped slugs later.

### Resume

Implemented as `ResumeConfig`.

Use for:

- version-specific reading/print settings

Gap:

- Do not add a separate `Resume` table unless multiple independent resume objects per version become required.

### Template

Exists.

Use for:

- reusable output identity
- active/inactive template listing

Gap:

- Template picker UI/API.

### TemplateBlock

Implemented as:

- `TemplateBlockDef`: allowed block definitions
- `PageBlock`: per-page block instance

Gap:

- Per-block config schemas and dedicated renderers for every block type.

### Asset

Exists.

Use for:

- metadata for uploaded media

Gap:

- Upload runtime and provider integration.

### Project / Experience

Exist.

Use for:

- concrete work evidence
- professional history

Gap:

- CRUD APIs and UI editors.

### Highlight

Do not add a new model for MVP.

Use:

- `Achievement` as the storage model.
- `Highlight` as product language when speaking about stronger achievements.

Add separate `Highlight` only if achievements and highlights diverge operationally.

### Proof / Link

Both exist.

Use:

- `Proof`: cases, metrics, outcomes, URLs/media.
- `ProfileLink`: outbound professional/contact links.

Gap:

- CRUD APIs and inclusion in version selection.

### PublishState

Not implemented.

MVP approach:

- Keep booleans on `Page` and `ResumeConfig`.

Later approach:

- Add enum `DRAFT | PUBLISHED | ARCHIVED` when page/resume lifecycle requires common logic.

## 9. Implementation Order By Short Phases

### Phase 0: Branch Hygiene And Audit Close

Goal:

- Make the current state safe to build on.

Work:

- Decide what to do with untracked `apps/`, `packages/`, and generated artifacts.
- Confirm deleted config files are intentionally replaced by `.mjs/.js` versions.
- Normalize mojibake in user-facing code strings touched by MVP flows.
- Keep `npm run check` green.

Validation:

- `npm run format:check`
- `npm run typecheck`
- `npm run lint`
- `npm run test`

Exit criteria:

- Branch state is explainable and ready for feature slices.

### Phase 1: Real Dashboard Summary

Goal:

- Replace mock dashboard progress with real profile/version/page counts.

Work:

- Query profile completion server-side.
- Count versions.
- Count published/draft pages.
- Show next action based on real missing data.

Validation:

- New user sees "complete profile".
- User with version sees correct step.
- No auth bypass.

Exit criteria:

- Dashboard no longer depends on `mockProgress`.

### Phase 2: Profile Identity Editor

Goal:

- Make the central profile base editable before child CRUD.

Work:

- Build form for displayName, headline, bio, location, pronouns, websiteUrl, publicEmail.
- Use existing `PATCH /api/profile`.
- Keep server validation with `profileSchema`.
- Add focused tests for validation and auth.

Validation:

- Save persists.
- Refresh shows saved values.
- Unauthenticated request is rejected.

Exit criteria:

- Profile identity fields are real and stable.

### Phase 3: Profile Section CRUD, One Slice At A Time

Goal:

- Add core professional evidence incrementally.

Order:

1. Links
2. Experiences
3. Projects
4. Skills
5. Achievements
6. Proofs
7. Education

Work per slice:

- Add Zod schema if missing.
- Add API route(s).
- Enforce owner checks.
- Add UI list/form/delete.
- Add tests.

Validation per slice:

- Create/update/delete persists.
- Cross-user access is rejected.
- Invalid input is rejected.

Exit criteria:

- Profile has real data feeding outputs.

### Phase 4: Versions API And UI

Goal:

- Make versions real.

Work:

- Implement list/create/edit/delete.
- Implement set default.
- Use selected ID arrays safely.
- Add UI to choose profile items for a version.

Validation:

- Version list reads DB.
- Version creation persists.
- Only one default remains.
- Unauthorized access is rejected.

Exit criteria:

- Versions can adapt profile data for outputs.

### Phase 5: Template Listing And Page Creation

Goal:

- Create a page from a version/template.

Work:

- Add `GET /api/templates`.
- Add `POST /api/pages`.
- Generate `PageBlock` instances from `TemplateBlockDef`.
- Validate slug.
- Create `/pages/new`.

Validation:

- Active template appears.
- Page draft is created.
- Blocks are created in expected order.

Exit criteria:

- User can create a draft page from real data.

### Phase 6: Page Editor And Publish Controls

Goal:

- Make pages publishable with safe block config.

Work:

- Add editor route.
- Add APIs for title/slug, block visibility/order/config.
- Add publish/unpublish endpoints.
- Add per-block config validation.

Validation:

- Draft page is private.
- Published page appears publicly.
- Unpublish hides page.
- Invalid config is rejected.

Exit criteria:

- Page MVP is usable end to end.

### Phase 7: Public Version/Page Routes

Goal:

- Make public outputs addressable and safe.

Work:

- Add `/[username]/[pageSlug]`.
- Ensure only published pages render.
- Add metadata and not-found states.
- Keep `/{username}` as default profile/page fallback.

Validation:

- Unknown user returns not found.
- Draft page returns not found.
- Published page renders correct version.

Exit criteria:

- Public page sharing is production-shaped.

### Phase 8: Resume Config And Print Mode

Goal:

- Make recruiter-friendly reading mode real.

Work:

- Add `/resumes/[versionId]`.
- Add `GET/PATCH /api/resumes/[versionId]`.
- Connect sections/layout/showLinks/showPhoto/accentColor.
- Keep print view stable.
- Do not implement PDF until print is correct.

Validation:

- Resume reflects selected version data.
- Print view is readable.
- Publication rules are explicit.

Exit criteria:

- Resume/read mode MVP works without fake PDF claims.

### Phase 9: Storage And Assets

Goal:

- Add images safely.

Work:

- Choose provider.
- Add upload API.
- Validate type/size.
- Persist `Asset`.
- Connect avatar/banner/project/proof images.

Validation:

- Invalid file rejected.
- User cannot attach another user's asset.
- Public image URLs are safe.

Exit criteria:

- Media can be used without breaking security model.

### Phase 10: Backend Deployment Boundary

Goal:

- Move backend responsibility to Railway or Render only after contracts are stable.

Work:

- Decide if route handlers remain as BFF or move to a separate service.
- If splitting, create backend service with Prisma and shared validation contracts.
- Keep frontend on Vercel.
- Keep Neon as database.

Validation:

- Frontend calls backend through stable env URL.
- Auth/session strategy remains coherent.
- CI/deploy checks run for both services.

Exit criteria:

- Deployment shape matches target stack without premature complexity.

## 10. Main Gaps And Risks

- Authenticated product screens are still mock-first in dashboard, versions, pages, and resumes.
- Profile child CRUD is missing.
- Version/page/resume APIs are missing.
- Email delivery is not wired for password reset.
- Rate limiting is process-local.
- Public publishing rules are partially modeled but not fully routed.
- Block registry has placeholders.
- Storage runtime is not implemented.
- Some user-facing strings need encoding cleanup.
- `PublishState` remains a concept, not an implemented enum.
- Worktree hygiene needs explicit owner decision before broader implementation.

## 11. Recommended Next Cut

Start with Phase 0, then Phase 1.

Reason:

- The validation baseline is already green.
- The worktree has many existing changes and needs a stable handoff point.
- Dashboard real summary is low-risk and immediately removes mock state from the authenticated product.
- Profile identity editor then creates the foundation for every later output.

Do not start with page editor, template abstractions, uploads, or backend split. Those depend on profile and version data being real first.
