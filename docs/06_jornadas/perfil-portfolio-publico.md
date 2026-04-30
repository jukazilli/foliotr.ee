# Jornada - Perfil -> Portfólio -> Público

Status: FECHADO
Last updated: 2026-04-29

## Objetivo

Permitir que o usuário mantenha um perfil base e publique experiências em portfólios acessíveis publicamente.

## Entrada

- Usuário autenticado acessa `/profile`, `/portfolios` ou o próprio `/{username}`.
- Visitante anônimo acessa `/{username}` ou `/{username}/{pageSlug}`.

## Passos

1. Usuário edita dados base em `/profile`.
2. Usuário organiza portfólios em `/portfolios`.
3. Portfólio publicado gera link público em `/{username}/{pageSlug}`.
4. Hub público `/{username}` agrega dados base, portfólios publicados e reviews.
5. Dono logado vê controles discretos de edição; visitante vê apenas conteúdo público.

## Telas e componentes

- `app/(app)/profile/page.tsx`
- `components/profile/ProfileEditor.tsx`
- `app/(app)/portfolios/page.tsx`
- `app/[username]/page.tsx`
- `components/public/PublicProfileHubPage.tsx`
- `components/public/PublicPortfolioTabsPage.tsx`

## Validações

- Rotas autenticadas exigem sessão.
- Rotas públicas leem apenas dados publicados.
- Dono do perfil é detectado por `session.user.id === hub.user.id`.

## Reflexos

- Alterações salvas em `/profile` alimentam o hub público.
- Portfólios publicados aparecem como experiências publicadas.
- Currículo rápido publicado aparece como link associado ao portfólio.

## Lacunas

- Busca da top bar ainda é visual.
- Visibilidade granular por campo ainda não tem contrato final.
