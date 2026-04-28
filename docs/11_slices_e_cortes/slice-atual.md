# Slice Atual

Status: FECHADO  
Last updated: 2026-04-28

## Nome

Slice 2 - Top bar social e descontinuidade de dashboard.

## Modo de entrada

Slice.

O projeto ja existe, a documentacao ativa ja foi integrada e o pedido atual e uma otimizacao incremental grande sobre navegacao autenticada, perfil publico, onboarding e templates. Este recorte executou apenas a troca da shell autenticada para top bar e a retirada de `/dashboard` como destino primario.

## Objetivo

Substituir a navegacao autenticada com sidebar por uma top bar social e fazer `/dashboard` funcionar apenas como rota de compatibilidade que encaminha o usuario ao proprio perfil.

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

Executado apenas o Slice 2.

Dentro:

- `AppShell` sem padding/sidebar.
- `Header` refeito como top bar responsiva.
- Home da top bar aponta para `/{username}` quando ha username.
- `/dashboard` redireciona para `/{username}` ou `/profile`.
- Links internos de voltar/revalidar deixam de tratar `/dashboard` como destino primario.

Fora:

- Remover editor.
- Migrar templates.
- Redesenhar perfil publico.
- Recriar pagina publica com capa.
- Recriar portfolios em grid.

## Skills/agentes a acionar

- `metodo-estrutural-integrado`
- `always-todo`
- `consistencia-documental`
- `playwright`, quando iniciar a referencia Facebook e validacao visual

Subagentes nao acionados: o usuario nao solicitou delegacao ou trabalho multiagente.

## Evidencias de fechamento

- `components/app/AppShell.tsx` sem estado de sidebar.
- `components/app/Header.tsx` substituido por top bar social.
- `components/app/navigation.ts` atualizado para compatibilidade sem dashboard primario.
- `app/(app)/dashboard/page.tsx` redireciona para perfil do usuario.
- `app/(app)/versions/page.tsx` e `app/(app)/portfolios/actions.ts` deixaram de apontar para dashboard como destino operacional.
- `npm run typecheck` executado sem erro.
- Busca de mojibake nos arquivos tocados executada sem ocorrencias.
