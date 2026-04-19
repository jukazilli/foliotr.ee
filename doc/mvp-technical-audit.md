# FolioTree MVP Technical Audit

Status: working audit
Date: 2026-04-18
Branch: codex/foliotree-transplante-design-system

## 1. Scope and Source of Truth

This audit consolidates the current product, codebase, data model, and external visual reference into an executable MVP plan.

Sources reviewed:

- `doc/README.md`
- `doc/brand-core.md`
- `doc/brand-deck.md`
- `doc/tonal system.md`
- `doc/Design System/Brand Core.html`
- `doc/Design System/Tonal System.html`
- `doc/Design System/Typography System.html`
- `package.json`
- `prisma/schema.prisma`
- `auth.ts`
- `middleware.ts`
- `lib/validations.ts`
- `app/` routes and API handlers
- `components/` route support components
- `C:\Users\juliano.pedroso\Downloads\Design System`

Precedence rule:

- Product and brand direction come from `/doc`.
- Public design tokens, color behavior, and typography rules come from `doc/Design System/*.html`, with the current implementation cut using Sora for display, Inter for UI, and IBM Plex Mono for data/meta as required by the product prompt.
- Runtime contracts, auth, routing, and persistence come from the current Next.js and Prisma implementation.
- The Design System is a visual and interaction reference, not a backend, route, or domain contract source.

## 2. Current Technical State

FolioTree is currently a Next.js 14 App Router application at the repository root. The app already has Prisma, PostgreSQL, Neon environment configuration, NextAuth credentials auth, basic protected routing, registration, onboarding, a profile API, and public profile/resume render routes.

The codebase already models much of the intended domain in Prisma:

- user account
- central profile
- experiences
- education
- skills
- projects
- achievements
- links
- proofs
- assets
- versions
- templates
- template block definitions
- pages
- page blocks
- resume configuration

The product UI is only partially connected to the real backend:

- Registration creates `User`, `Profile`, and default `Version`.
- Onboarding updates username and profile headline.
- `GET /api/profile` and `PATCH /api/profile` use real authenticated data.
- Dashboard, profile sections, versions, pages, and resumes still use mostly static UI or mock arrays.
- Public `/{username}` and `/{username}/resume` already read Prisma, but depend on published/default state and still need stronger version/page semantics.

The external Design System is a static React prototype using global browser state, localStorage screen switching, mock data, and non-Next routing. It should be transplanted screen by screen into the real app, preserving backend contracts and authorization.

## 3. Product Summary in Technical Language

### Problem solved

Professionals keep rewriting the same career story across resumes, profiles, portfolios, social links, and opportunity-specific submissions. This produces fragmented data, weak evidence, duplicated work, and slow value perception for recruiters, clients, collaborators, and the professional.

### Differential

FolioTree is not just a resume builder, portfolio builder, Linktree clone, or LinkedIn skin. Its core value is a structured professional identity base that turns one central source of professional evidence into multiple clear outputs.

The strategic contrast remains:

LinkedIn shows. FolioTree proves.

### Domain mental architecture

The domain should be understood as:

`User -> Profile -> Version -> Output`

Where:

- `User` owns authentication and account identity.
- `Profile` is the central professional identity base.
- `Version` selects and adapts parts of the profile for a context.
- `Page` renders a public visual presence from a version.
- `Resume` or `ResumeConfig` renders a recruiter-friendly reading mode from a version.
- `Template` and `TemplateBlock` define the visual structure for pages and future resume layouts.

### Main system objects

- `User`: login identity and account ownership.
- `Profile`: central professional identity base.
- `Experience`: professional history.
- `Project`: concrete work evidence.
- `Education`: education and training.
- `Skill`: capabilities and tools.
- `Achievement` / `Highlight`: accomplishments, awards, outcomes, or strong proof points.
- `Proof`: evidence with metric, context, URL, media, or result.
- `ProfileLink`: professional links.
- `Asset`: uploaded or externally stored media metadata.
- `Version`: context-specific selection and copy override.
- `Page`: public page generated from a version and template.
- `PageBlock`: editable page block instance.
- `Template`: reusable visual/page structure.
- `TemplateBlockDef`: block definitions available inside a template.
- `ResumeConfig`: read/print configuration for a version.
- `PublishState`: publication state for pages and resumes.

