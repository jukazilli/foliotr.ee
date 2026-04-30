# Backlog - Remaster Social UI

Status: active backlog
Last updated: 2026-04-29
Contrato base: `docs/02_contratos/contrato-remaster-social-ui.md`

## Slice 16 - Perfil público Facebook-like: portfólios, dados e reviews

Status: FECHADO em 2026-04-29

Dependências:

- `components/public/PublicProfileHubPage.tsx`.
- `components/public/PublicPortfolioCarousel.tsx`.
- `components/public/PublicReviewsSection.tsx`.
- `app/[username]/review-actions.ts`.
- Regras já fechadas de reviews sem autoavaliação.

Escopo dentro:

- Remover CTA `Gerenciar portfólios` do topo do perfil.
- Remover card de currículo rápido da área pública.
- Trocar os cards `Sobre` e portfólio por uma seção `Meus Portfólios` em carrossel horizontal inspirado em `Pessoas que talvez você conheça`.
- Exibir cards de portfólio com capa, cargo/título, empresa quando houver e botão `Ver detalhes`.
- Criar bloco `Dados pessoais` com bio, localização, trabalho atual/headline e status de oportunidade em linguagem mais curta.
- Criar composer compacto de review ao lado de dados pessoais para visitantes, abrindo modal com estrelas, nome, cargo, empresa e texto.
- Manter reviews publicadas em seção dedicada de largura total no fim.

Escopo fora:

- Copiar classes ou assets internos do Facebook.
- Criar botão `Ver tudo` ou botão `X` nos cards.
- Criar novo schema de review.
- Implementar seletor controlado cidade/estado neste corte.

Lacunas:

- Não há biblioteca de cidade/estado instalada no projeto. A localização segue texto livre até um corte próprio de validação/localidade.

Evidência esperada:

- `npm run typecheck`.
- `npm run lint`.
- `git diff --check`.
- Busca de mojibake nos arquivos tocados.

Evidência de fechamento:

- `components/public/PublicProfileHubPage.tsx` removeu `Gerenciar portfólios`, substituiu os cards antigos por `Meus Portfólios`, `Dados pessoais` e composer de review.
- `components/public/PublicPortfolioCarousel.tsx` virou carrossel horizontal com cards de 222px inspirados em `Pessoas que talvez você conheça`, sem currículo rápido.
- `components/public/PublicReviewComposer.tsx` criou o modal de envio de review com estrelas, nome, cargo, empresa e texto.
- `components/public/PublicReviewsSection.tsx` ficou dedicado apenas às avaliações publicadas em largura total.
- `npm run typecheck`: sem erro.
- `npm run lint`: sem erro.
- `git diff --check`: sem erro.
- Busca de mojibake nos arquivos tocados: sem ocorrência.

## Slice 0 - Referencia e contrato visual

Status: FECHADO em 2026-04-29

Dependencias:

- Contrato documental inicial.
- Acesso Playwright parado na tela de login do Facebook para autenticacao manual do usuário, se a referencia externa for usada.

Escopo dentro:

- Capturar padroes de top bar, perfil, about, cards e navegação.
- Documentar o que sera adaptado e o que não sera copiado.
- Fechar decisão de `/dashboard`, card 2 do perfil público e estratégia inicial de editor/template.

Escopo fora:

- Implementar shell.
- Alterar rotas.
- Migrar templates.

Evidência:

- Documento de referencia visual ou decisão explicita de seguir sem ela.
- `slice-atual.md` atualizado com lacunas e criterios.
- Encerrado por supersessão documental em 2026-04-29: os slices 1 a 8 foram executados e fechados usando a decisão prática de seguir sem captura autenticada do Facebook, preservando apenas o contrato visual próprio do FolioTree.

## Slice 1 - Onboarding de conta para perfil público

Status: FECHADO em 2026-04-28

Dependencias:

- Slice 0.
- Decisão sobre campos mínimos de perfil público.

Escopo:

- Ajustar cadastro para criar conta e levar ao onboarding real.
- Reativar `/onboarding` como wizard progressivo.
- Marcar `onboardingDone` apenas apos completar minimo contratado.
- Redirecionar pos-login para o perfil do usuário ou onboarding pendente.

Evidência:

- Cadastro cria conta com `onboardingDone = false`.
- `/onboarding` renderiza wizard real de perfil minimo.
- Conclusao do onboarding atualiza perfil, experiência atual opcional e redireciona para `/{username}`.
- `npm run typecheck` executado sem erro.
- Busca de mojibake nos arquivos tocados executada sem ocorrências.

## Slice 2 - Top bar social e descontinuidade de dashboard

Status: FECHADO em 2026-04-28

Dependencias:

- Slice 0.
- Decisão de compatibilidade para `/dashboard`.

Escopo:

- Substituir sidebar por top bar responsiva.
- Home aponta para `/{username}`.
- Ajustar `AppShell`, `Header` e navegação.
- Redirecionar ou remover dashboard conforme decisão.

