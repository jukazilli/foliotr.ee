# Slice Atual

Status: FECHADO  
Last updated: 2026-04-28

## Nome

Slice 3 - Perfil publico com capa e paridade do dono.

## Modo de entrada

Slice.

O projeto ja existe, a documentacao ativa ja foi integrada e o pedido atual e uma otimizacao incremental grande sobre navegacao autenticada, perfil publico, onboarding e templates. Este recorte executou apenas o hub publico `/{username}` com capa, cards e controles discretos para dono.

## Objetivo

Recriar o perfil publico como centro da experiencia social, com capa, avatar, resumo em cards e paridade inicial entre visitante e dono logado.

## Fontes de verdade

- Pedido atual do usuario em 2026-04-28.
- `docs/02_contratos/contrato-remaster-social-ui.md`.
- `docs/10_backlog/backlog-remaster-social-ui.md`.
- Codigo real em `app/`, `components/`, `lib/` e `prisma/schema.prisma`.
- Referencia Facebook via Playwright, se autenticada pelo usuario, apenas como referencia de navegacao e perfil.

## Contratos necessarios

- Contrato de cadastro e onboarding.
- Contrato da shell social autenticada.
- Contrato do perfil publico e da visao do dono.
- Contrato de edicao tipo About.
- Contrato de portfolios em grid.
- Contrato de templates sem dependencia de editor tecnico.
- Contrato de depreciacao do `/dashboard` e do editor.

## Lacunas

- Card 2 do perfil publico ainda nao esta definido.
- Falta observar ou dispensar formalmente a referencia Facebook.
- Falta decidir se `/dashboard` sera redirect ou remocao dura.
- Falta decidir compatibilidade de links para `/pages/{pageId}/editor`.
- Falta definir busca da top bar.
- Falta mapear controles visiveis apenas para dono logado.
- Falta estrategia completa para migrar templates sem quebrar dados existentes.

## Backlog por dependencia

1. Referencia e contrato visual.
2. Onboarding de conta para perfil publico.
3. Top bar social e descontinuidade de dashboard.
4. Perfil publico com capa e paridade do dono.
5. Perfil/About editor.
6. Portfolios em grade com acoes iconicas.
7. Templates sem dependencia de editor.
8. Depreciacao controlada do editor tecnico.
9. QA integrado e fechamento.

## Slice executado

Executado apenas o Slice 3.

Dentro:

- `bannerUrl` e `user.id` expostos na query publica.
- `/{username}` detecta se a sessao atual pertence ao dono do perfil.
- Hub publico redesenhado com capa, avatar, nome, headline e cards.
- Card Sobre concentra dados pessoais/profissionais ja existentes.
- Card Portfolio resume portfolios publicados e teste publico.
- Card Reviews resume media/contagem e ancora o formulario publico.
- Dono logado ve acoes discretas de editar perfil e gerenciar portfolios.

Fora:

- Remover editor.
- Migrar templates.
- Recriar portfolios em grid.
- Reorganizar editor de perfil em formato About.

## Skills/agentes a acionar

- `metodo-estrutural-integrado`
- `always-todo`
- `consistencia-documental`
- `playwright`, quando iniciar a referencia Facebook e validacao visual

Subagentes nao acionados: o usuario nao solicitou delegacao ou trabalho multiagente.

## Evidencias de fechamento

- `lib/server/domain/public-pages.ts` seleciona `bannerUrl` e `user.id`.
- `app/[username]/page.tsx` passa `isOwner` ao hub publico.
- `components/public/PublicProfileHubPage.tsx` renderiza capa, cards e controles do dono.
- `npm run typecheck` executado sem erro.
- Busca de mojibake nos arquivos tocados executada sem ocorrencias.
