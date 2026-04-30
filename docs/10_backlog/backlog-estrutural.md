# Backlog Estrutural

Status: active backlog  
Last updated: 2026-04-29

## Trilha A - Governanca documental

| Ordem | Slice                              | Dependencia | Status           | Evidencia esperada                                                       |
| ----- | ---------------------------------- | ----------- | ---------------- | ------------------------------------------------------------------------ |
| 1     | Estrutura integrada e legado       | Nenhuma     | FECHADO          | `docs/` reorganizado e legado preservado                                 |
| 2     | Classificar planos de feature      | Slice 1     | FECHADO          | `docs/09_analises/classificacao-planos-legados.md`                       |
| 3     | Consolidar jornadas oficiais       | Slice 2     | FECHADO          | Docs em `06_jornadas/` com passos e evidencias                           |
| 4     | Consolidar modulos oficiais        | Slice 3     | FECHADO          | Docs em `07_modulos/` por dominio                                        |
| 5     | Auditoria de fechamento documental | Slices 2-4  | FECHADO          | Matriz promessa versus evidencia em `docs/12_auditoria/`                 |

## Trilha B - Fundacao tecnica

| Ordem | Item                                  | Dependencia           | Status  | Evidencia esperada                                    |
| ----- | ------------------------------------- | --------------------- | ------- | ----------------------------------------------------- |
| 1     | Politica de `generated/prisma-client` | Governanca documental | PARCIAL | Decisao documentada e ignores ajustados se necessario |
| 2     | Rate limit duravel                    | Decisao de provider   | PARCIAL | Contrato de integracao e implementacao validada       |
| 3     | Politica Gemini custo/limites         | Contrato operacional  | PARCIAL | Limites e validacoes documentados                     |

## Trilha C - Produto e UX

| Ordem | Item                                   | Dependencia     | Status  | Evidencia esperada                                     |
| ----- | -------------------------------------- | --------------- | ------- | ------------------------------------------------------ |
| 1     | Jornada Perfil -> Portfolio -> Publico | Docs de jornada | FECHADO | `docs/06_jornadas/perfil-portfolio-publico.md`         |
| 2     | Jornada Curriculo rapido               | Docs de jornada | FECHADO | `docs/06_jornadas/curriculo-rapido.md`                 |
| 3     | Jornada Reviews publicas               | Docs de jornada | FECHADO | `docs/06_jornadas/reviews-publicas.md`                 |
| 4     | Jornada Teste vocacional               | Docs de modulo  | FECHADO | `docs/06_jornadas/teste-vocacional.md`                 |
| 5     | Remaster social UI                     | Contrato visual | FECHADO | Slices 0 a 10 fechados com evidencias                  |
