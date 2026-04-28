# Inventario e Auditoria Documental

Status: PARCIAL  
Last updated: 2026-04-27

## Fontes analisadas

- `docs/*.md` antes da reorganizacao.
- `prototipos-legados/`.
- `package.json`.
- Pastas reais: `app/`, `components/`, `lib/`, `prisma/`, `tests/`.
- Framework local: `C:/projetos/.codex/FRAMEWOKS/metodo_estrutural_integrado.md`.

## Inventario real

| Area                           | Evidencia                                  | Status           |
| ------------------------------ | ------------------------------------------ | ---------------- |
| Runtime Next.js root           | `package.json`, `app/`, `app/api/*`        | FECHADO          |
| Auth NextAuth                  | `auth.ts`, `middleware.ts`                 | FECHADO          |
| Persistencia Prisma/PostgreSQL | `prisma/`, scripts `db:*`                  | FECHADO          |
| Docs antigas planas            | `docs/13_legado/pre-integrado-2026-04-27/` | FECHADO          |
| Prototipos legados             | `prototipos-legados/`                      | FECHADO          |
| Estrutura integrada            | `docs/00_*` a `docs/13_legado`             | FECHADO          |
| Jornadas detalhadas            | `docs/06_jornadas/`                        | NAO IMPLEMENTADO |
| Modulos detalhados             | `docs/07_modulos/`                         | NAO IMPLEMENTADO |
| Integracoes detalhadas         | `docs/08_integracoes/`                     | NAO IMPLEMENTADO |

## Lacunas

| Lacuna                                                 | Impacto                           | Status           | Proximo passo          |
| ------------------------------------------------------ | --------------------------------- | ---------------- | ---------------------- |
| Planos antigos ainda nao classificados individualmente | Pode confundir retomada           | PARCIAL          | Slice documental 2     |
| Jornadas oficiais ainda nao reescritas no novo padrao  | Dificulta auditoria ponta a ponta | NAO IMPLEMENTADO | Slice documental 3     |
| Modulos oficiais ainda nao consolidados                | Dificulta ownership por dominio   | NAO IMPLEMENTADO | Slice documental 4     |
| Rate limit duravel sem decisao                         | Risco operacional                 | PARCIAL          | Contrato de integracao |
| Politica Gemini sem limites documentados               | Risco de custo/abuso              | PARCIAL          | Contrato operacional   |
| `generated/prisma-client` sem politica final           | Risco de churn                    | PARCIAL          | Decisao tecnica        |

## Decisao de fechamento do slice

O slice documental 1 pode ser considerado FECHADO porque:

- a estrutura integrada existe;
- o legado foi preservado;
- o indice ativo existe;
- fontes de verdade e contratos minimos foram criados;
- backlog por dependencia foi registrado.

O projeto documental completo permanece PARCIAL.
