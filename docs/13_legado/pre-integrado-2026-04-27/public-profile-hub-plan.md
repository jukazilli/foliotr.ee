# Public Profile Hub Plan

Status: em implementacao
Data: 2026-04-27

## Objetivo

Transformar `/{username}` na porta de entrada pública do usuário. A página deve apresentar a pessoa de forma breve, mostrar informações básicas, reviews, resultado comportamental público e links amigáveis para portfólios/currículos publicados.

## Decisoes deste corte

- `/{username}` deixa de abrir automaticamente o portfólio primário e passa a renderizar o hub público.
- Portfólios específicos permanecem em `/{username}/{pageSlug}`.
- O currículo primário permanece em `/{username}/resume`.
- Cada portfólio listado no hub pode mostrar também um link de currículo quando a versão tiver currículo publicado.
- O status "trabalhando no momento" e calculado por experiencias com `current=true`.
- A idade e calculada a partir de `Profile.birthDate`, quando informada.
- O usuario ganha campos de oportunidade:
  - `openToOpportunities`
  - `opportunityMotivation`
  - `showOpportunityMotivation`
- A resposta livre "O que faria você mudar de emprego?" só aparece publicamente se `showOpportunityMotivation=true`.

## UX

- Layout inspirado em Linktree: avatar, nome, headline, bio e lista clara de links.
- Cards de portfolio usam nome amigavel da pagina, com fallback para nome da versao.
- Informacoes basicas ficam em chips escaneaveis: localizacao, idade e status profissional.
- Reviews aparecem na mesma pagina com nota media e formulario de envio.
- Resultado comportamental público aparece abaixo dos links quando houver teste marcado como público para portfólio.

## Checklist de implementacao

- [x] Estado atual mapeado: `/{username}` renderiza portfolio primario; `/{username}/{pageSlug}` renderiza portfolio especifico.
- [x] Contrato documentado neste arquivo.
- [x] Schema Prisma e migração adicionam campos de oportunidade.
- [x] Validações e domínio autenticado salvam os novos campos.
- [x] Editor de perfil permite configurar abertura a oportunidades e motivação.
- [x] Hub público lista portfólios/currículos publicados e mostra dados básicos.
- [x] Hub público integra reviews e teste comportamental público.
- [x] Validações técnicas executadas.

## Validações executadas

- `npm run db:validate`
- `npm run typecheck`
- `npm run lint -- --quiet`
- `npm run test` (19 arquivos, 75 testes)
- `npx prettier --check` nos arquivos tocados pelo corte
- Busca por mojibake nos arquivos tocados (`Ãƒ`, `Ã‚`, `ï¿½`, `Æ’`, `Ã¢`) sem ocorrências.
- Dev server iniciado em `http://127.0.0.1:3000` e `GET /` retornou HTTP 200.

## Pendencias futuras

- Ordenação manual dos links do hub.
- Texto customizado por portfólio no hub.
- Gate de visibilidade por plano para campos sensiveis, se necessario.
