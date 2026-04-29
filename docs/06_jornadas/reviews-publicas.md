# Jornada - Reviews públicas

Status: FECHADO
Last updated: 2026-04-29

## Objetivo

Permitir que terceiros deixem reviews para um perfil público, mantendo moderação pelo dono e proteções básicas contra abuso.

## Entrada

- Visitante acessa `/{username}` ou `/{username}/{pageSlug}`.
- Dono autenticado acessa `/profile?tab=reviews` para gerenciar visibilidade.

## Passos

1. Visitante preenche nome, contexto, email opcional, nota e descrição.
2. Action pública envia o formulário para `createPublicReview`.
3. Domínio valida honeypot, rate limit, limite de pendentes e regra anti-autoavaliação.
4. Review nasce oculta.
5. Dono decide se mostra ou não mostra no perfil.
6. Média pública considera apenas reviews visíveis.

## Telas e componentes

- `app/[username]/review-actions.ts`
- `lib/server/domain/reviews.ts`
- `components/public/PublicReviewsSection.tsx`
- `components/public/PublicPortfolioTabsPage.tsx`
- `components/profile/ProfileEditor.tsx`

## Validações

- Dono autenticado não pode criar review para o próprio perfil.
- Email do dono ou email público do perfil bloqueia tentativa óbvia de autoavaliação.
- Rate limit existe por IP + perfil e por email informado + perfil.
- Honeypot aceita submissão falsa sem criar registro.
- Limite de reviews públicas pendentes protege volume por perfil.

## Reflexos

- Reviews aprovadas aparecem no hub público e nas páginas públicas.
- Reviews ocultas continuam disponíveis para moderação no perfil do dono.

## Lacunas

- Visitante anônimo com outro nome e outro email não pode ser identificado com certeza.
- Proteção forte exige slice futuro com captcha, login obrigatório, convite assinado, verificação de email ou reputação de reviewer.
- Rate limit em memória deve migrar para store durável antes de produção multi-instância.