Evidência:

- `AppShell` deixou de reservar espaco para sidebar.
- `Header` foi substituido por top bar responsiva com busca, logo, ícones e menu da conta.
- Home da top bar aponta para `/{username}` quando ha username.
- `/dashboard` passou a redirecionar para `/{username}` ou `/profile`.
- Links internos de voltar/revalidar deixaram de usar `/dashboard`, salvo aliases de compatibilidade.
- `npm run typecheck` executado sem erro.
- Busca de mojibake nos arquivos tocados executada sem ocorrências.

## Slice 3 - Perfil público com capa e paridade do dono

Status: FECHADO em 2026-04-28

Dependencias:

- Slice 0.
- Banner/capa contratado no editor e query publica.

Escopo:

- Expor `bannerUrl` em queries e edição.
- Recriar `/{username}` com capa, avatar, nome, headline e cards.
- Mostrar controles discretos apenas para dono logado.
- Preservar portfólios/currículos em slides.

Evidência:

- Query publica expoe `bannerUrl` e `user.id`.
- `/{username}` detecta dono logado via `auth()`.
- Hub público renderiza capa, avatar, nome, headline, cards de sobre/portfólio/reviews e controles discretos para dono.
- Portfólios/currículos publicados continuam renderizados como links para as rotas públicas existentes.
- Reviews continuam acessíveis no mesmo formulário público.
- `npm run typecheck` executado sem erro.
- Busca de mojibake nos arquivos tocados executada sem ocorrências.

## Slice 4 - Perfil/About editor

Status: FECHADO em 2026-04-28

Dependencias:

- Slice 3.
- Mapa de campos publicos e privados.

Escopo:

- Reorganizar `ProfileEditor` em lista de secoes + formulário contextual.
- Reduzir densidade de abas.
- Integrar capa/avatar e dados base.

Evidência:

- `ProfileTabs` foi reorganizado para lista lateral + painel contextual.
- `bannerUrl` entrou no contrato de validacao, persistência e carregamento do editor.
- `ProfileEditor` permite adicionar, trocar e remover capa publica a partir da galeria.
- Persistencia usa o endpoint existente de perfil, sem novo contrato paralelo.
- `npm run typecheck` executado sem erro.
- Busca de mojibake nos arquivos tocados executada sem ocorrências.

## Slice 5 - Portfólios em grade com acoes iconicas

Status: FECHADO em 2026-04-28

Dependencias:

- Slice 2.

Escopo:

- Recriar `/portfolios` como grid de cards.
- Converter acoes principais para ícones com tooltip/aria-label.
- Preservar publicacao, duplicacao, visualizacao e ownership.

Evidência:

- `/portfolios` foi recriado como grid responsivo de cards.
- Ações de publicar portfólio, publicar currículo, criar variação, editar e ver público usam ícones com `aria-label` e `title`.
- Server actions existentes foram preservadas.
- Estados sem portfólio e variações sem página continuam visíveis.
- `npm run typecheck` executado sem erro.
- Busca de mojibake nos arquivos tocados executada sem ocorrências.

## Slice 6 - Templates sem dependencia de editor

Status: FECHADO em 2026-04-28

Dependencias:

- Slice 0.
- Estrategia de migracao Page/PageBlock/snapshots.

Escopo:

- Reformular `/templates` como galeria de aplicacao visual.
- Adaptar `portfolio-community` para o modelo atual de perfil/portfolio.
- Remover CTAs que mandam o usuário ao editor.
- Manter compatibilidade de dados existentes.

Evidência:

- Aplicação de template redireciona para `/portfolios`, não para `/pages/{pageId}/editor`.
- Galeria `/templates` usa copy de linguagem visual e CTA `Aplicar modelo`.
- Template aplicado mostra CTA para ver portfólio, não editar no editor técnico.
- Detalhe `/templates/{slug}` descreve composição/tipografia/ritmo visual, não edição de blocos.
- Busca por `editor`, `Editar portfólio`, `abre o editor`, `Abrir exemplo`, `Usar modelo` e `/pages/.*/editor` em `app/(app)/templates` não retornou ocorrências.
- `npm run typecheck` executado sem erro.
- Busca de mojibake nos arquivos tocados executada sem ocorrências.

## Slice 7 - Depreciação controlada do editor técnico

Status: FECHADO em 2026-04-28

Dependencias:

- Slice 6.
- Auditoria de links internos para `/pages/{pageId}/editor`.

Escopo:

- Remover entradas de navegação para editor.
- Definir redirect/404/legado interno para rotas tecnicas.
- Atualizar copy e docs.

Evidência:

