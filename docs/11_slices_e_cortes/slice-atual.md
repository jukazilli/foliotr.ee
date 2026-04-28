# Slice Atual

Status: ATUAL
Last updated: 2026-04-28

## Nome

Slice 2 - Editor multi-step da variacao.

## Modo de entrada

Corte.

O projeto ja existe e o recorte atual depende do snapshot por variacao ja implementado. O objetivo e entregar o primeiro editor operacional para a variacao de portfolio, sem trazer de volta o editor tecnico de blocos.

## Objetivo

Criar `/portfolios/{versionId}/edit` para que o usuario edite identidade, dados principais, foto/capa, tema e publicacao de uma variacao usando `Version.profileSnapshot` como fonte de escrita.

## Fontes de verdade

- Pedido atual do usuario em 2026-04-28.
- `docs/02_contratos/contrato-versionamento-portfolio.md`.
- `docs/10_backlog/backlog-versionamento-portfolio.md`.
- `app/(app)/portfolios/page.tsx`.
- `app/(app)/portfolios/actions.ts`.
- `lib/server/domain/versions.ts`.
- `lib/server/domain/page-snapshots.ts`.

## Contratos necessarios

- Editar variacao nao chama `/api/profile` nem altera o perfil global.
- Foto/capa da variacao sao gravadas em `Version.profileSnapshot`.
- Template continua pertencendo ao portfolio/page, nao ao perfil.
- Publicar no wizard atualiza `Page` e `ResumeConfig` com snapshots derivados da variacao.

## Lacunas

- Visibilidade granular por secao/item ainda nao foi implementada.
- Edicao profunda de experiencias, projetos e reviews dentro da variacao fica para o proximo recorte.
- O seed semantico dos blocos ainda usa o perfil agregado em `seedPageBlocksFromTemplate`; a publicacao ja recebe snapshot da variacao.
- O ajuste fino de crop/posicao da foto especifica do portfolio ainda nao foi implementado neste wizard.

## Backlog por dependencia

1. Editor multi-step da variacao.
2. Nome por cargo e cards de portfolios.
3. Templates aplicados a variacao.
4. Compatibilidade e QA.

## Slice executado

Executado apenas o Slice 2 do backlog de versionamento.

Dentro:

- Rota `/portfolios/{versionId}/edit`.
- Wizard com passos: identidade, dados, tema e publicacao.
- Upload/selecao de foto e capa via `AssetGalleryPicker` com `purpose=portfolio`.
- Server action que grava `Version.profileSnapshot`.
- Server action que salva rascunho ou publica `Page` e `ResumeConfig`.
- Acao de duplicar/versionar portfolio redirecionando direto para o editor da nova variacao.

Fora:

- Visibilidade granular.
- Normalizacao completa dos dados por variacao.
- Remocao do editor tecnico legado.
- Redesign completo do renderer publico.

## Skills/agentes acionados

- `metodo-estrutural-integrado`
- `always-todo`
- `consistencia-documental`

Subagentes nao acionados: o usuario nao solicitou delegacao ou trabalho multiagente.

## Evidencias de fechamento

- `app/(app)/portfolios/[versionId]/edit/page.tsx` criada.
- `app/(app)/portfolios/[versionId]/edit/actions.ts` criada.
- `components/portfolios/PortfolioVariationWizard.tsx` criado.
- `app/(app)/portfolios/actions.ts` redireciona variacao criada para o wizard.
- Escrita da variacao passa por `Version.profileSnapshot`, `upsertOwnedPageOutput` e `upsertOwnedResumeOutput`.
- Validacoes do recorte devem incluir typecheck, lint/prettier dos arquivos tocados, build e `git diff --check`.