## 4. MVP Functional Requirements

### Landing

The landing page must explain FolioTree as living professional evidence, not as a generic builder. It needs a clear CTA, a fast product preview, and copy centered on value perception, proof, versions, pages, and resumes.

MVP acceptance:

- Public route `/` works without auth.
- Primary CTA points to `/register`.
- Secondary CTA points to login or a public example.
- Copy follows brand direction from `brand-core.md` and `brand-deck.md`.

### Login

The login flow must authenticate with email and password using the current credentials provider.

MVP acceptance:

- `/login` validates input.
- Invalid credentials return a generic error.
- Authenticated users are redirected away from auth pages.
- Server-side protected routes reject unauthenticated users.

### Register

Registration must create the minimum viable account structure.

MVP acceptance:

- `/register` creates `User`, `Profile`, and one default `Version` in one transaction.
- Email is unique.
- Password is hashed with bcrypt.
- Errors are normalized enough to avoid leaking internals.
- The user is sent to onboarding or login after success.

### Forgot Password

The MVP can keep a safe placeholder screen only if it does not claim a completed email flow. The production-ready flow needs token creation, expiration, email delivery, and generic responses to avoid user enumeration.

MVP acceptance:

- `/forgot-password` exists.
- Response copy is generic.
- No account existence information is exposed.
- A later phase adds `PasswordResetToken` or reuses a secure auth-provider reset flow.

### Post-login Shell

The authenticated shell must give the product a social/professional platform feel, not a cold ERP dashboard.

MVP acceptance:

- Server-side auth gate remains in `app/(app)/layout.tsx`.
- Onboarding gate remains server-side.
- Navigation clearly exposes profile, versions, pages, resumes, and settings.
- Shell preserves the real route structure while adopting the external Design System's visual hierarchy.

### Profile

Profile is the central source of professional identity and evidence.

MVP acceptance:

- Identity fields are editable first: display name, headline, bio, location, website, public email, pronouns.
- Lists are introduced incrementally: experiences, projects, links, achievements/highlights, proofs.
- Every mutation is authorized by owner on the server.
- Validation uses Zod at API boundaries.

### Versions

Versions adapt the central profile for different contexts without duplicating the whole profile.

MVP acceptance:

- Users can view real versions from the database.
- Users can create, edit, and delete versions they own.
- A version can override headline and bio.
- A version can select experiences, projects, skills, achievements, and later links/proofs.
- Only one default version should exist per profile.

### Pages

Pages are public outputs generated from a version and template.

MVP acceptance:

- Users can create a page from a version and template.
- Users can edit block visibility and basic block config.
- Users can publish and unpublish pages.
- Public routes only render published pages.
- Slugs are validated and collision-safe.

### Resume / Reading Mode

Resume mode is a recruiter-friendly, print-friendly representation of a version.

MVP acceptance:

- A resume view can be generated from a version.
- The current public `/{username}/resume` remains usable as a short-term default route.
- A version-specific route should be added before multiple public resumes are treated as complete.
- Print styles work.
- PDF download can be deferred unless a reliable generation flow is implemented.

### Template Base

Templates define reusable page structures. The first MVP template should be enough to power the Design System's "Portfolio Community" concept.

MVP acceptance:

- Seed at least one active template.
- Seed block definitions for hero, about, projects, experience, achievements/highlights, and contact.
- Build a stable block registry.
- Page block config must be validated before rendering or saving.

## 5. MVP Non-functional Requirements

### Security

- Authorization must exist on the server for every private resource.
- Client-side hiding is not authorization.
- Inputs must be validated at API boundaries.
- Auth errors should avoid user enumeration.
- Logs must not expose secrets, tokens, raw passwords, or database URLs.
- Public routes should expose only published data.
- Uploads must validate file type, size, ownership, and storage key before becoming public.
- Arbitrary HTML must not be rendered without sanitization.