- `/pages` redireciona para `/portfolios?legacy=pages`.
- `/pages/{pageId}/editor` redireciona para `/portfolios?legacy=editor`.
- Links comuns para editar portfólio foram trocados por `/profile` ou `/portfolios`.
- `versionPortfolioAction` redireciona para `/portfolios?created=1`.
- Actions legadas do editor não revalidam mais `/pages/{pageId}/editor`.
- `rg` por `/pages/.*editor`, `/editor`, `Editar portfólio` e `Voltar ao portfólio` em `app`, `components` e `lib` não retornou ocorrências fora dos componentes técnicos excluídos.
- `npm run typecheck` executado sem erro.
- Busca de mojibake nos arquivos tocados executada sem ocorrências.

## Slice 8 - QA integrado e fechamento

Status: FECHADO em 2026-04-28

Dependencias:

- Slices 1 a 7.

Escopo:

- Validar jornada novo usuário -> onboarding -> perfil público -> portfólio -> template.
- Validar dono logado e visitante anonimo.
- Executar typecheck, lint/testes possiveis, busca de mojibake e Playwright.

Evidência:

- `npm run typecheck` executado sem erro.
- `npm run lint` executado sem erro.
- `npm run test` executado sem erro apos atualizar testes de cadastro/onboarding para o novo contrato.
- `npx prettier --check --ignore-unknown` executado nos arquivos tocados sem erro.
- Playwright carregou `http://127.0.0.1:3000/juliano-zilli` com titulo `Juliano Zilli - FolioTree`.
- Screenshot de verificacao publica capturado em `social-ui-remaster-public-profile.png`.
- Dev server temporario encerrado apos a verificacao.

## Slice 9 - Refinamento UX do editor de perfil

Status: FECHADO em 2026-04-29

Dependencias:

- Slice 4 - Perfil/About editor.
- Slice 2 - Top bar social.
- Contrato atual do usuário em 2026-04-29 para reduzir explicação da UI e controlar rolagem interna.

Escopo dentro:

- Remover cabeçalho redundante do painel ativo (`Editando`, nome da seção).
- Fazer apenas o painel ativo do perfil rolar no desktop, mantendo navegação lateral e shell estáveis.
- Corrigir o reset de aba ao adicionar itens em coleções.
- Centralizar melhor os ícones da top bar autenticada.
- Corrigir textos visíveis tocados com acentuação quebrada.
- Adicionar colapso/expansão em listas de formações, experiências, projetos, links, reviews e grupos compactos.
- Limitar listas abertas a uma área com rolagem interna depois de aproximadamente 3 itens.

Escopo fora:

- Recriar todo o editor de perfil.
- Alterar modelo de dados, APIs ou regras de persistência.
- Criar busca funcional na top bar.
- Redesenhar as telas públicas.

Evidência esperada:

- `/profile` não exibe mais o cabeçalho redundante do painel ativo.
- Clicar em adicionar experiência/formação/projeto permanece na seção atual.
- Lista com vários itens usa colapso e rolagem interna.
- `npm run typecheck` e `npm run lint` sem regressão.
- Busca de mojibake nos arquivos tocados sem ocorrências.

Evidência de fechamento:

- Playwright em `/profile`: `hasEditando=false`, painel ativo com `overflowY=auto`, top bar centralizada e item novo de experiência aberto sem trocar a aba ativa.
- `npm run typecheck`: sem erro.
- `npm run lint`: sem erro.
- `git diff --check`: sem erro.

## Slice 10 - Reviews sem autoavaliação

Status: FECHADO em 2026-04-29

Dependências:

- Domínio de reviews públicas em `lib/server/domain/reviews.ts`.
- Action pública `app/[username]/review-actions.ts`.
- Proteções existentes: honeypot, rate limit por IP e limite de reviews pendentes.

Escopo dentro:

- Bloquear review quando o usuário autenticado for dono do perfil avaliado.
- Ocultar ou substituir o formulário de review para o dono logado nas telas públicas.
- Bloquear tentativas óbvias de autoavaliação anônima quando o email informado bater com email da conta ou email público do perfil.
- Adicionar rate limit também por email informado + perfil, quando houver email.
- Cobrir regra no teste de domínio de reviews.

Escopo fora:

- Verificação forte de identidade de visitante.
- Captcha, convite assinado, login obrigatório para reviewer ou reputação de reviewer.
- Migrar `Proof` para `Review`.
- Store durável de rate limit.

Evidência esperada:

- Testes de domínio cobrem bloqueio do dono autenticado e email do dono.
- `npm run test -- tests/domain/reviews-domain.test.ts`.
- `npm run typecheck`.
- Busca de mojibake nos arquivos tocados.

Evidência de fechamento:

- `tests/domain/reviews-domain.test.ts` cobre bloqueio do dono autenticado, bloqueio por email do dono e rate limit por email.
- Playwright em `http://localhost:3000/perf-audit` logado como dono: formulário de envio oculto e mensagem de moderação visível.
- `npm run test -- tests/domain/reviews-domain.test.ts`: 7 testes passando.
- `npm run typecheck`: sem erro.
- `npm run lint`: sem erro.
- `git diff --check`: sem erro.
