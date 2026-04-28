# Fontes de Verdade

Status: active source of truth  
Last updated: 2026-04-27

## Precedencia

Em caso de conflito, usar:

1. Instrucao atual do usuario.
2. Codigo real em `app/`, `components/`, `lib/`, `prisma/`, `tests/`, `middleware.ts` e `auth.ts`.
3. Schemas, validacoes e contratos versionados.
4. Documentacao ativa em `docs/00_*` a `docs/12_*`.
5. Decisoes registradas em backlog, slices e auditorias.
6. Legado em `docs/13_legado/` e `prototipos-legados/`.
7. Hipoteses, sempre marcadas como hipoteses.

## Fontes ativas por area

| Area        | Fonte ativa                                              |
| ----------- | -------------------------------------------------------- |
| Governanca  | `docs/00_governanca/*`                                   |
| Produto     | `docs/01_produto_e_briefing/briefing-integrado.md`       |
| Contratos   | `docs/02_contratos/contratos-minimos.md`                 |
| Arquitetura | `docs/03_fundacoes/arquitetura-atual.md`                 |
| Backlog     | `docs/10_backlog/backlog-estrutural.md`                  |
| Slices      | `docs/11_slices_e_cortes/slice-atual.md`                 |
| Auditoria   | `docs/12_auditoria/inventario-e-auditoria-documental.md` |
| Historico   | `docs/13_legado/pre-integrado-2026-04-27/`               |
| Prototipos  | `prototipos-legados/`                                    |

## Regra para legado

Legado pode explicar origem, contexto e decisao passada. Legado nao deve ser usado para contrariar a arquitetura atual sem uma nova decisao documentada.
