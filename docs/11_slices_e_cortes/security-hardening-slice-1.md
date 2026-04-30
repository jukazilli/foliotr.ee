# Security Hardening - Slice 1

## Objetivo

Adicionar uma base global de headers de seguranca HTTP para reduzir risco de XSS, clickjacking, MIME sniffing, abuso de permissoes do navegador e vazamento de referrer.

## Checklist Always Todo

- [x] Contexto da task definido: hardening global em `next.config.mjs`.
- [x] Estado atual explorado: nao havia headers globais de seguranca.
- [x] Regra/abordagem definida: headers globais via `headers()` do Next.js.
- [x] Implementacao concluida: CSP inicial, frame protection, nosniff, referrer, permissions, COOP e HSTS apenas em producao.
- [x] Validacao executada: `npm run typecheck` e import ESM do `next.config.mjs`.
- [x] Textos e compatibilidade UTF-8 revisados: busca por mojibake sem ocorrencias.
- [x] Memoria atualizada: este documento registra decisoes e evidencias.

## Decisoes

- A CSP inicial e conservadora, mas ainda permite `unsafe-inline` e `unsafe-eval` porque o app Next atual pode depender disso em desenvolvimento e em partes do runtime.
- `frame-ancestors 'none'` e `X-Frame-Options: DENY` bloqueiam embed externo.
- `Strict-Transport-Security` fica restrito a producao para nao atrapalhar desenvolvimento local.

## Evidencias Esperadas

- `next.config.mjs` alterado.
- `npm run typecheck` sem erro.
- `npm run lint -- --file` nao se aplica ao config ESM; validar com lint geral ou sintaxe via build/check posterior.
