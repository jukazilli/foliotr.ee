# Investigacao de Seguranca - LINKFOLIO

Data: 30/04/2026  
Branch: `improve-security`  
Modo: auditoria e plano de hardening, sem implementacao neste corte.

## Objetivo

Investigar a protecao atual do LINKFOLIO contra ataques comuns em aplicacoes web e banco de dados, com foco em:

- SQL injection e injecoes em geral.
- DDoS, abuso automatizado e consumo indevido de banco/API.
- Broken access control, CSRF, XSS e clickjacking.
- Upload malicioso.
- Vazamento de dados por erros, logs e respostas publicas.
- Dependencias vulneraveis.

## Fontes Consultadas

### Codigo e documentacao local

- `docs/10_backlog/improve-security.md`
- `docs/13_legado/pre-integrado-2026-04-27/setup.md`
- `docs/13_legado/pre-integrado-2026-04-27/mvp-executable-plan.md`
- `middleware.ts`
- `auth.ts`
- `next.config.mjs`
- `lib/env.ts`
- `lib/security/rate-limit.ts`
- `lib/security/authz.ts`
- `lib/server/api.ts`
- `lib/validations.ts`
- `app/api/**`
- `app/**/actions.ts`
- `lib/server/domain/**`
- `lib/storage/**`
- `prisma/schema.prisma`
- `package.json`

### Referencias externas

- OWASP Top 10 e OWASP Cheat Sheets.
- Next.js Security / Data Security / CSP docs.
- Prisma raw query e SQL injection prevention docs.
- Zod docs.
- Upstash Ratelimit docs.
- TanStack Form validation docs.

## Resumo Executivo

O LINKFOLIO ja tem uma base razoavel para MVP: usa Prisma Client, NextAuth, schemas Zod em varias bordas, ownership checks em dominios criticos, hash de senha com bcrypt, tokens de reset hasheados e rate limit local em rotas sensiveis.

Mas ainda nao esta "duro" para producao exposta na internet. Os principais gaps sao:

1. Rate limit em memoria, nao distribuido. Em ambiente serverless/horizontal, cada instancia tem seu proprio contador.
2. Ausencia de security headers globais no `next.config.mjs` ou middleware: CSP, frame-ancestors, HSTS, X-Content-Type-Options, Referrer-Policy, Permissions-Policy.
3. APIs e server actions mutaveis sem camada central de CSRF/origin guard.
4. Upload valida `file.type`, mas ainda nao valida assinatura real/magic bytes da imagem.
5. Nao ha limite central para tamanho de JSON/body em todas as APIs.
6. Busca de usuarios e varias mutacoes autenticadas nao tem rate limit.
7. `npm audit` encontrou 4 vulnerabilidades moderadas em dependencias transitivas.
8. Existem textos com mojibake em arquivos de seguranca/autenticacao, o que nao e vulnerabilidade direta, mas atrapalha UX e manutencao de mensagens.

## O Que Ja Protege

### Banco e SQL injection

Status: bom.

Evidencias:

- Nao foi encontrado uso de `$queryRaw`, `$executeRaw`, `Prisma.sql` ou raw SQL no codigo de aplicacao.
- Rotas e dominios usam Prisma Client com filtros estruturados.
- IDs sensiveis geralmente passam por `z.string().cuid()` ou owner checks via queries do tipo `where: { ..., profile: { userId } }`.

Conclusao:

- SQL injection classico esta bem mitigado porque o sistema usa ORM parametrizado.
- O risco aumenta se futuramente alguem introduzir raw SQL sem padrao seguro.

Controle recomendado:

- Criar uma regra/lint/documento: raw SQL proibido por padrao; se necessario, usar query parametrizada e review explicito.

### Validacao de entrada

Status: bom, mas irregular.

Evidencias:

- `lib/validations.ts` concentra schemas Zod para usuario, perfil, assets, portfolios, paginas e blocos.
- APIs como `/api/profile`, `/api/versions`, `/api/pages/*`, `/api/register`, `/api/reset-password` validam body com Zod.
- `lib/env.ts` valida envs com Zod.

Lacunas:

- Nem todas as rotas tem rate limit ou envelope seguro comum.
- Alguns schemas aceitam `z.record(safeJsonValueSchema)` para configs de blocos; isso e necessario para editor, mas precisa limite de profundidade/tamanho.
- Validacao com Zod nao substitui encoding de saida, CSP, authz, rate limit ou antivirus/upload scanning.

