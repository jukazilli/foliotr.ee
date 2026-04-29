# Slice Atual

Status: ATUAL
Last updated: 2026-04-29

## Nome

Slice 12 - Capa por versão.

## Modo de entrada

Slice/Corte.

## Objetivo

Adicionar capa própria para cada versão de portfólio, configurável antes de `Identidade`, reutilizando a galeria de assets e alimentando o carrossel público.

## Fontes de verdade

- `docs/10_backlog/backlog-portfolio-versionado-ui.md`.
- `components/portfolios/PortfolioVariationWizard.tsx`.
- `components/assets/AssetGalleryPicker.tsx`.
- `app/(app)/portfolios/[versionId]/edit/actions.ts`.
- `lib/server/domain/versions.ts`.
- `lib/server/domain/includes.ts`.
- `prisma/schema.prisma`.
- `components/public/PublicPortfolioCarousel.tsx`.

## Contratos necessários

- Capa da versão é separada da capa pública do perfil base.
- O passo `Capa` vem antes de `Identidade`.
- A imagem deve ser selecionada pela galeria central ou enviada por ela.
- Salvar capa altera apenas a versão atual.
- O carrossel público usa a capa da versão quando existir e fallback visual quando não existir.

## Lacunas

- `Version` ainda não possui campo persistido para capa.
- Não há migration para capa da versão.
- A query pública ainda não expõe capa de versão.

## Backlog por dependência

1. Adicionar campo de capa em `Version`.
2. Atualizar includes/domínio para carregar a capa.
3. Atualizar action de edição da variação.
4. Adicionar passo `Capa` no wizard.
5. Alimentar carrossel público com a capa.
6. Validar TypeScript, lint, schema e mojibake.

## Slice atual

Dentro:

- Persistir URL de capa da versão.
- Reutilizar `AssetGalleryPicker` no passo `Capa`.
- Mostrar preview de capa no editor.
- Usar capa no carrossel público.

Fora:

- Remover capa do perfil base.
- Editar dados granulares de identidade.
- Migrar capas antigas automaticamente.

## Skills/agentes acionados

- `metodo-estrutural-integrado`.
- `always-todo`.

Subagentes não acionados: não houve pedido de delegação multiagente.

## Evidências de fechamento esperadas

- Migration ou schema atualizado.
- Editor com passo `Capa`.
- Carrossel público recebendo capa da versão.
- `npm run typecheck`.
- `npm run lint`.
- `git diff --check`.
- Busca de mojibake nos arquivos tocados.
