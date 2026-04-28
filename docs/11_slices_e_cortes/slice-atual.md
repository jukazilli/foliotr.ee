# Slice Atual

Status: EM CONTRATO  
Last updated: 2026-04-28

## Nome

Slice 0 - Referencia e contrato visual do remaster social UI.

## Modo de entrada

Slice.

O projeto ja existe, a documentacao ativa ja foi integrada e o pedido atual e uma otimizacao incremental grande sobre navegacao autenticada, perfil publico, onboarding e templates. A entrega deve ser quebrada em slices.

## Objetivo

Fechar contrato minimo e backlog executavel para transformar o FolioTree de uma experiencia autenticada com aparencia de SaaS/sidebar/dashboard para uma experiencia social centrada no perfil publico do usuario.

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

## Slice atual

Executar apenas o Slice 0.

Dentro:

- Documentar contrato do remaster.
- Documentar backlog por slices.
- Preparar a captura de referencia visual.
- Registrar lacunas que bloqueiam implementacao.

Fora:

- Alterar UI de runtime.
- Remover dashboard.
- Remover editor.
- Migrar templates.
- Redesenhar perfil publico.

## Skills/agentes a acionar

- `metodo-estrutural-integrado`
- `always-todo`
- `consistencia-documental`
- `playwright`, quando iniciar a referencia Facebook e validacao visual

Subagentes nao acionados: o usuario nao solicitou delegacao ou trabalho multiagente.

## Evidencias de fechamento

- `docs/02_contratos/contrato-remaster-social-ui.md` criado.
- `docs/10_backlog/backlog-remaster-social-ui.md` criado.
- `docs/10_backlog/backlog-estrutural.md` atualizado.
- `docs/README.md` atualizado com novos documentos.
- Validacao documental executada.
- Proxima acao operacional registrada: abrir Playwright na tela de login do Facebook para autenticacao manual do usuario e documentar referencia visual.
