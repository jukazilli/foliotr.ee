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
