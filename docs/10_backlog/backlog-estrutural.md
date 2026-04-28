# Backlog Estrutural

Status: active backlog  
Last updated: 2026-04-27

## Trilha A - Governanca documental

| Ordem | Slice                              | Dependencia | Status           | Evidencia esperada                                                       |
| ----- | ---------------------------------- | ----------- | ---------------- | ------------------------------------------------------------------------ |
| 1     | Estrutura integrada e legado       | Nenhuma     | FECHADO          | `docs/` reorganizado e legado preservado                                 |
| 2     | Classificar planos de feature      | Slice 1     | NAO IMPLEMENTADO | Cada `*-plan.md` marcado como ativo, implementado, superseded ou backlog |
| 3     | Consolidar jornadas oficiais       | Slice 2     | NAO IMPLEMENTADO | Docs em `06_jornadas/` com passos e evidencias                           |
| 4     | Consolidar modulos oficiais        | Slice 3     | NAO IMPLEMENTADO | Docs em `07_modulos/` por dominio                                        |
| 5     | Auditoria de fechamento documental | Slices 2-4  | NAO IMPLEMENTADO | Matriz promessa versus evidencia                                         |

## Trilha B - Fundacao tecnica

| Ordem | Item                                  | Dependencia           | Status  | Evidencia esperada                                    |
| ----- | ------------------------------------- | --------------------- | ------- | ----------------------------------------------------- |
| 1     | Politica de `generated/prisma-client` | Governanca documental | PARCIAL | Decisao documentada e ignores ajustados se necessario |
| 2     | Rate limit duravel                    | Decisao de provider   | PARCIAL | Contrato de integracao e implementacao validada       |
| 3     | Politica Gemini custo/limites         | Contrato operacional  | PARCIAL | Limites e validacoes documentados                     |

## Trilha C - Produto e UX

| Ordem | Item                                   | Dependencia     | Status  | Evidencia esperada                                     |
| ----- | -------------------------------------- | --------------- | ------- | ------------------------------------------------------ |
| 1     | Jornada Perfil -> Portfolio -> Publico | Docs de jornada | PARCIAL | Rota, tela, acao e resultado documentados              |
| 2     | Jornada Curriculo rapido               | Docs de jornada | PARCIAL | Fluxo autenticado e publico documentado                |
| 3     | Jornada Reviews publicas               | Docs de jornada | PARCIAL | Envio, anti-spam e moderacao futura documentados       |
| 4     | Jornada Teste vocacional               | Docs de modulo  | PARCIAL | Contrato entre prototipo legado e app real documentado |
