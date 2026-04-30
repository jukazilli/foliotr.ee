# Security Hardening - Slice 2

## Objetivo

Substituir o rate limit exclusivamente local por uma camada que funciona com Redis/Upstash em producao e mantem fallback em memoria para desenvolvimento/testes.

## Checklist Always Todo

- [x] Contexto da task definido: abuso automatizado, DDoS em nivel de app e consumo indevido de banco/API.
- [x] Estado atual explorado: `lib/security/rate-limit.ts` usava apenas `Map` em memoria.
- [x] Regra/abordagem definida: `@upstash/ratelimit` quando envs existem; fallback local quando nao existem.
- [x] Implementacao concluida:
  - dependencias `@upstash/redis` e `@upstash/ratelimit`;
  - envs `UPSTASH_REDIS_REST_URL` e `UPSTASH_REDIS_REST_TOKEN`;
  - helper async `checkRateLimitAsync`;
  - headers `Retry-After`, `X-RateLimit-Remaining` e `X-RateLimit-Reset`;
  - helper `rateLimitResponse`;
  - aplicacao em auth, feedback, reviews, search, upload e mutacoes centrais de perfil/assets/pages/versions.
- [x] Validacao executada: `npm run typecheck` e ESLint focado nos arquivos alterados.
- [x] Textos e compatibilidade UTF-8 revisados: busca por mojibake sem ocorrencias nos arquivos novos/alterados da slice.
- [x] Memoria atualizada: este documento registra decisoes, envs e evidencias.

## Variaveis de Ambiente

```env
UPSTASH_REDIS_REST_URL=""
UPSTASH_REDIS_REST_TOKEN=""
```

Se essas variaveis estiverem vazias, o sistema usa o limitador em memoria. Esse fallback e adequado para desenvolvimento, mas nao para producao horizontal/serverless.

## Observacoes

- `npm install` reportou o mesmo grupo de 4 vulnerabilidades moderadas ja conhecido no plano de seguranca.
- Tambem houve aviso local de engine porque o Node atual e `22.12.0` e algumas dependencias pedem `22.13.0` ou `20.19.0+`. O `package.json` do projeto ja exige `>=20.19.0`.