Resposta sobre Zod e TanStack:

- Voce esta parcialmente certo. Zod ajuda na seguranca porque valida dados nao confiaveis em runtime, reduz payload malformado e ajuda contra injecoes indiretas.
- TanStack Form ajuda mais na UX e validacao no cliente. Ele nao protege o servidor sozinho, porque qualquer atacante pode chamar a API sem usar o formulario.
- A regra correta: validacao de cliente e conforto; validacao de servidor e seguranca. Zod no servidor e mais importante para protecao.

### Autenticacao e autorizacao

Status: medio/bom.

Evidencias:

- `auth.ts` usa NextAuth Credentials com JWT.
- `AUTH_SECRET` exige minimo de 32 caracteres em `lib/env.ts`.
- `middleware.ts` protege rotas de app por cookie de sessao.
- Rotas API tambem chamam `auth()` antes de acessar dados.
- Dominios como versions/pages/assets usam ownership no banco.

Lacunas:

- Middleware verifica existencia do cookie, nao validade do token. Isso e aceitavel como filtro UX, mas nao e autorizacao.
- A autorizacao real precisa continuar em toda rota/action.
- Server actions usam `auth()`, mas nao ha helper central para rate limit/origin check.
- Role `DEVELOPER` existe, mas precisa governanca para atribuicao no banco.

### Rate limit atual

Status: insuficiente para producao.

Evidencias:

- `lib/security/rate-limit.ts` usa `Map` em memoria.
- Rotas protegidas:
  - login
  - register
  - forgot/reset password
  - public reviews
  - feedback tickets

Lacunas:

- In-memory nao funciona bem em varias instancias, deploy serverless ou restart.
- Busca de usuarios nao tem rate limit.
- Upload nao tem rate limit.
- Mutacoes de paginas, blocos, perfil e portfolios nao tem rate limit.
- Nao ha limite global por IP para `/api/*`.

Recomendacao:

- Trocar para rate limit distribuido com Redis/Upstash ou outro storage compartilhado.
- Manter fallback local apenas para desenvolvimento.

### XSS e renderizacao

Status: medio.

Evidencias:

- React escapa texto por padrao.
- Foi encontrado `dangerouslySetInnerHTML` apenas em JSON-LD do blog, com `JSON.stringify(jsonLd)`.
- Conteudo de usuario parece renderizado como texto/props, nao como HTML bruto.

Lacunas:

- Nao ha CSP.
- Campos de URL aceitam URL externa em algumas areas; isso precisa permitir apenas `http/https` e bloquear `javascript:` explicitamente sempre.
- Configs JSON de blocos precisam continuar sem HTML bruto.

### Uploads e assets

Status: medio.

Evidencias:

- `app/api/assets/upload/route.ts` exige auth.
- Valida mime type e tamanho via `lib/storage/policy.ts`.
- Nome salvo usa `randomUUID()`.
- `purpose` e limpo com regex.
- Proxy S3 rejeita key com `..`, barra inicial e backslash.

Lacunas:

- Confia em `file.type`, que vem do cliente.
- Nao valida magic bytes/assinatura real do arquivo.
- Permite GIF se configurado no mapa de extensao, mas default so permite jpeg/png/webp. GIF pode trazer mais risco se liberado.
- Nao ha reprocessamento de imagem para remover metadados.
- Nao ha rate limit em upload.

### Headers e configuracao HTTP

Status: fraco.

Evidencias:

- `next.config.mjs` configura imagens remotas, mas nao headers.
- Nao ha middleware aplicando headers de seguranca.

Lacunas prioritarias:

