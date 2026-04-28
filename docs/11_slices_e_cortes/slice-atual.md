# Slice Atual

Status: ATUAL
Last updated: 2026-04-28

## Nome

Slice 1 - Snapshot editavel por variacao.

## Modo de entrada

Corte.

O projeto ja existe e o recorte atual vem do backlog de versionamento de portfolio. O objetivo e separar os dados base usados por um portfolio/variacao do perfil global do usuario, sem entregar ainda o editor multi-step.

## Objetivo

Criar a primeira fundacao tecnica para portfolio versionado: cada nova `Version` passa a gravar uma copia serializada dos dados base do perfil, e os snapshots de pagina/curriculo passam a preferir essa copia quando publicam ou sincronizam conteudo.

## Fontes de verdade

- Pedido atual do usuario em 2026-04-28.
- `docs/02_contratos/contrato-versionamento-portfolio.md`.
- `docs/10_backlog/backlog-versionamento-portfolio.md`.
- `prisma/schema.prisma`.
- `lib/server/domain/page-snapshots.ts`.
- `lib/server/domain/versions.ts`.

## Contratos necessarios

- Portfolio e variacao nao editam o perfil global diretamente.
- Perfil global segue o padrao do sistema e nao recebe template.
- Portfolio/variacao pode receber template e deve carregar uma copia editavel de dados base.
- Variacoes antigas sem copia persistida precisam continuar funcionando por fallback seguro.

## Lacunas

- Editor multi-step de variacao ainda nao existe.
- A edicao granular de `profileSnapshot` e regras de ocultar/mostrar ficam para o proximo slice.
- Cards por cargo/role e selecao de template por variacao ficam para slices seguintes.
- Blocos semanticos ainda podem ser semeados a partir do perfil vivo na criacao; snapshots de editor/publicacao ja passam a preferir a copia da variacao.

## Backlog por dependencia

1. Snapshot editavel por variacao.
2. Editor multi-step da variacao.
3. Nome por cargo e cards de portfolios.
4. Templates aplicados a variacao.
5. Compatibilidade e QA.

## Slice executado

Executado apenas o Slice 1 do backlog de versionamento.

Dentro:

- Campo `Version.profileSnapshot Json` no Prisma.
- Migration para adicionar o campo em banco.
- Builder `buildVersionProfileSnapshot(profile)`.
- Leitor/fallback `readVersionProfileSnapshot`.
- `createOwnedVersion` gravando a copia inicial do perfil agregado.
- `buildEditorSnapshot` preferindo `Version.profileSnapshot` e caindo para o perfil vivo apenas em legado sem snapshot valido.

Fora:

- Tela `/portfolios/{versionId}/edit`.
- Wizard multi-step.
- Edicao de foto/dados/visibilidade da variacao.
- Troca de template por variacao.

## Skills/agentes acionados

- `metodo-estrutural-integrado`
- `always-todo`
- `consistencia-documental`

Subagentes nao acionados: o usuario nao solicitou delegacao ou trabalho multiagente.

## Evidencias de fechamento

- `prisma/schema.prisma` atualizado com `Version.profileSnapshot`.
- `prisma/migrations/20260428150000_version_profile_snapshot/migration.sql` criada.
- `lib/server/domain/page-snapshots.ts` passa a construir e ler snapshot da variacao.
- `lib/server/domain/versions.ts` cria nova variacao com copia serializada do perfil agregado.
- Variacoes antigas recebem fallback seguro porque `{}` nao passa na validacao minima do leitor.
- Validacoes do recorte devem incluir Prisma validate, typecheck, lint/prettier dos arquivos tocados e `git diff --check`.