### Performance

- Prefer server components for page-level authenticated data where practical.
- Keep API payloads route-specific instead of returning the entire profile for every screen.
- Public pages should be cacheable once publish invalidation is defined.
- Avoid global browser state as the source of truth.
- Defer image optimization and storage transformations until the asset pipeline exists.

### Accessibility

- Forms need labels, error text, focus states, and keyboard submission.
- Navigation must be semantic and keyboard usable.
- Icon-only buttons need accessible labels.
- Public pages and resumes need semantic headings.
- Color contrast must be checked after the visual transplant.

### Navigation clarity

The core MVP path should be obvious:

`Profile -> Versions -> Pages / Resume`

The UI should explain that the user edits the central base once, then creates context-specific outputs.

### Maintainability

- Keep TypeScript strict.
- Do not use `any` without an explicit local justification.
- Keep view-model mapping close to route/API boundaries.
- Avoid duplicate mock domain state after the real endpoints exist.
- Prefer small route-owned components before introducing broad abstractions.
- Keep tests focused on the phase being changed.

## 6. Recommended Stack

### Frontend

Use the current Next.js 14 App Router application and deploy the frontend on Vercel.

Rationale:

- The repo already uses Next.js App Router.
- Public pages, authenticated pages, API route handlers, and server-side auth fit the current MVP.
- The external Design System can be adopted into this structure without replacing the app.

### Backend

For the MVP, keep backend behavior in Next.js route handlers unless deployment constraints force a split. If a separate backend becomes necessary, host it on Railway or Render and keep Prisma/PostgreSQL contracts stable.

Rationale:

- The current API surface is small.
- Auth and data access are already wired in the Next app.
- A separate backend now would add operational complexity before product flow is complete.

### Database

Use PostgreSQL on Neon with Prisma.

Rationale:

- The schema is already Prisma/PostgreSQL.
- Neon is already configured locally.
- Relational ownership and publication rules fit PostgreSQL well.

### Auth

Continue with NextAuth credentials for the MVP, with careful server-side authorization. OAuth can be deferred.

### Storage

Use an external object store later for assets. Candidate options are Vercel Blob, S3-compatible storage, R2, or Supabase Storage. Until uploads exist, store only validated external URLs or seed/static references.

## 7. Proposed Architecture

### Frontend

- `app/`: route ownership and server/client boundaries.
- `components/app/`: authenticated shell.
- `components/landing/`: landing sections.
- `components/ui/`: generic primitives.
- `components/blocks/`: public page block renderers.
- `components/resume/`: resume/read mode renderers.
- Future `components/ft/`: FolioTree-specific primitives extracted from the Design System when they repeat across screens.

### Backend/API

Use route handlers for MVP:

- `app/api/register/route.ts`
- `app/api/onboarding/route.ts`
- `app/api/profile/route.ts`
- future `app/api/versions/route.ts`
- future `app/api/versions/[id]/route.ts`
- future `app/api/pages/route.ts`
- future `app/api/pages/[id]/route.ts`
- future `app/api/templates/route.ts`
- future `app/api/resumes/[versionId]/route.ts`
- future `app/api/assets/route.ts`

Add shared server helpers only when duplication appears:

- `lib/authz.ts` for owner checks.
- `lib/view-models/` for mapping Prisma records to route-specific UI data.
- `lib/publish.ts` for publication rules.

### Auth

- Keep NextAuth credentials and JWT sessions.
- Keep middleware for broad route protection.
- Keep route-level `auth()` checks in API handlers and server pages.
- Add resource ownership checks to every API route that touches profile-owned data.

### Storage

- Store asset metadata in `Asset`.
- Do not expose raw storage keys unless needed.
- Validate uploads before persisting.
- Keep image upload out of the first visual transplant phase.

### Publication

Publication should be explicit and server-controlled.

MVP can continue with:

- `Page.published`
- `Page.publishedAt`
- `ResumeConfig.published`
- `ResumeConfig.publishedAt`

Recommended next step:

