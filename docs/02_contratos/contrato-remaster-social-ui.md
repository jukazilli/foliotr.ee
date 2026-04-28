# Contrato - Remaster Social UI

Status: draft contract  
Last updated: 2026-04-28  
Modo de entrada: Slice

## Objetivo

Remasterizar a experiencia autenticada e publica do FolioTree para abandonar a sensacao de SaaS administrativo e aproximar o produto de uma rede social/profissional centrada no perfil publico do usuario.

Este contrato nao autoriza implementacao completa em um unico corte. Ele define o acordo minimo para quebrar a entrega em slices verificaveis.

## Fontes de verdade

1. Pedido atual do usuario em 2026-04-28.
2. Codigo real do app em `app/`, `components/`, `lib/` e `prisma/schema.prisma`.
3. Documentacao ativa em `docs/00_governanca`, `docs/01_produto_e_briefing`, `docs/02_contratos`, `docs/03_fundacoes`, `docs/10_backlog` e `docs/11_slices_e_cortes`.
4. Legado em `docs/13_legado/pre-integrado-2026-04-27/`, apenas como historico.
5. Referencia Facebook, quando o usuario autenticar no Playwright, apenas para padroes de shell, navegacao e perfil. Nao e fonte de regra de negocio, copy, dados pessoais ou identidade visual literal.

## Realidade observada

- O cadastro atual ja e em passos, mas cria `Profile.onboardingDone = true` e redireciona para `/dashboard`.
- `/onboarding` existe, mas atualmente redireciona para `/dashboard`.
- A shell autenticada usa `Header` com sidebar desktop e padding lateral em `AppShell`.
- A navegacao principal ainda aponta para `/dashboard`, `/profile`, `/portfolios`, `/gallery`, `/templates`, `/settings` e rotas tecnicas.
- `/dashboard` existe como tela administrativa com cards e acoes rapidas.
- O perfil publico `/{username}` ja agrega perfil, portfolios publicados, reviews e teste vocacional, mas ainda nao usa capa/banner.
- `Profile.bannerUrl` existe no Prisma e snapshots, mas nao esta contratado no editor de perfil publico principal.
- Templates ainda dependem do modelo tecnico `Page`, `PageBlock`, renderer canonico e editor `/pages/{pageId}/editor`.
- A biblioteca `/templates` aplica template e pode redirecionar para editor.
- Existem textos visiveis com indicios de encoding quebrado em arquivos de UI. O remaster deve corrigir textos tocados e evitar propagar mojibake.

## Contratos de produto

### Cadastro e onboarding

- O cadastro deve reservar login, email, senha e dados basicos suficientes para criar a conta.
- Depois da conta criada, o usuario deve entrar em onboarding progressivo para completar perfil base, imagem de perfil, capa, experiencias, portfolio inicial e preferencias de visibilidade.
- `onboardingDone` so deve virar `true` quando o minimo de perfil publico estiver completo.
- O onboarding deve priorizar clareza para usuario novo, nao configuracao tecnica de editor.

### Shell social autenticada

- A navegacao autenticada deve usar top bar persistente, nao sidebar.
- A top bar deve conter logo, busca e atalhos por icones.
- Icone Home deve levar para a visao do proprio perfil publico do usuario.
- Icone Portfolio deve levar para a gestao de portfolios em grid.
- Icone Perfil deve levar para edicao de dados base em formato de lista lateral + formulario do item selecionado.
- Icone Galeria deve levar para imagens do usuario.
- Icone Templates deve levar para galeria de templates.
- Teste vocacional deve aparecer na shell quando estiver ativo/disponivel para o usuario.

### Perfil publico e visao do dono

- `/{username}` deve ser a experiencia central do produto.
- Visitante anonimo ve apenas conteudo publico e formulario de review quando permitido.
- Dono logado deve ver o mesmo perfil que visitantes veem, com controles discretos de edicao quando fizer sentido.
- O perfil deve ter capa, avatar, nome, profissao/headline e informacoes pessoais/profissionais organizadas em cards.
- A pagina publica deve preservar acesso a portfolios/curriculos publicados em formato de slides/tabs, sem refatorar esse renderer neste corte.

### Portfolio

- A area autenticada de portfolios deve ser uma grade de cards.
- Acoes de card devem ser iconicas e compactas.
- Publicacao, visualizacao e leitura de detalhes devem continuar respeitando ownership e status publicado.
- Os portfolios e curriculos publicados em formato de slides continuam corretos e ficam fora do remaster inicial.

### Perfil/About editor

- A edicao de perfil deve ser reorganizada em experiencia semelhante a "About": lista de secoes e formulario contextual.
- O usuario deve conseguir editar dados base, localizacao, status profissional, motivacao, experiencias, formacao, links, reviews e privacidade sem navegar por uma tela densa de abas.
- Campos que alimentam o perfil publico devem ter indicacao clara de visibilidade.

### Templates

- Templates devem deixar de ser apresentados como entrada para editor/preview tecnico.
- A selecao de template deve aplicar uma linguagem visual ou layout sobre o modelo atual de perfil/portfolio.
- Template `portfolio-community` deve ser adaptado para consumir o modelo atual de perfil, preservando tipografia, cores, ritmo visual e disposicao de conteudo.
- A remocao do editor nao pode quebrar portfolios publicados, snapshots, rotas publicas ou dados existentes.
- Rotas tecnicas de editor devem ser descontinuadas por compatibilidade planejada: redirecionar, esconder ou manter somente como legado interno ate migracao.

## Lacunas criticas

- Card 2 do perfil publico nao esta definido. O pedido define card 1 como dados pessoais/profissionais e card 3 como reviews.
- Falta decidir se `/dashboard` sera removido com redirect 301/302 para `/{username}` ou se vira alias interno temporario.
- Falta captura autorizada da referencia Facebook via Playwright autenticado pelo usuario.
- Falta decidir quais controles o dono ve em `/{username}` sem contaminar a experiencia publica.
- Falta estrategia de migracao para `Page`, `PageBlock`, editor e snapshots existentes.
- Falta contrato de busca da top bar: usuarios, portfolios, templates ou conteudo proprio.
- Falta definir se capa/avatar serao obrigatorios no onboarding ou opcionais com fallback visual.
- Falta corrigir encoding dos textos tocados durante cada slice.

## Contrato minimo para implementacao

Antes de alterar UI de runtime, o slice executor deve ter:

- referencia visual observada ou decisao documentada de seguir sem Facebook;
- decisao sobre comportamento de `/dashboard`;
- decisao sobre card 2 do perfil publico;
- mapa de rotas autenticadas alvo;
- estrategia de compatibilidade para links de editor/template;
- criterio de pronto verificavel em browser para desktop e mobile.

## Evidencias de fechamento esperadas

- Documento de referencia visual do slice, com observacoes objetivas.
- Rotas alteradas testadas em navegador.
- `npm run typecheck` sem regressao nova.
- Testes relevantes executados ou lacuna declarada.
- Busca de mojibake em arquivos alterados.
- Screenshots ou snapshot Playwright das telas principais do slice.
