# Módulo - Portfólio, versões e currículo

Status: FECHADO
Last updated: 2026-04-29

## Responsabilidade

Gerenciar variações de portfólio, páginas públicas e currículo rápido derivados do perfil base.

## Rotas

- `app/(app)/portfolios/page.tsx`
- `app/(app)/portfolios/[versionId]/edit/page.tsx`
- `app/api/versions/route.ts`
- `app/api/versions/[versionId]/route.ts`
- `app/api/versions/[versionId]/page/route.ts`
- `app/api/versions/[versionId]/resume/route.ts`
- `app/[username]/[pageSlug]/page.tsx`
- `app/[username]/resume/page.tsx`
- `app/[username]/[pageSlug]/resume/page.tsx`

## Componentes

- `components/portfolios/PortfolioVariationWizard.tsx`
- `components/public/PublicPortfolioTabsPage.tsx`
- `components/public/PublicResumePage.tsx`
- `components/resume/ResumeView.tsx`

## Domínio e dados

- Prisma: `Version`, `Page`, `ResumeConfig`, seleções `VersionExperience`, `VersionEducation`, `VersionProject`, `VersionSkill`, `VersionProof`, `VersionHighlight`, `VersionLink`.
- Domínio: `lib/server/domain/versions.ts`, `lib/server/domain/public-pages.ts`.

## Contratos

- Variação possui snapshot independente.
- Portfólio publicado gera página pública.
- Currículo rápido é modo objetivo associado ao portfólio.
- Editor técnico legado foi depreciado; fluxos principais passam por perfil, portfólios e templates.

## Lacunas

- Refinamento visual do currículo rápido segue em backlog futuro.
- Visibilidade granular por item/seção ainda pode evoluir.