- Add a `PublishState` enum when draft/published/archived semantics matter across pages and resumes.

### Templates

Templates should remain data-driven but not over-abstracted.

MVP pattern:

- `Template` stores template identity.
- `TemplateBlockDef` stores allowed block types and defaults.
- `PageBlock` stores per-page block order, visibility, and config.
- React block components render known block types from a registry.

### Resume mode

Resume should be derived from `Version`, not manually duplicated.

MVP pattern:

- `ResumeConfig` stores layout and section preferences.
- Renderer resolves selected version data.
- Print-friendly view is available before PDF generation.

## 8. Route Map

### Public routes

- `/`: landing.
- `/login`: login.
- `/register`: registration.
- `/forgot-password`: password reset request screen.
- `/[username]`: public default profile/page.
- `/[username]/resume`: current public default resume route.
- Future `/[username]/[pageSlug]`: version/page-specific public page.
- Future `/[username]/[pageSlug]/resume`: version/page-specific resume view if needed.

### Authenticated routes

- `/onboarding`: initial username/headline setup.
- `/dashboard`: post-login home.
- `/profile`: central professional base.
- `/versions`: version list.
- `/versions/new`: create version.
- `/versions/[versionId]`: edit version.
- `/pages`: page list.
- `/pages/[pageId]/editor`: page editor.
- `/templates`: template selection/base.
- `/resumes`: resume list/configuration.
- `/resumes/[versionId]`: version-specific resume config/preview.
- `/settings`: account settings.

### Internal MVP API routes

Existing:

- `/api/auth/[...nextauth]`
- `/api/register`
- `/api/onboarding`
- `/api/profile`

Needed:

- `/api/versions`
- `/api/versions/[id]`
- `/api/pages`
- `/api/pages/[id]`
- `/api/templates`
- `/api/resumes/[versionId]`
- `/api/assets`

## 9. Initial Data Model Plan

### User

Already exists. Owns login identity. Keep email unique and username unique.

### Profile

Already exists. Central base for identity, evidence, and professional data.

### Version

Already exists. Needs API and UI integration. Current selected arrays cover experiences, projects, skills, and achievements.

Gap:

- Add selected links/proofs later if versions must control links and proofs independently.

### Page

Already exists. Needs creation/editor/publish APIs and stronger slug strategy.

Gap:

- Current `slug` is globally unique. MVP can keep this, but user-scoped slug uniqueness is more product-friendly later.

### Resume

Currently represented as `ResumeConfig`. Keep this for MVP unless a separate `Resume` entity becomes necessary.

### Template

Already exists. Needs seed and UI adoption.

### TemplateBlock

Currently represented as `TemplateBlockDef` and `PageBlock`. This is enough for MVP.

### Asset

Already exists. Upload pipeline is not implemented yet.

### Project / Experience

Already exist. They need CRUD APIs and route-specific UI.

### Highlight

Use `Achievement` initially. Add `Highlight` only if the product needs a broader abstraction beyond achievements.

### Proof / Link

Both already exist as separate concepts:

- `Proof` is evidence.
- `ProfileLink` is outbound contact/social/professional link.

### PublishState

Not yet explicit. MVP can continue with booleans, but a later enum is recommended:

- `DRAFT`
- `PUBLISHED`
- `ARCHIVED`

## 10. Short Implementation Phases

### Phase 0: Stabilize current branch

Goal: make the branch safe to iterate.

Work:

- Fix current typecheck issues in `lib/types.ts` and `prisma/seed.ts`.
- Confirm config file changes for Next, Tailwind, and PostCSS are intentional.
- Decide whether untracked `apps/`, `packages/`, and `doc/Design System/` should be tracked, ignored, or removed by the user.
- Normalize obvious mojibake in user-facing Portuguese only if the file encoding/source is confirmed.

Validation:

- `npm run lint`
- `npx tsc --noEmit`
- Registration/login/profile API smoke test.

### Phase 1: Visual foundation transplant

Goal: adopt Design System foundation without changing backend contracts.

Work:

