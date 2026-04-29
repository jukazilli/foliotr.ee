# Módulo - Reviews e reputação

Status: FECHADO
Last updated: 2026-04-29

## Responsabilidade

Coletar, moderar e exibir reviews públicas que compõem reputação do perfil.

## Rotas

- `app/[username]/review-actions.ts`
- `app/[username]/page.tsx`
- `app/[username]/[pageSlug]/page.tsx`
- `app/api/profile/collections/[collection]/route.ts`

## Componentes

- `components/public/PublicReviewsSection.tsx`
- `components/public/PublicReviewRatingInput.tsx`
- `components/public/PublicProfileHubPage.tsx`
- `components/public/PublicPortfolioTabsPage.tsx`
- `components/profile/ProfileEditor.tsx`

## Domínio e dados

- Domínio: `lib/server/domain/reviews.ts`.
- Segurança: `lib/security/rate-limit.ts`.
- Prisma: `Proof` como backing técnico temporário de review.
- Testes: `tests/domain/reviews-domain.test.ts`.

## Contratos

- Review pública nasce oculta.
- Dono do perfil modera visibilidade, mas não pode se autoavaliar.
- Domínio bloqueia dono autenticado e email do dono/perfil.
- Rate limit existe por IP + perfil e por email + perfil.
- Média pública considera apenas reviews visíveis.

## Lacunas

- `Proof` ainda deve ser migrado para `Review` em corte próprio se o produto confirmar.
- Rate limit em memória não é suficiente para produção multi-instância.
- Autoavaliação anônima com outro nome e outro email exige identidade verificada em slice futuro.
