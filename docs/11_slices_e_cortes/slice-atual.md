# Slice Atual

Status: FECHADO  
Last updated: 2026-04-28

## Nome

Slice 6 - Templates sem dependencia de editor.

## Modo de entrada

Slice.

O projeto ja existe, a documentacao ativa ja foi integrada e o pedido atual e uma otimizacao incremental grande sobre navegacao autenticada, perfil publico, onboarding e templates. Este recorte executou apenas a experiencia de selecao/aplicacao de templates.

## Objetivo

Remover a dependencia direta do editor tecnico na jornada de templates, tratando template como linguagem visual aplicada ao portfolio.

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

Executado apenas o Slice 6.

Dentro:

- Aplicacao de template redireciona para `/portfolios`.
- Galeria `/templates` usa copy de linguagem visual.
- CTA principal virou `Aplicar modelo`.
- Template aplicado leva para `/portfolios`.
- Detalhe do template descreve composicao/tipografia/ritmo visual.

Fora:

- Remover editor.
- Migrar dados historicos de `Page`/`PageBlock`.
- Adaptar internamente todo renderer `portfolio-community`.
- Remover rota tecnica `/pages/{pageId}/editor`.

## Skills/agentes a acionar

- `metodo-estrutural-integrado`
- `always-todo`
- `consistencia-documental`
- `playwright`, quando iniciar a referencia Facebook e validacao visual

Subagentes nao acionados: o usuario nao solicitou delegacao ou trabalho multiagente.

## Evidencias de fechamento

- `app/(app)/templates/actions.ts` redireciona aplicacao para `/portfolios`.
- `app/(app)/templates/page.tsx` remove copy/CTA de editor.
- `app/(app)/templates/[slug]/page.tsx` remove copy de edicao de blocos.
- `rg` em `app/(app)/templates` nao encontrou `editor`, `Editar portfolio`, `abre o editor`, `Abrir exemplo`, `Usar modelo` ou `/pages/.*/editor`.
- `npm run typecheck` executado sem erro.
- Busca de mojibake nos arquivos tocados executada sem ocorrencias.
