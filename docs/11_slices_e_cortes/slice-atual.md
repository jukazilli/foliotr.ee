# Slice Atual

Status: ATUAL
Last updated: 2026-04-28

## Nome

Slice 3 - Nome por cargo e cards de portfolios.

## Modo de entrada

Corte.

O projeto ja existe e o recorte atual depende do snapshot por variacao e do wizard inicial. O objetivo e remover a ambiguidade entre template e portfolio: o nome principal deve representar o cargo/role da variacao, enquanto o template fica como metadado.

## Objetivo

Centralizar a regra de nome do portfolio e aplicar essa regra em `/portfolios`, no wizard e na acao de duplicar variacao.

## Fontes de verdade

- Pedido atual do usuario em 2026-04-28.
- `docs/02_contratos/contrato-versionamento-portfolio.md`.
- `docs/10_backlog/backlog-versionamento-portfolio.md`.
- `app/(app)/portfolios/page.tsx`.
- `app/(app)/portfolios/actions.ts`.
- `app/(app)/portfolios/[versionId]/edit/actions.ts`.
- `components/portfolios/PortfolioVariationWizard.tsx`.

## Contratos necessarios

- `Version.name` deve representar o cargo/headline da variacao quando possivel.
- O card de portfolio mostra cargo/nome da variacao como informacao principal.
- Nome do template aparece apenas como detalhe visual.
- Fallback final continua preservando o nome existente para compatibilidade.

## Lacunas

- Ainda falta escolher uma experiencia principal obrigatoria por variacao.
- Ainda falta aplicar template sem editor tecnico em fluxo dedicado.
- Cards sem page continuam em area separada de pendencias.

## Backlog por dependencia

1. Nome por cargo e cards de portfolios.
2. Templates aplicados a variacao.
3. Compatibilidade e QA.

## Slice executado

Executado apenas o Slice 3 do backlog de versionamento.

Dentro:

- Helper `derivePortfolioVersionName`.
- Helper `derivePortfolioNameFromSnapshot`.
- Card de `/portfolios` exibindo cargo/headline como titulo principal.
- Template exibido como metadado do card.
- Wizard usando cargo/headline como titulo visual principal.
- Duplicacao de portfolio criando a nova variacao com nome derivado do cargo da fonte.

Fora:

- Regras de experiencia principal obrigatoria.
- Remocao de todos os nomes antigos ja persistidos.
- Migracao em massa de `Version.name`.

## Skills/agentes acionados

- `metodo-estrutural-integrado`
- `always-todo`
- `consistencia-documental`

Subagentes nao acionados: o usuario nao solicitou delegacao ou trabalho multiagente.

## Evidencias de fechamento

- `lib/server/domain/portfolio-naming.ts` criado.
- `app/(app)/portfolios/page.tsx` usa `derivePortfolioVersionName(version)` para o titulo do card.
- `app/(app)/portfolios/actions.ts` usa a regra ao duplicar uma variacao.
- `app/(app)/portfolios/[versionId]/edit/actions.ts` salva `Version.name` derivado do snapshot editado.
- `components/portfolios/PortfolioVariationWizard.tsx` prioriza headline/cargo no titulo visual.
- Validacoes do recorte devem incluir typecheck, lint/prettier dos arquivos tocados, build e `git diff --check`.
