# Slice Atual

Status: ATUAL
Last updated: 2026-04-28

## Nome

Slice 1 - Adoção visual da tela de portfolios.

## Modo de entrada

Slice.

O projeto ja existe e o pedido atual define `prototipos-legados/spec-portifolios` como verdade de UI/UX para a tela de portfolios e para a direcao da shell autenticada. O backend real segue como verdade operacional.

## Objetivo

Aplicar a linguagem visual compacta do prototipo na shell autenticada e na tela `/portfolios`, mantendo actions e dados reais.

## Fontes de verdade

- Pedido atual do usuario em 2026-04-28.
- `docs/02_contratos/contrato-remaster-social-ui.md`.
- `docs/10_backlog/backlog-remaster-social-ui.md`.
- `docs/02_contratos/contrato-versionamento-portfolio.md`.
- `docs/10_backlog/backlog-versionamento-portfolio.md`.
- `docs/02_contratos/contrato-adocao-ui-spec-portifolios.md`.
- `prototipos-legados/spec-portifolios/src/App.tsx`.
- `prototipos-legados/spec-portifolios/src/index.css`.
- Codigo real em `app/`, `components/`, `lib/` e `prisma/schema.prisma`.
- Referencia Facebook via Playwright, se autenticada pelo usuario, apenas como referencia de navegacao e perfil.

## Contratos necessarios

- Contrato de separacao entre perfil global e portfolio.
- Contrato de snapshot editavel por `Version`.
- Contrato de editor multi-step da variacao.
- Contrato de nomes por cargo/role.
- Contrato de aplicacao de templates apenas em portfolios/curriculos.
- Contrato de adocao visual do prototipo sem quebrar backend real.

## Lacunas

- Definir se `Version.profileSnapshot Json` sera o primeiro corte ou se ja normalizaremos tabelas por variacao.
- Definir se cada variacao tera experiencia principal obrigatoria.
- Definir regras de visibilidade padrao por secao.
- Definir migracao/fallback para variacoes existentes.
- Definir se o wizard publica automaticamente ou permite rascunho no ultimo passo.
- O editor `/portfolios/{versionId}/edit` ainda nao existe; o link fica preparado para o proximo slice.
- A padronizacao de todas as telas do sistema deve acontecer por slices, nao neste corte.

## Backlog por dependencia

1. Adoção visual da shell e tela de portfolios.
2. Snapshot editavel por variacao.
3. Editor multi-step da variacao.
4. Nome por cargo e cards de portfolios.
5. Templates aplicados a variacao.
6. Expansao do padrao visual para templates, perfil e galeria.
7. Compatibilidade e QA.

## Slice executado

Executado apenas o Slice 1.

Dentro:

- Tokens globais inspirados no prototipo.
- Shell autenticada compacta mantendo logo real.
- `/portfolios` com lista compacta, filtros e menu de tres pontos.
- Remocao dos cards de metricas.

Fora:

- Criar editor multi-step.
- Migrar variacoes existentes.
- Alterar publicacao de portfolios.
- Recriar todas as telas do sistema.

## Skills/agentes a acionar

- `metodo-estrutural-integrado`
- `always-todo`
- `consistencia-documental`
- `playwright`, quando iniciar validacao visual do editor multi-step

Subagentes nao acionados: o usuario nao solicitou delegacao ou trabalho multiagente.

## Evidencias de fechamento

- `Version` observado como selecao de entidades vivas do `Profile`.
- `buildEditorSnapshot(profile, version)` observado como ponto que ainda recalcula snapshot a partir do perfil global.
- `/portfolios` observado com acao de editar apontando para `/profile`, misturando intencao de editar portfolio com perfil global.
- `docs/02_contratos/contrato-versionamento-portfolio.md` criado.
- `docs/10_backlog/backlog-versionamento-portfolio.md` criado.
- `docs/02_contratos/contrato-adocao-ui-spec-portifolios.md` criado.
- `app/(app)/portfolios/page.tsx` substituido por lista compacta baseada no prototipo e actions reais.
- `components/app/Header.tsx` e `components/app/AppShell.tsx` ajustados para shell compacta.
- `app/globals.css` atualizado com cores/tipografia do prototipo.
