# Security Hardening - Slice 3

## Objetivo

Reduzir risco de CSRF em APIs mutaveis que usam cookie de sessao, bloqueando chamadas cross-origin antes de chegarem aos route handlers.

## Checklist Always Todo

- [x] Contexto da task definido: APIs `POST`, `PUT`, `PATCH` e `DELETE` precisam de guard de origem.
- [x] Estado atual explorado: `middleware.ts` ignorava `/api/*` e so fazia gate UX por cookie em paginas protegidas.
- [x] Regra/abordagem definida: middleware central para APIs mutaveis, com excecao para `/api/auth/*` gerenciado pelo NextAuth.
- [x] Implementacao concluida:
  - matcher agora inclui `/api/:path*`;
  - mutacoes API cross-origin retornam 403;
  - origem permitida usa `request.nextUrl.origin` e `NEXT_PUBLIC_APP_URL`;
  - fallback usa `Referer` e `Sec-Fetch-Site` quando `Origin` nao existe.
- [x] Validacao executada: `npm run typecheck` e ESLint focado em `middleware.ts`.
- [x] Textos e compatibilidade UTF-8 revisados: busca por mojibake sem ocorrencias.
- [x] Memoria atualizada: este documento registra decisoes e evidencias.

## Decisoes

- `GET` nao e bloqueado por este guard porque deve continuar servindo paginas/APIs publicas e leituras.
- `/api/auth/*` fica fora para evitar conflito com fluxos internos do Auth.js/NextAuth.
- Requests sem `Origin` e sem `Referer` continuam permitidos quando nao indicam `Sec-Fetch-Site: cross-site`; isso evita quebrar clientes server-to-server legitimos.

## Evidencias Esperadas

- `middleware.ts` alterado.
- `npm run typecheck`.
- ESLint focado em `middleware.ts`.
