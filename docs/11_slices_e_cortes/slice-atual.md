# Slice Atual

Status: FECHADO  
Last updated: 2026-04-27

## Nome

Slice documental 1 - Estrutura integrada e legado.

## Objetivo

Aplicar o Metodo Estrutural Integrado ao estado documental atual do projeto sem tentar reescrever todos os documentos em um unico corte.

## Escopo dentro

- Criar estrutura `docs/00_*` a `docs/13_legado`.
- Mover documentos planos atuais para `docs/13_legado/pre-integrado-2026-04-27/`.
- Criar documentos ativos minimos.
- Registrar backlog por dependencia.
- Registrar evidencias de fechamento.

## Escopo fora

- Reescrever todos os planos antigos.
- Auditar cada jornada em browser.
- Alterar codigo de runtime.
- Fechar lacunas tecnicas como rate limit duravel ou Gemini.

## Skills

- `always-todo`
- `consistencia-documental`
- `metodo-mfee`

## Evidencias

- `docs/README.md` recriado como indice ativo.
- `docs/00_governanca/*` criado.
- `docs/01_produto_e_briefing/briefing-integrado.md` criado.
- `docs/02_contratos/contratos-minimos.md` criado.
- `docs/03_fundacoes/arquitetura-atual.md` criado.
- `docs/10_backlog/backlog-estrutural.md` criado.
- `docs/12_auditoria/inventario-e-auditoria-documental.md` criado.
- Documentos antigos movidos para `docs/13_legado/pre-integrado-2026-04-27/`.

## Validacao esperada

- `npm run typecheck`
- `npm run lint`
- `npx prettier --check --ignore-unknown docs`
- busca de mojibake nos documentos ativos.
