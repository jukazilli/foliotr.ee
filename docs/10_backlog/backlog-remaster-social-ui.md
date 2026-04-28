# Backlog - Remaster Social UI

Status: active backlog  
Last updated: 2026-04-28  
Contrato base: `docs/02_contratos/contrato-remaster-social-ui.md`

## Slice 0 - Referencia e contrato visual

Status: ATUAL

Dependencias:

- Contrato documental inicial.
- Acesso Playwright parado na tela de login do Facebook para autenticacao manual do usuario, se a referencia externa for usada.

Escopo dentro:

- Capturar padroes de top bar, perfil, about, cards e navegacao.
- Documentar o que sera adaptado e o que nao sera copiado.
- Fechar decisao de `/dashboard`, card 2 do perfil publico e estrategia inicial de editor/template.

Escopo fora:

- Implementar shell.
- Alterar rotas.
- Migrar templates.

Evidencia:

- Documento de referencia visual ou decisao explicita de seguir sem ela.
- `slice-atual.md` atualizado com lacunas e criterios.

## Slice 1 - Onboarding de conta para perfil publico

Status: FECHADO em 2026-04-28

Dependencias:

- Slice 0.
- Decisao sobre campos minimos de perfil publico.

Escopo:

- Ajustar cadastro para criar conta e levar ao onboarding real.
- Reativar `/onboarding` como wizard progressivo.
- Marcar `onboardingDone` apenas apos completar minimo contratado.
- Redirecionar pos-login para o perfil do usuario ou onboarding pendente.

Evidencia:

- Cadastro cria conta com `onboardingDone = false`.
- `/onboarding` renderiza wizard real de perfil minimo.
- Conclusao do onboarding atualiza perfil, experiencia atual opcional e redireciona para `/{username}`.
- `npm run typecheck` executado sem erro.
- Busca de mojibake nos arquivos tocados executada sem ocorrencias.

## Slice 2 - Top bar social e descontinuidade de dashboard

Status: FECHADO em 2026-04-28

Dependencias:

- Slice 0.
- Decisao de compatibilidade para `/dashboard`.

Escopo:

- Substituir sidebar por top bar responsiva.
- Home aponta para `/{username}`.
- Ajustar `AppShell`, `Header` e navegacao.
- Redirecionar ou remover dashboard conforme decisao.

Evidencia:

- `AppShell` deixou de reservar espaco para sidebar.
- `Header` foi substituido por top bar responsiva com busca, logo, icones e menu da conta.
- Home da top bar aponta para `/{username}` quando ha username.
- `/dashboard` passou a redirecionar para `/{username}` ou `/profile`.
- Links internos de voltar/revalidar deixaram de usar `/dashboard`, salvo aliases de compatibilidade.
- `npm run typecheck` executado sem erro.
- Busca de mojibake nos arquivos tocados executada sem ocorrencias.

## Slice 3 - Perfil publico com capa e paridade do dono

Status: FECHADO em 2026-04-28

Dependencias:

- Slice 0.
- Banner/capa contratado no editor e query publica.

Escopo:

- Expor `bannerUrl` em queries e edicao.
- Recriar `/{username}` com capa, avatar, nome, headline e cards.
- Mostrar controles discretos apenas para dono logado.
- Preservar portfolios/curriculos em slides.

Evidencia:

- Query publica expoe `bannerUrl` e `user.id`.
- `/{username}` detecta dono logado via `auth()`.
- Hub publico renderiza capa, avatar, nome, headline, cards de sobre/portfolio/reviews e controles discretos para dono.
- Portfolios/curriculos publicados continuam renderizados como links para as rotas publicas existentes.
- Reviews continuam acessiveis no mesmo formulario publico.
- `npm run typecheck` executado sem erro.
- Busca de mojibake nos arquivos tocados executada sem ocorrencias.

## Slice 4 - Perfil/About editor

Status: FECHADO em 2026-04-28

Dependencias:

- Slice 3.
- Mapa de campos publicos e privados.

Escopo:

- Reorganizar `ProfileEditor` em lista de secoes + formulario contextual.
- Reduzir densidade de abas.
- Integrar capa/avatar e dados base.