- `Content-Security-Policy`
- `X-Frame-Options` ou `frame-ancestors`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy`
- `Permissions-Policy`
- `Strict-Transport-Security` em producao HTTPS
- `Cross-Origin-Opener-Policy` e politicas relacionadas, se compativel

### CSRF

Status: medio/fraco.

Evidencias:

- NextAuth cobre seus proprios fluxos.
- Server Actions do Next.js tem protecao base por comparacao Origin/Host, mas isso nao cobre automaticamente route handlers customizados.
- APIs mutaveis usam cookies de sessao e aceitam `POST/PATCH/PUT/DELETE`.

Lacunas:

- Nao ha guard comum checando `Origin`/`Referer` nas APIs mutaveis.
- Nao ha token CSRF proprio para rotas API.
- Server actions nao usam helper comum de origem/rate limit.

### Dependencias

Status: requer acao.

Evidencia:

`npm audit --json` encontrou:

- `fast-xml-parser`, moderada, via `@aws-sdk/xml-builder`.
- `@aws-sdk/xml-builder`, moderada.
- `postcss`, moderada, via `next`.
- `next`, moderada por dependencia transitiva `postcss`; a sugestao automatica do npm parece incorreta/perigosa porque aponta downgrade major para `next@9.3.3`.

Recomendacao:

- Nao aplicar `npm audit fix --force` cegamente.
- Atualizar dependencias diretas de forma controlada: Next patch/minor compativel, AWS SDK patch/minor, PostCSS se aplicavel.
- Rodar `npm audit`, `npm run check` e smoke test apos cada atualizacao.

## Matriz de Risco

| Risco | Probabilidade | Impacto | Estado | Prioridade |
| --- | --- | --- | --- | --- |
| Rate limit local bypassado em producao | Alta | Alto | Gap real | P0 |
| Falta de security headers/CSP | Alta | Medio/Alto | Gap real | P0 |
| CSRF em APIs mutaveis | Media | Alto | Gap real | P0 |
| Upload por MIME falso | Media | Alto | Gap real | P1 |
| Dependencias moderadas | Media | Medio | Gap real | P1 |
| SQL injection via Prisma Client | Baixa | Alto | Mitigado | Monitorar |
| XSS via conteudo de usuario | Media | Alto | Parcialmente mitigado | P1 |
| Enum/abuso em busca de usuarios | Media | Medio | Gap real | P2 |
| DDoS volumetrico | Media | Alto | Fora do app puro | P0 infra |

## Plano de Acao por Slice

### Slice 1 - Foundation de headers e politica de origem

Objetivo:

- Criar baseline global contra XSS, clickjacking, MIME sniffing e vazamento de referrer.

Entregas:

- Adicionar `headers()` em `next.config.mjs` ou middleware dedicado.
- Headers minimos:
  - `X-Content-Type-Options: nosniff`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy` restritiva
  - `X-Frame-Options: DENY` ou CSP `frame-ancestors 'none'`
  - `Strict-Transport-Security` somente em producao HTTPS
- CSP inicial em modo conservador, com allowlist para assets atuais.

Criterios:

- App carrega sem bloquear imagens/scripts legitimos.
- Login, perfil, portfolio publico, upload e teste de interesses continuam funcionando.

### Slice 2 - Rate limit distribuido e guard comum

Objetivo:

- Reduzir abuso automatizado, credential stuffing e consumo de banco.

Entregas:

- Introduzir provider de rate limit:
  - producao: Upstash Redis ou Redis compativel;
  - dev/test: fallback em memoria.
- Criar helper central `requireRateLimit(scope, identifier, policy)`.
- Aplicar nas rotas:
  - auth/register/reset/login;
  - `/api/search/users`;
  - upload;
  - feedback;
  - reviews publicas;
  - mutacoes de pagina/blocos/profile/versions.
- Retornar `Retry-After` em 429.

Criterios:

- Testes unitarios do rate limit.
- Config sem Redis continua funcionando em dev.

### Slice 3 - CSRF/origin guard para mutacoes

Objetivo:

- Bloquear chamadas cross-site usando cookie da vitima.

Entregas:

- Criar helper `assertSameOriginMutation(request)`.
- Validar `Origin` ou `Referer` contra `NEXT_PUBLIC_APP_URL` e host atual.
- Aplicar em `POST/PATCH/PUT/DELETE` de route handlers.
- Mapear server actions e criar helper equivalente quando headers estiverem disponiveis.

Criterios:

- Mutacoes same-origin continuam funcionando.
- Request cross-origin simulado falha com 403.

### Slice 4 - Upload hardening

Objetivo:

- Reduzir risco de arquivo malicioso e storage abuse.

Entregas:

- Validar assinatura real de imagem com lib tipo `file-type`.
- Rejeitar arquivo cujo MIME declarado difere do MIME detectado.
- Considerar reprocessamento com `sharp` para jpeg/png/webp e remocao de metadados.
- Rate limit especifico para upload.
- Header seguro no proxy de assets:
  - `X-Content-Type-Options: nosniff`
  - `Content-Disposition: inline; filename="asset"`
  - cache ajustado.

