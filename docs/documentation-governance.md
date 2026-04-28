# Documentation Governance

Status: active source of truth  
Method: MFEE  
Last updated: 2026-04-27

## Purpose

This document defines the governance rules for FolioTree documentation after the architecture optimization pass.

The goal is to prevent old plans, visual prototypes and generated experiments from competing with the active runtime, product language and implementation rules.

## MFEE Rule

Every product, architecture or UI decision must be classified with one of these statuses:

- FECHADO
- PARCIAL
- NAO IMPLEMENTADO
- IMPLEMENTADO FORA DO PADRAO
- BLOQUEADO POR LACUNA DOCUMENTAL

An item is only FECHADO when there is objective evidence in documentation and in the real implementation.

## Source Of Truth Order

Use this order when documents conflict:

1. Real implementation in `app/`, `components/`, `lib/`, `prisma/`, `middleware.ts`, `auth.ts` and tests.
2. `docs/current-architecture.md` for active code-level architecture.
3. `docs/runtime-architecture-decision.md` for deployment and API ownership.
4. `docs/architecture-optimization-slices.md` for the current optimization execution history.
5. `docs/architecture-checkup-2026-04-27.md` for audit findings and unresolved risks.
6. `docs/brand-core.md`, `docs/brand-deck.md`, `docs/tonal system.md` and `docs/tipografia-system.md` for active brand and visual direction.
7. Feature plans in `docs/*-plan.md` only when they match the real implementation or are explicitly marked as pending.
8. Historical MVP documents and files in `prototipos-legados/` only as legacy evidence.

If an older document contradicts an active source, the active source wins.

## Active Documents

| Document                                   | Role                                  | Status  |
| ------------------------------------------ | ------------------------------------- | ------- |
| `docs/README.md`                           | Documentation index and reading order | FECHADO |
| `docs/current-architecture.md`             | Current app architecture              | FECHADO |
| `docs/runtime-architecture-decision.md`    | Runtime/deployment decision           | FECHADO |
| `docs/architecture-optimization-slices.md` | Optimization execution log            | FECHADO |
| `docs/architecture-checkup-2026-04-27.md`  | Audit and remaining gaps              | PARCIAL |
| `docs/brand-core.md`                       | Brand foundation                      | FECHADO |
| `docs/brand-deck.md`                       | Brand strategy expansion              | FECHADO |
| `docs/tonal system.md`                     | Active tonal system                   | FECHADO |
| `docs/tipografia-system.md`                | Active typography system              | FECHADO |
| `docs/setup.md`                            | Local setup and environment notes     | FECHADO |

## Historical Documents

These documents remain useful for context, but they do not override the active architecture:

| Document                                   | Historical scope                     | Status                      |
| ------------------------------------------ | ------------------------------------ | --------------------------- |
| `docs/mvp-architecture.md`                 | Old monorepo/Fastify/Clerk direction | IMPLEMENTADO FORA DO PADRAO |
| `docs/mvp-executable-plan.md`              | Old MVP execution plan               | IMPLEMENTADO FORA DO PADRAO |
| `docs/mvp-technical-audit.md`              | Earlier technical audit              | PARCIAL                     |
| `prototipos-legados/design-system-legado/` | Old static design-system prototype   | IMPLEMENTADO FORA DO PADRAO |
| `prototipos-legados/apps/`                 | Old monorepo app artifacts           | IMPLEMENTADO FORA DO PADRAO |
| `prototipos-legados/packages/`             | Old monorepo package artifacts       | IMPLEMENTADO FORA DO PADRAO |

## Legacy Prototype Policy

All prototypes and legacy experiments live under `prototipos-legados/`.

Rules:

- They are not runtime code.
- They are not imported by the active app.
- They are excluded from TypeScript, lint and format checks.
- They may be consulted only as visual, UX or historical evidence.
- Useful decisions must be extracted into `docs/` before implementation.
- No new feature should be implemented directly from a prototype without checking the active docs and current code.

Current legacy inventory:

| Path                                              | Role                                  | Current decision                    |
| ------------------------------------------------- | ------------------------------------- | ----------------------------------- |
| `prototipos-legados/landing-test/`                | Landing carousel study                | Legacy reference                    |
| `prototipos-legados/redesign-teste/`              | LINKFOLIO visual redesign reference   | Legacy visual reference             |
| `prototipos-legados/editor-otimizacao/`           | Editor UI/Figma export reference      | Legacy UX reference                 |
| `prototipos-legados/orientacao-profissional-app/` | Vocational test prototype             | Legacy product reference            |
| `prototipos-legados/design-system-legado/`        | Old static design-system prototype    | Superseded by current redesign docs |
| `prototipos-legados/apps/`                        | Old monorepo runtime artifacts        | Legacy architecture reference       |
| `prototipos-legados/packages/`                    | Old monorepo shared package artifacts | Legacy architecture reference       |

## Change Rules

When changing product, architecture, UI or docs:

1. Read `docs/README.md` and the active source of truth for the area.
2. Compare the desired change with the real implementation.
3. If the source is a prototype, extract the decision into an active doc first.
4. Update the execution log or affected plan after implementation.
5. Run the relevant validation command.
6. Search touched text files for mojibake patterns before closing the task.

## Remaining Governance Gaps

| Gap                                         | Status  | Next action                                                  |
| ------------------------------------------- | ------- | ------------------------------------------------------------ |
| Durable rate limit policy                   | PARCIAL | Decide provider and document before implementation           |
| Gemini cost/limit policy                    | PARCIAL | Define operational guardrails                                |
| `generated/prisma-client` versioning policy | PARCIAL | Decide whether generated client remains versioned            |
| Feature plans status                        | PARCIAL | Mark each plan as active, implemented, superseded or backlog |
