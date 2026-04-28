# Slice Atual

Status: ATUAL
Last updated: 2026-04-28

## Nome

Slice 4 - Templates aplicados a variacao.

## Modo de entrada

Corte.

O projeto ja existe e o wizard inicial ja permite selecionar template. O recorte atual fecha a consistencia operacional: quando a pagina e os blocos sao gerados, o template precisa consumir o snapshot da variacao, nao o perfil global vivo.

## Objetivo

Garantir que a aplicacao/troca de template e o reseed de blocos semanticos usem `Page.editorSnapshot.profile`, derivado de `Version.profileSnapshot`.

## Fontes de verdade

- Pedido atual do usuario em 2026-04-28.
- `docs/02_contratos/contrato-versionamento-portfolio.md`.
- `docs/10_backlog/backlog-versionamento-portfolio.md`.
- `lib/server/domain/versions.ts`.
- `lib/server/domain/templates.ts`.
- `lib/templates/semantic/types.ts`.
- `components/portfolios/PortfolioVariationWizard.tsx`.

## Contratos necessarios

- Template pertence a portfolio/variacao, nao ao perfil.
- Ao aplicar template, blocos iniciais e snapshots devem refletir a variacao.
- Trocar template nao pode alterar `/api/profile` nem dados globais.

## Lacunas

- Ainda falta UI dedicada para visibilidade granular por item/secao.
- Ainda falta QA browser autenticado da troca real de template.
- Ainda falta remover/depreciar o editor tecnico legado de blocos.

## Backlog por dependencia

1. Templates aplicados a variacao.
2. Compatibilidade e QA.

## Slice executado

Executado apenas o Slice 4 do backlog de versionamento.

Dentro:

- `SemanticSeedContext.profile` aceita `TemplateProfile`.
- `seedPageBlocksFromTemplate` aceita snapshot serializado da variacao.
- `upsertOwnedPageOutput` semeia blocos usando `nextEditorSnapshot.profile`.
- `syncOwnedPageSnapshot` resemeia blocos usando `editorSnapshot.profile`.
- Wizard ja seleciona template e chama `upsertOwnedPageOutput`/`upsertOwnedResumeOutput`.

Fora:

- Editor tecnico legado.
- Migracao em massa de blocos antigos.
- Teste browser autenticado.

## Skills/agentes acionados

- `metodo-estrutural-integrado`
- `always-todo`
- `consistencia-documental`

Subagentes nao acionados: o usuario nao solicitou delegacao ou trabalho multiagente.

## Evidencias de fechamento

- `lib/templates/semantic/types.ts` permite `TemplateProfile` no seed.
- `lib/server/domain/templates.ts` aceita `TemplateProfile | ProfileAggregate`.
- `lib/server/domain/versions.ts` passa `editorSnapshot.profile` ao seed de blocos.
- Publicacao de `Page` e `ResumeConfig` segue usando snapshots derivados da variacao.
- Validacoes do recorte devem incluir typecheck, lint/prettier dos arquivos tocados, build e `git diff --check`.