- Extract reusable visual primitives from the external Design System into the real app.
- Keep Next routing, auth, and data flow unchanged.
- Apply foundation to landing and auth screens first.
- Do not introduce global `window.FT_STATE` or localStorage routing.

Validation:

- Landing renders.
- Login/register flows still work.
- No protected route regression.

### Phase 2: Authenticated shell and dashboard

Goal: make the post-login area match the intended platform feel.

Work:

- Update shell structure with Design System hierarchy.
- Preserve server-side auth and onboarding gates.
- Replace dashboard mock copy with real summary from profile/version/page counts.

Validation:

- Unauthenticated users redirect to login.
- Authenticated users reach dashboard.
- Onboarding users redirect correctly.

### Phase 3: Profile real CRUD

Goal: make profile the real central base.

Work:

- Keep identity edit first.
- Add CRUD for experiences, projects, links, achievements, and proofs in small slices.
- Enforce owner checks server-side.

Validation:

- Create/update/delete each implemented section.
- Refresh confirms data is persisted.
- Cross-user access is rejected.

### Phase 4: Versions real flow

Goal: make versions functional.

Work:

- Replace mock versions UI with database data.
- Add create/edit/delete version routes and APIs.
- Add selected item controls for profile data.
- Enforce one default version.

Validation:

- Version list reflects database.
- Version selection changes persist.
- Unauthorized version access is rejected.

### Phase 5: Templates and pages MVP

Goal: let a user create and publish a page from a version.

Work:

- Seed first active template and block definitions.
- Add page creation from version/template.
- Add basic editor for order, visibility, and safe config.
- Add publish/unpublish.

Validation:

- Draft page is private.
- Published page renders publicly.
- Blocks render from real `PageBlock` records.

### Phase 6: Resume/read mode

Goal: produce recruiter-friendly reading output from a version.

Work:

- Connect resume list/configuration to `ResumeConfig`.
- Add version-specific preview route.
- Keep print mode reliable before PDF generation.

Validation:

- Resume renders selected version data.
- Print view is readable.
- Unpublished/private resume rules are respected.

### Phase 7: Public publishing hardening

Goal: make public routes safe and understandable.

Work:

- Add page slug route if needed.
- Ensure only published data is exposed.
- Add metadata and not-found behavior.
- Add cache strategy after publish invalidation is clear.

Validation:

- Public routes do not expose drafts.
- Unknown username/slug returns not found.
- Published pages keep working after deploy-style build.

### Phase 8: Assets and uploads

Goal: add media safely.

Work:

- Choose storage provider.
- Add upload validation.
- Persist `Asset` metadata.
- Connect avatars, banners, project images, and proof images.

Validation:

- Invalid type/size is rejected.
- User cannot attach another user's asset.
- Public image URLs are safe.

### Phase 9: Brand polish pass

Goal: apply color, typography, and tonal system after functional adoption.

Work:

- Use `Tonal System.html`, `Typography System.html`, and brand docs.
- Finalize tokens in the app.
- Audit contrast and layout stability.

Validation:

- Visual QA on desktop and mobile.
- Accessibility checks.
- No regression in auth/profile/version/page flows.

## 11. Main Gaps and Risks

- The Design System prototype is visually useful but not production architecture.
- Several authenticated product screens are still mock-first.
- Typecheck is currently blocked by known issues in local type augmentation and seed data typing.
- `doc/tonal system.md` appears inconsistent with the expected markdown documentation shape in this branch.
- Forgot password is not a real secure reset flow yet.
- Page/resume publication rules are partially modeled but not complete in the UI/API.
- Asset storage exists in schema but not in runtime flow.
- Untracked `apps/`, `packages/`, and `doc/Design System/` need an explicit repository decision before they become part of the architecture.

## 12. Recommended Next Cut

Start with Phase 0.

Reason:

- It reduces branch instability before UI transplantation.
- It gives a clean validation baseline.
- It avoids mixing visual transplant work with type/schema/config uncertainty.

After Phase 0, move to Phase 1 and transplant landing/auth screens first because they have the lowest backend coupling and immediately validate the Design System adoption strategy.
