# Improve Security

## Objetivo

Melhorar a seguranca do LINKFOLIO contra ataques comuns na internet, mantendo baixo impacto na experiencia do usuario e sem bloquear fluxos legitimos.

## Escopo Inicial

- Revisar headers de seguranca HTTP.
- Revisar protecoes contra CSRF, XSS e clickjacking.
- Revisar rate limits em rotas sensiveis.
- Revisar validacao de entrada em APIs publicas e autenticadas.
- Revisar exposicao de dados em paginas publicas, erros e logs.
- Revisar configuracao de cookies, sessoes e autenticacao.

## Criterios

- Mudancas pequenas e auditaveis por slice.
- Cada endurecimento deve ter motivacao clara e teste ou validacao equivalente.
- Nenhuma protecao deve quebrar rotas publicas, login, upload ou publicacao de portfolio sem evidencia.

## Status em 30/04/2026

Implementado na branch `improve-security`:

- Slice 1: headers globais de seguranca e CSP inicial.
- Slice 2: rate limit distribuido com Upstash Redis quando configurado e fallback local em desenvolvimento.
- Slice 3: bloqueio central de mutacoes `/api/*` cross-origin no middleware, com excecao para `/api/auth/*`.
- Slice 4: upload de imagens validado por assinatura real do arquivo com `file-type` e headers seguros no proxy de assets.

Validacoes executadas:

- `npm run db:validate`
- `npm run typecheck`
- `npm run lint`
- `npm run test`
- `npm audit --audit-level=high`

Pendencias:

- Resolver vulnerabilidades moderadas restantes com atualizacao controlada de dependencias, sem `audit fix --force`.
- Criar testes especificos para CSRF/origin guard e upload com MIME falso.
- Auditar autorizacao cruzada por recurso com testes de usuario A versus usuario B.
- Implementar limite central de tamanho/profundidade de payload JSON.
- Documentar e configurar WAF/rate limit de borda no provedor de deploy.
