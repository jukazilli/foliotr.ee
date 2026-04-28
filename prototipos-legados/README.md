# Prototipos Legados

Status: legacy reference only  
Last updated: 2026-04-27

This folder stores prototypes, old design references and legacy architecture artifacts moved out of the runtime root.

These files are not active application code.

## Rules

- Do not import code from this folder into the active app.
- Do not use this folder as a product or architecture contract.
- Extract useful decisions into `docs/` before implementing them.
- Keep runtime work in the root Next.js app: `app/`, `components/`, `lib/`, `prisma/`, `tests/`.

## Inventory

| Path | Role |
| --- | --- |
| `landing-test/` | Landing carousel study |
| `redesign-teste/` | LINKFOLIO visual redesign reference |
| `editor-otimizacao/` | Editor UI/Figma export reference |
| `orientacao-profissional-app/` | Vocational test prototype |
| `design-system-legado/` | Superseded static design-system prototype |
| `apps/` | Old monorepo app artifacts |
| `packages/` | Old monorepo package artifacts |

See `docs/documentation-governance.md` for the active governance rule.