Evidencia:

- `ProfileTabs` foi reorganizado para lista lateral + painel contextual.
- `bannerUrl` entrou no contrato de validacao, persistencia e carregamento do editor.
- `ProfileEditor` permite adicionar, trocar e remover capa publica a partir da galeria.
- Persistencia usa o endpoint existente de perfil, sem novo contrato paralelo.
- `npm run typecheck` executado sem erro.
- Busca de mojibake nos arquivos tocados executada sem ocorrencias.

## Slice 5 - Portfolios em grade com acoes iconicas

Status: FECHADO em 2026-04-28

Dependencias:

- Slice 2.

Escopo:

- Recriar `/portfolios` como grid de cards.
- Converter acoes principais para icones com tooltip/aria-label.
- Preservar publicacao, duplicacao, visualizacao e ownership.

Evidencia:

- `/portfolios` foi recriado como grid responsivo de cards.
- Acoes de publicar portfolio, publicar curriculo, criar variacao, editar e ver publico usam icones com `aria-label` e `title`.
- Server actions existentes foram preservadas.
- Estados sem portfolio e variacoes sem pagina continuam visiveis.
- `npm run typecheck` executado sem erro.
- Busca de mojibake nos arquivos tocados executada sem ocorrencias.

## Slice 6 - Templates sem dependencia de editor

Status: FECHADO em 2026-04-28

Dependencias:

- Slice 0.
- Estrategia de migracao Page/PageBlock/snapshots.

Escopo:

- Reformular `/templates` como galeria de aplicacao visual.
- Adaptar `portfolio-community` para o modelo atual de perfil/portfolio.
- Remover CTAs que mandam o usuario ao editor.
- Manter compatibilidade de dados existentes.

Evidencia:

- Aplicacao de template redireciona para `/portfolios`, nao para `/pages/{pageId}/editor`.
- Galeria `/templates` usa copy de linguagem visual e CTA `Aplicar modelo`.
- Template aplicado mostra CTA para ver portfolio, nao editar no editor tecnico.
- Detalhe `/templates/{slug}` descreve composicao/tipografia/ritmo visual, nao edicao de blocos.
- Busca por `editor`, `Editar portfolio`, `abre o editor`, `Abrir exemplo`, `Usar modelo` e `/pages/.*/editor` em `app/(app)/templates` nao retornou ocorrencias.
- `npm run typecheck` executado sem erro.
- Busca de mojibake nos arquivos tocados executada sem ocorrencias.

## Slice 7 - Depreciacao controlada do editor tecnico

Status: FECHADO em 2026-04-28

Dependencias:

- Slice 6.
- Auditoria de links internos para `/pages/{pageId}/editor`.

Escopo:

- Remover entradas de navegacao para editor.
- Definir redirect/404/legado interno para rotas tecnicas.
- Atualizar copy e docs.

Evidencia:

- `/pages` redireciona para `/portfolios?legacy=pages`.
- `/pages/{pageId}/editor` redireciona para `/portfolios?legacy=editor`.
- Links comuns para editar portfolio foram trocados por `/profile` ou `/portfolios`.
- `versionPortfolioAction` redireciona para `/portfolios?created=1`.
- Actions legadas do editor nao revalidam mais `/pages/{pageId}/editor`.
- `rg` por `/pages/.*editor`, `/editor`, `Editar portfolio` e `Voltar ao portfolio` em `app`, `components` e `lib` nao retornou ocorrencias fora dos componentes tecnicos excluidos.
- `npm run typecheck` executado sem erro.
- Busca de mojibake nos arquivos tocados executada sem ocorrencias.

## Slice 8 - QA integrado e fechamento

Dependencias:

- Slices 1 a 7.

Escopo:

- Validar jornada novo usuario -> onboarding -> perfil publico -> portfolio -> template.
- Validar dono logado e visitante anonimo.
- Executar typecheck, lint/testes possiveis, busca de mojibake e Playwright.

Evidencia:

- Matriz promessa versus evidencia.
- Status de fechamento por item.