Criterios:

- Upload valido continua funcionando.
- Arquivo renomeado com MIME falso e rejeitado.

### Slice 5 - Auditoria de autorizacao por recurso

Objetivo:

- Reduzir risco de broken access control.

Entregas:

- Criar matriz de rotas mutaveis e owner checks.
- Padronizar helpers `requireSessionUserId`, `getOwned*`, `assertResourceOwner`.
- Garantir que todo `pageId`, `versionId`, `assetId`, `projectId` seja resolvido com `userId`.
- Adicionar testes para acesso cruzado entre usuarios.

Criterios:

- Nenhuma rota depende apenas de ID vindo do cliente.
- Teste de usuario A tentando editar recurso do usuario B falha.

### Slice 6 - Limite de payload e JSON seguro

Objetivo:

- Evitar payload gigante, recursion abuse e custo excessivo de parse.

Entregas:

- Criar helper de leitura JSON com limite aproximado por `Content-Length`.
- Definir limite por rota:
  - auth: pequeno;
  - profile: medio;
  - editor/blocos: maior, mas finito.
- Limitar profundidade/tamanho dos `z.record(safeJsonValueSchema)` usados por blocos.

Criterios:

- Payload acima do limite retorna 413/400 antes de chegar no dominio.

### Slice 7 - Dependencias e supply chain

Objetivo:

- Remover vulnerabilidades conhecidas sem downgrade perigoso.

Entregas:

- Atualizar Next para patch/minor seguro dentro da linha 15.
- Atualizar AWS SDK.
- Verificar se PostCSS transitive foi resolvido.
- Rodar `npm audit`, `npm run check`.
- Adicionar rotina de audit em CI, pelo menos para `high/critical`.

Criterios:

- Zero high/critical.
- Moderadas justificadas ou resolvidas.

### Slice 8 - Observabilidade de abuso e logs seguros

Objetivo:

- Ver abuso sem vazar dados sensiveis.

Entregas:

- Log estruturado para 401/403/429 e upload rejeitado.
- Nao logar senha, token, reset URL, corpo completo de feedback ou dados pessoais sensiveis.
- Criar eventos de seguranca com scope, rota, userId opcional, ip hash e timestamp.

Criterios:

- Logs ajudam a investigar ataques sem expor segredo.

### Slice 9 - Infra anti-DDoS

Objetivo:

- Separar o que o app consegue bloquear do que precisa de borda.

Entregas:

- Documentar politica recomendada para Vercel/Cloudflare:
  - WAF;
  - bot fight/challenge;
  - rate limit por path;
  - bloqueio por pais/IP se necessario;
  - protecao de login e APIs caras.
- Definir limites para `/api/*`, `/api/assets/upload`, auth e search.

Criterios:

- Plano aplicavel no provedor escolhido.

## Bibliotecas Recomendadas

### Manter/fortalecer

- `zod`: manter como contrato de runtime no servidor.
- `bcryptjs`: aceitavel; avaliar `bcrypt` nativo ou Argon2 em corte futuro se o ambiente suportar bem.
- Prisma Client: manter como principal defesa contra SQL injection.

### Adicionar por prioridade

- `@upstash/ratelimit` e `@upstash/redis`: rate limit distribuido em producao.
- `file-type`: detectar tipo real do arquivo por magic bytes.
- `sharp`: reprocessar imagens e remover metadados, se compativel com deploy.
- Opcional: `server-only` para proteger modulos server-only em Next.js.

### Nao tratar como solucao de seguranca isolada

- TanStack Form: bom para formularios e UX, mas nao substitui validacao server-side.
- Validacao client-side em geral: util, mas todo controle de seguranca deve existir no servidor.

## Proximo Slice Recomendado

Comecar por Slice 1 + parte do Slice 2:

1. Adicionar headers globais seguros com CSP inicial.
2. Criar abstraction de rate limit distribuido com fallback local.
3. Aplicar primeiro em `/api/search/users`, upload e rotas de feedback/reviews.

Motivo:

- Sao protecoes de alto impacto e baixo acoplamento.
- Reduzem risco real antes de mexer em fluxos mais delicados.
- Criam base reutilizavel para os demais slices.
