# Slice Atual

Status: FECHADO
Last updated: 2026-04-29

## Nome

Slice 14 - Identidade versionada: seleção compacta e consulta.

## Modo de entrada

Slice/Corte.

## Objetivo

Otimizar a aba `Identidade` da edição de portfólio para perfis com muitas experiências, formações, projetos e apresentações, mantendo a seleção da versão compacta, consultável e sem alterar os dados base.

## Fontes de verdade

- `docs/10_backlog/backlog-portfolio-versionado-ui.md`.
- `components/portfolios/PortfolioVariationWizard.tsx`.
- `app/(app)/portfolios/[versionId]/edit/page.tsx`.
- `app/(app)/portfolios/[versionId]/edit/actions.ts`.
- `lib/server/domain/versions.ts`.

## Contratos necessários

- Cada coleção da aba `Identidade` deve poder expandir e recolher.
- Listas grandes devem rolar dentro da própria seção.
- Checkbox marca ou desmarca o item que entra na versão.
- Clique no título consulta detalhes do item em popup.
- Apresentações entram na mesma seleção da identidade versionada.
- Uma versão pode ter no máximo uma apresentação selecionada.
- Salvar a seleção não altera registros base do perfil.

## Lacunas

- Edição textual granular de itens versionados ainda precisa de contrato de patch no `profileSnapshot`.
- Reviews continuam como seleção/visibilidade por versão; edição do texto original segue fora do contrato.

## Backlog por dependência

1. Fechar seleção compacta e consulta de itens.
2. Definir contrato de edição textual granular no snapshot.
3. Implementar patch textual por coleção.
4. Validar que dados base não mudam.

## Slice fechada

Dentro:

- Seções colapsáveis com chevron.
- Rolagem interna por seção.
- Popup de consulta de detalhes.
- Seleção única de apresentação com disclaimer.
- Persistência de `presentationId` na versão.

Fora:

- Alterar schema.
- Editar texto dos itens dentro do snapshot.
- Editar reviews públicas originais.
- Remover capa do perfil base.

## Skills/agentes acionados

- `metodo-estrutural-integrado`.
- `always-todo`.

Subagentes não acionados: não houve pedido de delegação multiagente.

## Evidências de fechamento esperadas

- `npm run typecheck`.
- `npm run lint`.
- `git diff --check`.
- Busca de mojibake nos arquivos tocados.

## Próxima slice

Slice 16 - Identidade versionada: edição textual granular.

Status: BACKLOG.
