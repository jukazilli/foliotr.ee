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

Dependencias:

- Slice 0.
- Decisao sobre campos minimos de perfil publico.

Escopo:

- Ajustar cadastro para criar conta e levar ao onboarding real.
- Reativar `/onboarding` como wizard progressivo.
- Marcar `onboardingDone` apenas apos completar minimo contratado.
- Redirecionar pos-login para o perfil do usuario ou onboarding pendente.

Evidencia:

- Criacao de conta validada em browser.
- Usuario novo cai no onboarding, nao no dashboard.
- Perfil publico minimo fica acessivel apos concluir.

## Slice 2 - Top bar social e descontinuidade de dashboard

Dependencias:

- Slice 0.
- Decisao de compatibilidade para `/dashboard`.

Escopo:

- Substituir sidebar por top bar responsiva.
- Home aponta para `/{username}`.
- Ajustar `AppShell`, `Header` e navegacao.
- Redirecionar ou remover dashboard conforme decisao.

Evidencia:

- Rotas autenticadas navegam pela top bar em desktop e mobile.
- `/dashboard` nao e mais destino primario.

## Slice 3 - Perfil publico com capa e paridade do dono

Dependencias:

- Slice 0.
- Banner/capa contratado no editor e query publica.

Escopo:

- Expor `bannerUrl` em queries e edicao.
- Recriar `/{username}` com capa, avatar, nome, headline e cards.
- Mostrar controles discretos apenas para dono logado.
- Preservar portfolios/curriculos em slides.

Evidencia:

- Visitante anonimo ve perfil sem controles privados.
- Dono logado ve mesma pagina com affordances de edicao.
- Reviews e portfolio continuam acessiveis.

## Slice 4 - Perfil/About editor

Dependencias:

- Slice 3.
- Mapa de campos publicos e privados.

Escopo:

- Reorganizar `ProfileEditor` em lista de secoes + formulario contextual.
- Reduzir densidade de abas.
- Integrar capa/avatar e dados base.

Evidencia:

- Edicoes persistem e aparecem no perfil publico.
- Navegacao por secoes funciona sem perder rascunho.

## Slice 5 - Portfolios em grade com acoes iconicas

Dependencias:

- Slice 2.

Escopo:

- Recriar `/portfolios` como grid de cards.
- Converter acoes principais para icones com tooltip/aria-label.
- Preservar publicacao, duplicacao, visualizacao e ownership.

Evidencia:

- Cards nao quebram layout com titulos longos.
- Acoes funcionam em desktop e mobile.

## Slice 6 - Templates sem dependencia de editor

Dependencias:

- Slice 0.
- Estrategia de migracao Page/PageBlock/snapshots.

Escopo:

- Reformular `/templates` como galeria de aplicacao visual.
- Adaptar `portfolio-community` para o modelo atual de perfil/portfolio.
- Remover CTAs que mandam o usuario ao editor.
- Manter compatibilidade de dados existentes.

Evidencia:

- Aplicar template altera apresentacao esperada sem exigir editor.
- Rotas publicas continuam renderizando portfolios existentes.

## Slice 7 - Depreciacao controlada do editor tecnico

Dependencias:

- Slice 6.
- Auditoria de links internos para `/pages/{pageId}/editor`.

Escopo:

- Remover entradas de navegacao para editor.
- Definir redirect/404/legado interno para rotas tecnicas.
- Atualizar copy e docs.

Evidencia:

- `rg "/editor"` mostra apenas legado controlado ou compatibilidade documentada.
- Usuario comum nao encontra editor tecnico no fluxo principal.

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
