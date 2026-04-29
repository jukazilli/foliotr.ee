# Slice Atual

Status: ATUAL
Last updated: 2026-04-29

## Nome

Slice 14 - Identidade versionada: edição granular.

## Modo de entrada

Slice/Corte.

## Objetivo

Permitir que textos de experiências, formações, projetos e demais blocos sejam editados dentro da versão, persistindo apenas em `Version.profileSnapshot` e mantendo o perfil base intacto.

## Fontes de verdade

- `docs/10_backlog/backlog-portfolio-versionado-ui.md`.
- `components/portfolios/PortfolioVariationWizard.tsx`.
- `app/(app)/portfolios/[versionId]/edit/actions.ts`.
- `lib/server/domain/page-snapshots.ts`.
- `lib/server/domain/versions.ts`.

## Contratos necessários

- Edição textual de item versionado não altera o registro mestre.
- Remoção de item da versão continua via seleção `Version*`.
- Alterações textuais ficam no snapshot da versão.
- UI precisa ser compacta e rolar internamente para listas grandes.

## Lacunas

- Ainda não há contrato de formato para patches textuais no snapshot.
- Ainda não há decisão se reviews podem ter texto editável ou apenas visibilidade por versão.

## Backlog por dependência

1. Definir formato de edição por coleção no form.
2. Atualizar action para aplicar patch no snapshot.
3. Renderizar campos editáveis por item.
4. Validar que dados base não mudam.
5. Validar TypeScript, lint e mojibake.

## Slice atual

Dentro:

- Planejar e implementar patch textual por item versionado.

Fora:

- Alterar schema.
- Editar reviews públicas originais.
- Remover capa do perfil base.

## Skills/agentes acionados

- `metodo-estrutural-integrado`.
- `always-todo`.

Subagentes não acionados: não houve pedido de delegação multiagente.

## Evidências de fechamento esperadas

- Campos editáveis por coleção.
- Action atualiza somente `profileSnapshot`.
- `npm run typecheck`.
- `npm run lint`.
- `git diff --check`.
- Busca de mojibake nos arquivos tocados.
