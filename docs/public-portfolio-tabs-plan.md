# Public Portfolio Tabs Plan

Status: em implementacao
Data: 2026-04-27

## Objetivo

Otimizar as paginas publicas de portfolio acessadas a partir do hub `/{username}`. A pagina publicada deve deixar de parecer uma landing longa e passar a ser uma experiencia de leitura rapida em abas no topo: Apresentacao, Personalidade, Portfolio, Curriculo e Reviews, alem de um botao para voltar ao perfil.

## Decisoes de arquitetura

- A rota especifica `/{username}/{pageSlug}` passa a usar um renderer publico canonico em abas.
- O editor visual pode continuar usando os blocos/templates atuais como fonte de dados e preview enquanto o novo renderer publico consome os dados semanticamente resolvidos.
- O layout publico usa `h-screen` e `overflow-hidden` no shell principal para evitar rolagem geral vertical/horizontal.
- Cada aba deve caber na viewport disponivel; textos longos sao compactados/clampados em vez de criar uma pagina longa.
- Abas vazias sao ocultadas:
  - Personalidade so aparece se houver teste comportamental marcado como publico para portfolio.
  - Portfolio so aparece se houver projetos.
  - Curriculo aparece se houver experiencias, formacoes ou skills.
- Reviews aparece sempre para exibir media/formulario de envio.
- A aba Apresentacao e a home padrao da pagina, usando foto, headline/cargo e apresentacao resolvida.

## Fonte canonica de dados

- Apresentacao:
  1. `version.presentation.body`
  2. `version.customBio`
  3. `profile.defaultPresentation`
  4. `profile.bio`
  5. fallback do bloco about
- Personalidade: `selectBehavioralAnalysis(..., "portfolio")`.
- Portfolio: projetos selecionados/resolvidos por `derivePortfolioCommunitySemantics`.
- Curriculo: experiencias, formacoes e skills ja resolvidas pela semantica do template.
- Reviews: `getPublicReviewSummary(username)` e `submitPublicReviewAction`.

## Impactos

- `PublicTemplatePage` deixa de renderizar `TemplateRenderer` diretamente para visitantes e passa a renderizar o novo shell em abas.
- O antigo renderer de template continua disponivel para preview/editor e como camada interna, se necessario.
- O toolbar antigo de template/curriculo fica substituido pela tabbar do novo shell.
- A rota de curriculo dedicada `/{username}/{pageSlug}/resume` permanece como fallback/compartilhamento direto.

## Checklist de implementacao

- [x] Estado atual mapeado: pagina publica renderiza `PublicToolbar`, reviews no topo e `TemplateRenderer` longo.
- [x] Contrato documentado neste arquivo.
- [x] Criar renderer publico em abas com viewport fixa.
- [x] Conectar Apresentacao, Personalidade, Portfolio, Curriculo e Reviews aos dados canonicos.
- [x] Trocar `PublicTemplatePage` para usar o renderer em abas.
- [x] Preservar link de retorno para `/{username}`.
- [x] Validar typecheck, lint, testes e HTTP local.

## Validacoes executadas

- `npm run db:validate`
- `npm run typecheck`
- `npm run lint -- --quiet`
- `npm run test` (19 arquivos, 75 testes)
- `npx prettier --check` nos arquivos tocados pelo corte
- Busca por mojibake nos arquivos tocados (`Ãƒ`, `Ã‚`, `ï¿½`, `Æ’`, `Ã¢`) sem ocorrencias.
- `GET http://127.0.0.1:3000/juliano-zilli/v1` retornou HTTP 200.

## Pendencias futuras

- Modo mobile com gestos/atalhos de teclado.
- Configuracao de quais abas aparecem por portfolio.
- Preview fiel desse novo formato dentro do editor visual.
