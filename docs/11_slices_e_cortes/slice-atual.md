# Slice Atual

Status: ATUAL
Last updated: 2026-04-28

## Nome

Slice 5 - Compatibilidade e QA.

## Modo de entrada

Auditoria.

O pacote funcional de versionamento ja foi implementado nos slices 1 a 4. Este recorte fecha evidencias automatizadas e registra limites reais do QA.

## Objetivo

Validar que schema, dominio, lint, testes e build continuam consistentes depois da introducao de `Version.profileSnapshot`, wizard de variacao, nomes por cargo e seed de template pelo snapshot.

## Fontes de verdade

- `docs/02_contratos/contrato-versionamento-portfolio.md`.
- `docs/10_backlog/backlog-versionamento-portfolio.md`.
- Commits do pacote na branch `feat/social-ui-remaster`.
- Testes automatizados em `tests/domain/versions-domain.test.ts`.
- Comandos de validacao executados localmente.

## Contratos necessarios

- Variacao possui snapshot independente.
- Wizard escreve em `Version.profileSnapshot`.
- Card usa cargo/headline como nome principal.
- Template e blocos consomem snapshot da variacao.
- Testes precisam refletir o novo contrato de criacao de `Version`.

## Lacunas

- QA browser autenticado nao foi executado por falta de sessao autenticada automatizada.
- Visibilidade granular por item/secao continua pendente.
- Depreciacao do editor tecnico legado continua pendente.

## Backlog por dependencia

1. Compatibilidade e QA.

## Slice executado

Executado apenas o Slice 5 do backlog de versionamento.

Dentro:

- `npm run db:migrate:status`.
- `npm run typecheck`.
- `npm run test`.
- `npm run lint`.
- `npm run build` ja executado nos slices funcionais e mantido como evidencia do pacote.
- Teste de dominio atualizado para esperar `profileSnapshot` em `createOwnedVersion`.
- Busca por mojibake e `git diff --check`.

Fora:

- Browser QA autenticado.
- Testes E2E novos.
- Implementar lacunas funcionais futuras.

## Skills/agentes acionados

- `metodo-estrutural-integrado`
- `always-todo`
- `consistencia-documental`

Subagentes nao acionados: o usuario nao solicitou delegacao ou trabalho multiagente.

## Evidencias de fechamento

- `npm run db:migrate:status`: schema atualizado.
- `npm run typecheck`: sem erro.
- `npm run test`: 20 arquivos, 79 testes passando.
- `npm run lint`: sem warnings.
- `tests/domain/versions-domain.test.ts` atualizado para o novo contrato.
- `git diff --check`: sem erro.
