# Jornada - Currículo rápido

Status: FECHADO
Last updated: 2026-04-29

## Objetivo

Oferecer uma leitura objetiva do portfólio publicado, com foco em experiência, formação, projetos e contato.

## Entrada

- Usuário autenticado acessa currículo associado à página em `/pages/{pageId}/resume`.
- Visitante acessa `/{username}/resume` ou `/{username}/{pageSlug}/resume`.

## Passos

1. Usuário cria ou publica uma versão/portfólio.
2. Configuração de currículo é salva junto da versão.
3. Rota autenticada mostra o currículo para revisão do dono.
4. Rota pública mostra o currículo quando publicado.
5. Visitante usa o currículo como leitura rápida associada ao portfólio.

## Telas e componentes

- `app/(app)/pages/[pageId]/resume/page.tsx`
- `app/[username]/resume/page.tsx`
- `app/[username]/[pageSlug]/resume/page.tsx`
- `components/public/PublicResumePage.tsx`
- `components/resume/ResumeView.tsx`

## Validações

- Rota autenticada valida ownership.
- Rota pública exige estado publicado.
- Dados do currículo derivam do perfil e da versão.

## Reflexos

- Perfil base e seleções da versão determinam conteúdo.
- Links de currículo aparecem no hub e nos cards de portfólio quando publicados.

## Lacunas

- Refinamento visual do currículo rápido segue como backlog futuro.
- Política de exportação/impressão não está consolidada neste corte.
