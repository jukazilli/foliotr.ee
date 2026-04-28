# Slice Atual

Status: ATUAL
Last updated: 2026-04-28

## Nome

Slice 0 - Contrato e auditoria do versionamento de portfolio.

## Modo de entrada

Slice.

O projeto ja existe e o pedido atual identifica uma lacuna estrutural entre perfil global e variacoes de portfolio. Este recorte nao implementa schema/runtime; ele fecha o contrato minimo para evitar misturar `/profile` com edicao de portfolio.

## Objetivo

Definir a separacao entre perfil global, portfolio, variacao, dados versionados e templates antes de implementar a nova jornada multi-step.

## Fontes de verdade

- Pedido atual do usuario em 2026-04-28.
- `docs/02_contratos/contrato-remaster-social-ui.md`.
- `docs/10_backlog/backlog-remaster-social-ui.md`.
- `docs/02_contratos/contrato-versionamento-portfolio.md`.
- `docs/10_backlog/backlog-versionamento-portfolio.md`.
- Codigo real em `app/`, `components/`, `lib/` e `prisma/schema.prisma`.
- Referencia Facebook via Playwright, se autenticada pelo usuario, apenas como referencia de navegacao e perfil.

## Contratos necessarios

- Contrato de separacao entre perfil global e portfolio.
- Contrato de snapshot editavel por `Version`.
- Contrato de editor multi-step da variacao.
- Contrato de nomes por cargo/role.
- Contrato de aplicacao de templates apenas em portfolios/curriculos.

## Lacunas

- Definir se `Version.profileSnapshot Json` sera o primeiro corte ou se ja normalizaremos tabelas por variacao.
- Definir se cada variacao tera experiencia principal obrigatoria.
- Definir regras de visibilidade padrao por secao.
- Definir migracao/fallback para variacoes existentes.
- Definir se o wizard publica automaticamente ou permite rascunho no ultimo passo.

## Backlog por dependencia

1. Contrato e auditoria do modelo atual.
2. Snapshot editavel por variacao.
3. Editor multi-step da variacao.
4. Nome por cargo e cards de portfolios.
5. Templates aplicados a variacao.
6. Compatibilidade e QA.

## Slice executado

Executado apenas o Slice 0.

Dentro:

- Auditoria do modelo `Profile`, `Version`, `Page` e snapshots.
- Contrato de versionamento de portfolio.
- Backlog por dependencia.

Fora:

- Alterar schema/runtime.
- Criar editor multi-step.
- Migrar variacoes existentes.
- Alterar publicacao de portfolios.

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
