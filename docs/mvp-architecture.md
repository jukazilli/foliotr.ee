# FolioTree MVP Architecture

Status: implemented foundation  
Version: v0.1.0  
Last updated: 2026-04-18

## Purpose

This document records the first implemented MVP foundation so future work can continue without relying on chat history.

## Implemented Slices

### Slice 0: Documentation

- `/docs` is now the documentation source of truth.
- `docs/README.md` was updated to reference `/docs`, tonal system, typography system, and MVP direction.

### Slice 1: Workspace

- Root `pnpm` workspace.
- `apps/web` for the frontend.
- `apps/api` for the backend.
- `packages/domain` for shared schemas, enums, fixtures, and template definitions.

### Slice 2: Frontend

Implemented with Next.js App Router:

- public landing page
- login page
- register page
- forgot password page
- logged-in shell
- profile routes
- versions routes
- pages routes
- resumes routes
- templates routes
- settings route
- public page renderer
- resume mode renderer

The UI uses the documented FolioTree direction:

- Sora for display typography
- Inter for UI typography
- IBM Plex Mono for data/meta
- light product base
- more expressive public surfaces

### Slice 3: Domain

`@foliotree/domain` contains:

- publish status enums
- asset/template/block enums
- profile schemas
- version schemas
- page schemas
- resume schemas
- community portfolio template seed definition
- demo profile, page, version, and resume fixtures

### Slice 4: Backend

Implemented with Fastify and Prisma:

- `/health`
- `/v1/me`
- `/v1/profile`
- `/v1/links`
- `/v1/proofs`
- `/v1/projects`
- `/v1/experiences`
- `/v1/achievements`
- `/v1/highlights`
- `/v1/versions`
- `/v1/pages`
- `/v1/resumes`
- `/v1/templates`
- `/v1/assets`
- `/v1/public/pages/:slug`
- `/v1/public/resumes/:slug`

Auth is prepared for Clerk:

- development accepts `x-clerk-user-id`
- production should validate a real Clerk bearer token before launch hardening

## Template System

The template foundation is data-oriented:

- `Template` stores the template identity.
- `TemplateRevision` stores versioned template tokens and metadata.
- `TemplateBlock` stores the reusable block definition.
- `PageBlock` stores the user's editable instance.

User-level edits happen on `PageBlock`, not on the base template:

- reorder via `sortOrder`
- hide via `visible`
- remove by deleting the instance
- add by creating a new instance
- edit content via `content`
- edit styles via `style`
- edit images/assets via `assetRefs`

The first seed is `community-portfolio`, mapped from the Figma template into FolioTree block types.

## Resume Mode

`ResumeView` is a first-class output derived from `Version`.

It is not a separate profile model.

The current renderer:

- reduces visual noise
- prioritizes text
- shows summary, experience, projects, proof, and links
- supports browser print as the MVP export path

## Next Slices

Recommended next implementation order:

1. Replace demo data in `apps/web` with API calls.
2. Add real Clerk route protection and backend JWT verification.
3. Add Prisma migration workflow against Neon.
4. Implement real create/update/delete actions from frontend forms.
5. Add Vercel Blob upload flow for editable images.
6. Implement the Figma template with closer visual fidelity inside the block renderer.
