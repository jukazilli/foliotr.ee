# Slice Atual

Status: FECHADO  
Last updated: 2026-04-28

## Nome

Slice 1 - Onboarding de conta para perfil publico.

## Modo de entrada

Slice.

O projeto ja existe, a documentacao ativa ja foi integrada e o pedido atual e uma otimizacao incremental grande sobre navegacao autenticada, perfil publico, onboarding e templates. Este recorte executou apenas o fluxo cadastro -> onboarding -> perfil publico minimo.

## Objetivo

Separar criacao de conta da montagem do perfil, reativando `/onboarding` como wizard real e fazendo `onboardingDone` representar o fechamento do perfil minimo.

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

Executado apenas o Slice 1.

Dentro:

- Cadastro redireciona para `/onboarding`.
- Cadastro cria perfil com `onboardingDone = false`.
- `/onboarding` renderiza wizard autenticado.
- API de onboarding atualiza username, nome publico, headline, bio, localizacao, status de oportunidades e experiencia atual opcional.
- Conclusao redireciona para `/{username}`.

Fora:

- Remover dashboard.
- Remover editor.
- Migrar templates.
- Redesenhar perfil publico.
- Substituir sidebar por top bar.

## Skills/agentes a acionar

- `metodo-estrutural-integrado`
- `always-todo`
- `consistencia-documental`
- `playwright`, quando iniciar a referencia Facebook e validacao visual

Subagentes nao acionados: o usuario nao solicitou delegacao ou trabalho multiagente.

## Evidencias de fechamento

- `app/api/register/route.ts` agora cria perfil com onboarding pendente.
- `app/(auth)/register/page.tsx` redireciona novos usuarios para `/onboarding`.
- `app/(onboarding)/onboarding/page.tsx` carrega estado real do perfil e renderiza wizard.
- `components/onboarding/OnboardingWizard.tsx` criado.
- `app/api/onboarding/route.ts` atualiza o perfil minimo e experiencia atual opcional.
- `npm run typecheck` executado sem erro.
- Busca de mojibake nos arquivos tocados executada sem ocorrencias.
