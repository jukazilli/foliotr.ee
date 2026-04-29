# Backlog - Portfólio versionado e carrossel público

Status: active backlog
Last updated: 2026-04-29

## Objetivo

Transformar o portfólio versionado em uma experiência pública mais visual e reduzir retrabalho no editor de versões. Cada versão deve nascer como uma cópia editável do perfil mestre, permitir capa própria e publicar essa variação sem alterar os dados base.

## Fontes de verdade

- Protótipo visual: `prototipos-legados/landing-test/material/carousel-standalone/`.
- Perfil público: `components/public/PublicProfileHubPage.tsx`.
- Editor de variação: `components/portfolios/PortfolioVariationWizard.tsx`.
- Actions do editor: `app/(app)/portfolios/[versionId]/edit/actions.ts`.
- Domínio de versões: `lib/server/domain/versions.ts`.
- Snapshot de perfil: `lib/server/domain/page-snapshots.ts`.
- Schema: `prisma/schema.prisma`.

## Contratos necessários

- Carrossel público deve ficar dentro do card de portfólio, sem seção duplicada abaixo dos cards.
- Cada item do carrossel representa uma versão/página publicada.
- Título do card usa o nome da versão principal publicada; fallback: `Portfólio`.
- Capa do carrossel deve vir da versão quando o campo existir; até lá, usar fallback visual.
- Capa de versão é diferente da capa do perfil público.
- Editor de versão deve ter passo `Capa` antes de `Identidade`.
- `Identidade` deve partir do snapshot do perfil mestre, mas salvar mudanças apenas em `Version.profileSnapshot`.
- Criar/editar versão não pode alterar `Profile`, `Experience`, `Education`, `Project`, `Proof` ou outros dados base.

## Lacunas

- `Version` ainda não possui campo próprio de capa/asset.
- O editor atual salva identidade básica, mas não expõe todos os dados do snapshot mestre para edição granular.
- A cópia versionada já referencia seleções de dados base; ainda falta UI completa para editar/excluir itens dentro da variação sem tocar no perfil mestre.
- Remoção da capa no perfil base precisa de decisão de migração visual, porque `bannerUrl` ainda alimenta o hub público.

## Backlog por dependência

1. Fechar carrossel público dentro do card.
2. Contratar modelo de capa por versão.
3. Implementar schema/API/UI do passo `Capa`.
4. Expandir `Identidade` para carregar snapshot completo do perfil mestre.
5. Permitir edição/exclusão versionada de experiências, formações, projetos, reviews, links e demais blocos sem alterar o perfil base.
6. Decidir destino da capa pública atual do perfil base.

## Slice 11 - Carrossel público no card

Status: FECHADO em 2026-04-29

Escopo dentro:

- Remover seção duplicada `Portfólios e currículos / Experiências publicadas`.
- Transformar a lista do card em carrossel visual inspirado no protótipo legado.
- Manter links de portfólio e currículo rápido.
- Usar fallback visual para capa enquanto o campo de capa por versão não existe.
- Corrigir classes de grid inválidas já detectadas no card de reviews.

Escopo fora:

- Criar migration de capa por versão.
- Alterar editor de variação.
- Alterar snapshot ou persistência de dados versionados.

Evidência esperada:

- `PublicProfileHubPage` não renderiza mais a seção duplicada.
- `PublicPortfolioCarousel` concentra os itens publicados dentro do card.
- `npm run typecheck`, `npm run lint` e `git diff --check` sem erro.
- Busca de mojibake nos componentes tocados sem ocorrência.

Evidência de fechamento:

- `components/public/PublicPortfolioCarousel.tsx` criado com carrossel client inspirado no protótipo legado.
- `components/public/PublicProfileHubPage.tsx` passou a renderizar o carrossel dentro do card e removeu a seção duplicada.
- `components/public/PublicReviewsSection.tsx` manteve correção de largura desktop com `lg:col-span-[14]`.
- `npm run typecheck`: sem erro.
- `npm run lint`: sem erro.
- `git diff --check`: sem erro.
- Busca de mojibake nos arquivos tocados: sem ocorrência.

## Slice 12 - Capa por versão

Status: FECHADO em 2026-04-29

Escopo previsto:

- Usar `profileSnapshot.bannerUrl` como capa da versão, sem migration.
- Adicionar passo `Capa` antes de `Identidade`.
- Reutilizar `AssetGalleryPicker`.
- Salvar capa sem alterar capa do perfil público.
- Alimentar o carrossel público com a capa da versão.

Evidência de fechamento:

- `components/portfolios/PortfolioVariationWizard.tsx` ganhou passo `Capa` antes de `Identidade`.
- O passo `Capa` reutiliza `AssetGalleryPicker`, permite trocar e remover a capa da versão.
- `app/(app)/portfolios/[versionId]/edit/actions.ts` já salva `bannerUrl` apenas em `Version.profileSnapshot`.
- `lib/server/domain/public-pages.ts` expõe `profileSnapshot` para o hub público.
- `components/public/PublicProfileHubPage.tsx` lê `profileSnapshot.bannerUrl` e envia `coverUrl` ao carrossel.
- `npm run typecheck`: sem erro.
- Busca de mojibake nos arquivos tocados: sem ocorrência.

## Slice 13 - Identidade versionada: seleção de dados

Status: FECHADO em 2026-04-29

Escopo previsto:

- Carregar o estado atual do perfil mestre no snapshot da versão.
- Expor dados básicos, formação, experiências, projetos, reconhecimentos, skills, destaques, links e reviews na aba `Identidade`.
- Permitir incluir/remover dados dentro da versão sem alterar dados base.
- Persistir mudanças em `profileSnapshot` e seleções `Version*`.

Evidência de fechamento:

- `app/(app)/portfolios/[versionId]/edit/page.tsx` carrega coleções do snapshot da versão.
- `components/portfolios/PortfolioVariationWizard.tsx` mostra coleções na aba `Identidade` com checkboxes por item.
- `app/(app)/portfolios/[versionId]/edit/actions.ts` salva seleções em `VersionExperience`, `VersionEducation`, `VersionProject`, `VersionSkill`, `VersionAchievement`, `VersionProof`, `VersionHighlight` e `VersionLink`.
- A persistência de seleção usa `updateOwnedVersion`, preservando ownership e sem alterar dados base.
- `npm run typecheck`: sem erro.
- Busca de mojibake nos arquivos tocados: sem ocorrência.

## Slice 14 - Identidade versionada: edição granular

Status: ATUAL

Escopo previsto:

- Permitir editar texto de experiências, formações, projetos e demais blocos dentro da versão.
- Persistir alterações textuais no `profileSnapshot`.
- Manter dados base intactos.
- Definir UI compacta para listas grandes.

## Slice 15 - Decisão sobre capa do perfil base

Status: BACKLOG

Escopo previsto:

- Decidir se a capa do perfil público permanece como capa institucional do hub ou se migra para versão principal.
- Remover edição de capa do perfil base apenas depois da decisão e migração.
