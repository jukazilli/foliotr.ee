# Slice Atual

Status: FECHADO  
Last updated: 2026-04-28

## Nome

Slice 8 - QA integrado e fechamento.

## Modo de entrada

Slice.

O projeto ja existe, a documentacao ativa ja foi integrada e o pedido atual e uma otimizacao incremental grande sobre navegacao autenticada, perfil publico, onboarding e templates. Este recorte executou apenas validacao integrada e fechamento documental.

## Objetivo

Validar os slices implementados, corrigir testes impactados pelo novo contrato de onboarding e registrar evidencias objetivas de fechamento.

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

Executado apenas o Slice 8.

Dentro:

- Validacoes estaticas.
- Ajuste dos testes de cadastro/onboarding ao novo contrato.
- Verificacao browser do perfil publico.
- Registro de evidencias.

Fora:

- Migrar dados historicos de `Page`/`PageBlock`.
- Adaptar internamente todo renderer `portfolio-community`.
- Deletar componentes tecnicos legados do editor.
- Testar fluxo autenticado completo em browser com login real.

## Skills/agentes a acionar

- `metodo-estrutural-integrado`
- `always-todo`
- `consistencia-documental`
- `playwright`, quando iniciar a referencia Facebook e validacao visual

Subagentes nao acionados: o usuario nao solicitou delegacao ou trabalho multiagente.

## Evidencias de fechamento

- `npm run typecheck` executado sem erro.
- `npm run lint` executado sem erro.
- `npm run test` executado sem erro apos atualizar testes de cadastro/onboarding.
- `npx prettier --check --ignore-unknown` executado nos arquivos tocados sem erro.
- Playwright carregou `http://127.0.0.1:3000/juliano-zilli`.
- Screenshot de verificacao publica: `social-ui-remaster-public-profile.png`.
- Dev server temporario encerrado.
- Busca de mojibake nos arquivos tocados executada sem ocorrencias.
