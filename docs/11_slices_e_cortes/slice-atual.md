# Slice Atual

Status: ATUAL
Last updated: 2026-04-29

## Nome

Slice operacional 1 - Contratos de integrações e políticas técnicas.

## Modo de entrada

Slice.

A auditoria documental fechou governança, jornadas, módulos e remaster social UI, mas manteve lacunas operacionais sem contrato mínimo.

## Objetivo

Definir contratos mínimos para rate limit durável, política Gemini e política de `generated/prisma-client`, antes de qualquer implementação operacional.

## Fontes de verdade

- `docs/10_backlog/backlog-estrutural.md`.
- `docs/12_auditoria/inventario-e-auditoria-documental.md`.
- `lib/security/rate-limit.ts`.
- `lib/vocational-test/*`.
- `prisma/schema.prisma` e `generated/prisma-client/`.

## Contratos necessários

- Escolha de provider para rate limit durável ou decisão explícita de manter memória em ambiente local.
- Limites de custo/uso para Gemini e comportamento quando a chave não estiver configurada.
- Política para versionar ou ignorar `generated/prisma-client`.

## Lacunas

- Não há provider definido para rate limit durável.
- Não há política operacional final para Gemini.
- Não há decisão final para o Prisma Client gerado.

## Backlog por dependência

1. Contrato de rate limit durável.
2. Contrato operacional Gemini.
3. Decisão sobre `generated/prisma-client`.
4. Atualizar `docs/08_integracoes/`.
5. Implementar apenas o que tiver contrato fechado.

## Slice atual

Executar apenas contrato operacional antes de código.

Dentro:

- Documentar decisões e opções.
- Marcar itens bloqueados se faltarem escolhas de provider.
- Atualizar backlog estrutural.

Fora:

- Implementar Redis/Upstash/Vercel KV sem decisão.
- Alterar geração Prisma sem decisão.
- Alterar fluxo Gemini sem contrato.

## Skills/agentes acionados

- `metodo-estrutural-integrado`.
- `always-todo`.

Subagentes não acionados: o usuário não solicitou delegação ou trabalho multiagente.

## Evidências de fechamento esperadas

- Contrato em `docs/08_integracoes/`.
- Backlog estrutural atualizado.
- Busca por mojibake nos docs alterados.
