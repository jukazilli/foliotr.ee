# Slice Atual

Status: ATUAL
Last updated: 2026-04-29

## Nome

Slice 13 - Identidade versionada completa.

## Modo de entrada

Slice/Corte.

## Objetivo

Expandir a aba `Identidade` do editor de versão para carregar o estado atual do perfil mestre e permitir edição/exclusão no contexto da versão, sem alterar os dados base.

## Fontes de verdade

- `docs/10_backlog/backlog-portfolio-versionado-ui.md`.
- `components/portfolios/PortfolioVariationWizard.tsx`.
- `lib/server/domain/page-snapshots.ts`.
- `lib/server/domain/versions.ts`.
- `lib/server/domain/includes.ts`.
- `components/profile/ProfileEditor.tsx`.
- `app/(app)/portfolios/[versionId]/edit/actions.ts`.

## Contratos necessários

- A versão deve partir de uma cópia do estado atual do perfil mestre.
- Edição de identidade deve persistir em `Version.profileSnapshot`.
- Exclusão dentro da versão remove do snapshot/seleção da versão, não do perfil mestre.
- Dados base permanecem intactos em `/profile`.

## Lacunas

- A UI atual da aba `Identidade` ainda edita apenas campos básicos.
- Itens repetíveis ainda dependem das relações `Version*` para seleção e do snapshot para copy.
- Reviews precisam de decisão específica: moderar/mostrar continua sendo regra do perfil, mas a versão pode escolher exibir ou ocultar.

## Backlog por dependência

1. Mapear campos do snapshot que entram em `Identidade`.
2. Definir controles compactos para dados básicos e listas.
3. Persistir remoções/edições sem tocar dados base.
4. Atualizar snapshots publicados e currículo.
5. Validar TypeScript, lint e mojibake.

## Slice atual

Dentro:

- Planejar e implementar a primeira versão da UI de identidade completa.
- Reusar padrões do editor de perfil onde fizer sentido.
- Manter persistência isolada em versão.

Fora:

- Alterar schema sem necessidade objetiva.
- Remover capa do perfil base.
- Reescrever todo o editor de portfólio.

## Skills/agentes acionados

- `metodo-estrutural-integrado`.
- `always-todo`.

Subagentes não acionados: não houve pedido de delegação multiagente.

## Evidências de fechamento esperadas

- UI mostra dados do perfil mestre no editor da versão.
- Alterações salvam apenas na versão.
- `npm run typecheck`.
- `npm run lint`.
- `git diff --check`.
- Busca de mojibake nos arquivos tocados.
