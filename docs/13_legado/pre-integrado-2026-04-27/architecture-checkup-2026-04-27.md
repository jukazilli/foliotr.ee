# Checkup geral de arquitetura

Data: 2026-04-27  
Escopo: arquitetura atual, fluxos de produto, arquivos possivelmente mortos, seguranca, documentacao e riscos de manutencao.  
Status: diagnostico para decisao posterior. Este documento nao aplica correcoes automaticamente.

## Checklist da auditoria

- [x] Mapear estrutura real do projeto e principais rotas.
- [x] Comparar documentacao existente com a implementacao atual.
- [x] Revisar fluxo de cadastro, perfil base, publicacao e pagina publica.
- [x] Identificar entradas duplicadas ou confusas de produto.
- [x] Identificar diretorios pesados, experimentais ou potencialmente mortos.
- [x] Revisar pontos de seguranca em auth, env, uploads, reviews e APIs.
- [x] Consolidar achados por severidade e impacto.
- [ ] Executar correcoes. Fora do escopo deste checkup.

## Resumo executivo

O produto hoje esta organizado como uma aplicacao Next.js fullstack no diretorio raiz, com App Router, NextAuth, Prisma, PostgreSQL e rotas internas em `app/api/*`. Essa arquitetura esta coerente com `docs/runtime-architecture-decision.md`.

O maior problema nao e a arquitetura de runtime, e sim a mistura de camadas e materiais no mesmo repositorio: existem prototipos pesados, documentacao antiga, codigo legado de Supabase, conceitos antigos de "provas", novas "reviews", `versions`, `pages`, `resumes` e `portfolios` competindo por clareza no backoffice.

O fluxo publico novo esta caminhando para a direcao correta:

```text
/{username} -> perfil central / hub
/{username}/{pageSlug} -> portfolio especifico com abas
/{username}/{pageSlug}/resume -> curriculo especifico
```

O fluxo autenticado ainda precisa de consolidacao:

```text
/profile -> fonte base dos dados
/templates -> cria/aplica template
/pages -> edita pagina tecnica
/portfolios -> gerencia publicacao
/versions -> lista versoes
/resumes -> gerencia curriculos
```

Essa separacao e tecnicamente explicavel, mas para o usuario parece haver varias portas para "criar um portfolio/curriculo". A recomendacao principal e transformar `Portfolios` no cockpit principal de saida publica e rebaixar `Pages`, `Versions` e `Resumes` para subfluxos, configuracoes ou telas internas.

## Mapa da arquitetura atual

### Runtime ativo

Arquitetura real:

```text
Browser
  -> Next.js App Router
  -> Server Components / Server Actions / app/api/*
  -> NextAuth
  -> Prisma Client gerado em generated/prisma-client
  -> PostgreSQL
  -> Storage local ou S3 compativel
```

Evidencias:

- `package.json` usa `next`, `next-auth`, `prisma`, `@aws-sdk/client-s3`, `bcryptjs` e `zod`.
- `build` executa `prisma generate && next build`.
- `auth.ts`, `middleware.ts`, `lib/server/app-viewer.ts` e `app/api/*` centralizam auth e dados.
- `docs/runtime-architecture-decision.md` registra Vercel fullstack como decisao aprovada.

### Dominios principais

- Identidade base: `User`, `Profile`.
- Conteudo base: `Experience`, `Education`, `Skill`, `Project`, `Achievement`, `ProfileLink`, `Asset`.
- Reviews: ainda persistidas no model `Proof`, com campos novos como `reviewerName`, `rating`, `isVisible`, `source`.
- Apresentacoes: `ProfilePresentation`, `Profile.defaultPresentationId`, `Version.presentationId`.
- Saidas publicas: `Version`, `Page`, `PageBlock`, `Template`, `ResumeConfig`.
- Teste comportamental: `VocationalTestSession`.

## Fluxo de produto atual

### Cadastro e entrada inicial

Estado atual:

- `/signup` redireciona para `/register`.
- `/register` cria usuario, profile e versao principal.
- `/onboarding` redireciona para `/dashboard`.
- `app/api/register/route.ts` cria `Profile` com `onboardingDone: true`.

Conclusao: nao ha mais duas entradas reais para criar perfil. A duplicidade antiga foi reduzida. Ainda existe `app/api/onboarding/route.ts`, mas a tela `/onboarding` nao usa mais esse endpoint.

Risco: endpoint e testes de onboarding podem permanecer como legado sem uso real. Isso confunde manutencao e pode levar a novas features usando um fluxo morto.

### Perfil base

Estado atual:

- `/profile` e a fonte principal para editar dados pessoais, experiencias, formacoes, projetos, links, reviews e apresentacoes.
- O perfil base alimenta o hub publico `/{username}`.
- Versoes selecionam subconjuntos e podem apontar para uma apresentacao especifica.

Conclusao: a ideia de "perfil base como fonte central" esta correta e consistente.

Risco: `Profile.bio`, `ProfilePresentation` e `Version.customBio` agora podem competir semanticamente. O sistema precisa deixar claro:

- `Profile.bio`: fallback curto ou bio base.
- `ProfilePresentation`: carta/apresentacao reutilizavel.
- `Version.customBio`: ajuste especifico da versao ou legado a migrar.

### Publicacao e saidas

Estado atual:

- `/templates` aplica um modelo a uma `Version`, cria/atualiza `Page` e `ResumeConfig`, depois manda para `/pages/{pageId}/editor`.
- `/pages` lista paginas e abre editor/curriculo.
- `/portfolios` lista paginas primarias das versoes, ativa/desativa portfolio e curriculo, e cria uma nova versao.
- `/versions` lista versoes, mas seus CTAs apontam de volta para `/portfolios`.
- `/resumes` lista configs de curriculo, mas tambem aponta para `/portfolios`.

Conclusao: tecnicamente ha uma modelagem aceitavel, mas a UX tem entradas sobrepostas. Para o usuario, "Pages", "Portfolios", "Versions" e "Resumes" parecem produtos diferentes quando na verdade sao facetas da mesma saida profissional.

Recomendacao:

1. Definir `Portfolios` como tela principal de publicacao.
2. Manter `Templates` como inicio de criacao.
3. Transformar `Pages` em area tecnica/editorial acessada por contexto, nao item primario de navegacao.
4. Transformar `Versions` em "variacoes" dentro de Portfolios.
5. Transformar `Resumes` em modo/configuracao dentro de cada portfolio. No produto, isso deve aparecer como curriculo: uma versao mais objetiva, com menos detalhes e leitura mais rapida.

### Publico

Estado atual:

- `/{username}` renderiza `PublicProfileHubPage`.
- `/{username}/{pageSlug}` renderiza `PublicTemplatePage`, que agora delega para `PublicPortfolioTabsPage`.
- `/{username}/{pageSlug}/resume` renderiza curriculo publico.
- Reviews aparecem no hub e na pagina com abas.

Conclusao: o fluxo publico esta alinhado com a direcao desejada. O hub central existe e os portfolios publicados sao listados nele.

Risco: o editor ainda usa `TemplateRenderer`, enquanto a pagina publica final usa `PublicPortfolioTabsPage`. Isso cria divergencia entre preview/editor e resultado publico.

## Achados por severidade

### P0 - Seguranca e producao

#### 1. Chave real de Gemini ja apareceu em arquivo de exemplo

Foi observado no historico recente que `.env.example` continha uma chave real `GEMINI_API_KEY`. A busca atual nao encontrou esse valor no repositorio, mas a chave deve ser considerada vazada.

Impacto:

- Uso indevido de cota/API.
- Risco de custo e abuso.

Recomendacao:

- Rotacionar a chave no provedor.
- Manter `.env.example` somente com placeholders.
- Adicionar validacao humana antes de commits que alterem `.env.example`.

#### 2. Rate limit em memoria nao protege producao serverless de forma confiavel

`lib/security/rate-limit.ts` usa `Map` em memoria. Isso funciona localmente e em uma instancia quente, mas nao e controle robusto em Vercel/serverless.

Endpoints afetados:

- Login via NextAuth credentials.
- `/api/register`.
- `/api/forgot-password`.
- `/api/reset-password`.
- Reviews publicas via server action `submitPublicReviewAction`.
- Teste vocacional com geracao Gemini.

Impacto:

- Brute force e spam distribuidos passam por instancias diferentes.
- Review publica pode ser usada para spam no banco.
- Gemini pode gerar custo sem controle fino se endpoints autenticados forem abusados.

Recomendacao:

- Migrar rate limit para store duravel ou edge-friendly, por exemplo Redis/Upstash/Vercel KV.
- Adicionar rate limit especifico para envio de review publica por IP + username + email.
- Adicionar limite de tamanho/contagem de reviews pendentes por perfil.

#### 3. Formulario publico de review nao tem anti-spam suficiente

`createPublicReview` cria registros `Proof` com `source: "public"` e `isVisible: false`, o que e correto para moderacao. Porem nao ha rate limit, captcha, honeypot ou bloqueio por volume.

Impacto:

- Crescimento descontrolado da tabela `Proof`.
- Ruido para o dono do perfil.
- Possivel abuso de email opcional armazenado.

Recomendacao:

- Adicionar campo honeypot simples.
- Rate limit duravel.
- Limite diario por perfil.
- Tela de moderacao clara para aprovar/ocultar.

### P1 - Arquitetura e produto

#### 4. Backoffice tem quatro nomes para o mesmo processo de saida publica

`Portfolios`, `Pages`, `Versions` e `Resumes` existem como telas de primeiro nivel ou quase primeiro nivel.

Impacto:

- Usuario pode nao entender onde comecar.
- Implementacoes futuras podem duplicar fluxo de criacao/publicacao.
- Testes e documentacao ficam mais dificeis.

Recomendacao:

- Navegacao primaria: `Inicio`, `Perfil`, `Portfolios`, `Galeria`, `Teste`, `Ajustes`.
- Remover `Pages`, `Versions` e `Resumes` da navegacao primaria.
- Manter rotas tecnicas se necessario, mas acessadas a partir do portfolio.

#### 5. Editor e pagina publica nao renderizam mais a mesma experiencia

O editor usa `components/templates/TemplateRenderer.tsx` e o renderer `PortfolioCommunityRenderer`. A pagina publica especifica usa `PublicPortfolioTabsPage`.

Impacto:

- Preview pode prometer uma coisa e o visitante ver outra.
- Ajustes de layout publico podem nao aparecer no editor.
- QA visual fica duplicado.

Recomendacao:

- Criar um modo de preview publico com abas dentro do editor.
- Ou documentar explicitamente que `TemplateRenderer` e apenas fonte semantica/visual para edicao, nao preview final.

#### 6. `Proof` continua sendo o model de reviews

O banco ainda usa `Proof` para reviews. Isso foi pragmatico para entrega rapida, mas agora "provas" foi substituido por "reviews" no produto.

Impacto:

- Nomes internos divergem do produto.
- Novos desenvolvedores podem reintroduzir "proofs" na UI.
- Queries e relacoes `VersionProof` ficam semanticamente confusas.

Recomendacao:

- Curto prazo: documentar `Proof == Review` como alias tecnico temporario.
- Medio prazo: migrar para `Review` e `VersionReview`, ou isolar `Proof` atras de um repositorio `reviews.ts` sem vazar o nome.

#### 7. Documentacao historica conflita com a arquitetura real

`README.md` e `docs/mvp-architecture.md` ainda descrevem conceitos antigos como workspace `apps/web`, API separada, Clerk e rotas `/app/*`. A decisao atual esta em `docs/runtime-architecture-decision.md`.

Impacto:

- Onboarding tecnico confuso.
- AIs e pessoas podem propor solucoes erradas.
- Risco de reintroduzir arquitetura Render/API sem necessidade.

Recomendacao:

- Marcar `docs/mvp-architecture.md`, `docs/mvp-executable-plan.md` e `docs/mvp-technical-audit.md` como historicos ou superseded.
- Atualizar README raiz para refletir Next.js fullstack root app.
- Criar `docs/current-architecture.md` como fonte canonica curta.

### P2 - Higiene de repositorio e arquivos possivelmente mortos

#### 8. Diretorios experimentais pesados no repositorio

Tamanhos aproximados encontrados:

- `prototipos-legados/landing-test`: 21.955 arquivos, 599,95 MB.
- `apps`: 288 arquivos, 234,31 MB.
- `prototipos-legados/redesign-teste`: 33 arquivos, 26,42 MB.
- `generated`: 20 arquivos, 21,83 MB.
- `output`: 23 arquivos, 2,19 MB.
- `prototipos-legados/editor-otimizacao`: 66 arquivos, 0,35 MB.
- `prototipos-legados/orientacao-profissional-app`: 23 arquivos, 0,07 MB.
- `packages`: 10 arquivos, 0,05 MB.

Classificacao sugerida:

- `prototipos-legados/landing-test`: referencia visual pesada; deve sair do repo principal ou virar submodule/arquivo externo.
- `prototipos-legados/redesign-teste`: referencia historica; manter somente assets usados em `public/redesign`.
- `prototipos-legados/editor-otimizacao`: referencia de editor; manter fora do typecheck/lint ou arquivar.
- `prototipos-legados/orientacao-profissional-app`: prototipo ja incorporado no app real; pode ser arquivado fora do repo.
- `apps` e `packages`: parecem heranca da arquitetura monorepo antiga; revisar e remover se nao houver uso ativo.
- `output`: artefatos de QA/logs/screenshots; nao deveria permanecer como area versionada permanente.

Impacto:

- Buscas `rg` retornam ruido.
- Ferramentas de format/lint/test ficam mais lentas ou precisam de muitos excludes.
- Risco de commits acidentais com logs/assets grandes.

Recomendacao:

- Criar uma pasta `references/` ignorada ou mover para storage externo.
- Atualizar `.gitignore`, `.eslintignore`, `.prettierignore` de forma consistente.
- Manter no repo principal apenas assets realmente usados por runtime ou testes.

#### 9. Supabase esta presente mas nao e arquitetura ativa

`package.json` inclui `@supabase/ssr` e `@supabase/supabase-js`. Existem arquivos em `utils/supabase/*`, mas a aplicacao real usa NextAuth + Prisma + S3/local storage.

Status em 2026-04-27: resolvido na branch `chore/architecture-optimization-slices`. Os helpers `utils/supabase/*`, as dependencias `@supabase/ssr` e `@supabase/supabase-js`, e as variaveis publicas `NEXT_PUBLIC_SUPABASE_*` foram removidos. Supabase permanece documentado apenas como possivel endpoint S3 compativel via `STORAGE_S3_*`.

Impacto:

- Dependencias desnecessarias.
- Confusao sobre auth/storage.
- Possivel uso acidental de variaveis `NEXT_PUBLIC_SUPABASE_*`.

Recomendacao:

- Remover `utils/supabase/*` e dependencias se nao houver plano ativo.
- Se Supabase for usado apenas como endpoint S3 compativel, documentar isso em storage, nao como auth/client Supabase.

#### 10. `generated/prisma-client` versionado e pesado

O Prisma Client e gerado em `generated/prisma-client`. O build tambem roda `prisma generate`.

Impacto:

- Churn de arquivos gerados.
- Possiveis locks no Windows.
- Busca e auditoria ficam poluidas.
- Risco de divergencia entre schema e client gerado.

Recomendacao:

- Avaliar voltar para client gerado em `node_modules/.prisma/client`.
- Se for necessario manter output customizado, documentar o motivo e ignorar buscas/lint/format por padrao.

### P3 - Qualidade, testes e consistencia

#### 11. Middleware nao lista todas as rotas autenticadas

`middleware.ts` protege `/dashboard`, `/profile`, `/versions`, `/pages`, `/resumes`, `/templates`, `/settings`, `/teste-vocacional/app`.

Rotas autenticadas atuais como `/gallery` e `/portfolios` nao estao na lista. Elas ainda passam pelo layout `(app)`, que chama `getAppShellViewer()` e redireciona anonimos, entao nao parece ser uma falha de seguranca critica. Mas e inconsistente.

Impacto:

- UX de redirect menos previsivel.
- Testes incompletos.
- Falsa sensacao de cobertura no middleware.

Recomendacao:

- Adicionar `/gallery` e `/portfolios` a `PROTECTED_PREFIXES`.
- Atualizar `tests/auth/protected-routes.test.ts`.
- Documentar que middleware e UX gate; autorizacao real fica em server pages/actions/APIs.

#### 12. `format:check` e ignores parecem inconsistentes

`.prettierignore` tem `prototipos-legados/design-system-legado`, enquanto o diretorio real e `prototipos-legados/design-system-legado`. Tambem ha muitos diretorios experimentais que precisam ficar fora de formatacao.

Impacto:

- `npm run check` pode falhar por arquivos historicos.
- Dificulta separar problema real de ruido.

Recomendacao:

- Corrigir `prototipos-legados/design-system-legado` para `prototipos-legados/design-system-legado`.
- Adicionar excludes consistentes para `prototipos-legados/landing-test`, `prototipos-legados/redesign-teste`, `output`, `apps`/`packages` se forem historicos.
- Rodar formatacao por escopo antes de tentar formatar o repo todo.

#### 13. `components/blocks` contem placeholders antigos

`components/blocks/index.ts` mapeia `achievements`, `proof` e `contact` para componentes genericos como `AboutBlock`/`LinksBlock`.

Impacto:

- Se algum fluxo voltar a usar `BLOCK_REGISTRY`, secoes podem renderizar conteudo errado.
- Confunde a relacao entre renderer antigo e novo renderer semantico.

Recomendacao:

- Confirmar se `components/blocks` e legado ou base ativa.
- Se legado, marcar como compatibilidade.
- Se ativo, substituir placeholders por componentes reais ou remover tipos nao suportados.

#### 14. Favicon dinamico pode transformar erro simples em 500

`app/favicon.ico/route.ts` le `public/favicon.svg` e responde como `image/svg+xml`.

Impacto:

- Se a leitura falhar, favicon retorna 500.
- A rota se chama `.ico`, mas serve SVG.

Recomendacao:

- Preferir `app/icon.svg` ou `public/favicon.ico/svg` estatico conforme padrao Next.
- Se manter rota dinamica, adicionar fallback e tratamento de erro.

## Arquivos e pastas a revisar antes de remover

Nao remover automaticamente. Validar com git history, deploy e referencias de docs.

| Caminho                                           | Status provavel                         | Acao sugerida                                                 |
| ------------------------------------------------- | --------------------------------------- | ------------------------------------------------------------- |
| `prototipos-legados/landing-test/`                | referencia externa pesada               | movido para pasta de legados; nao e runtime                   |
| `prototipos-legados/apps/`                        | heranca monorepo/artefato antigo        | movido para pasta de legados; sem runtime ativo               |
| `prototipos-legados/packages/`                    | heranca monorepo/artefato antigo        | movido para pasta de legados; sem runtime ativo               |
| `prototipos-legados/redesign-teste/`              | referencia visual historica             | movido para pasta de legados; referencia visual               |
| `prototipos-legados/editor-otimizacao/`           | referencia de UX do editor              | movido para pasta de legados; nao e editor paralelo           |
| `prototipos-legados/orientacao-profissional-app/` | prototipo incorporado                   | movido para pasta de legados; referencia do teste vocacional  |
| `prototipos-legados/design-system-legado/`        | design system estatico antigo           | movido para pasta de legados; substituido pelo redesign atual |
| `output/`                                         | logs/screenshots de QA                  | ignorar ou limpar                                             |
| `utils/supabase/`                                 | codigo nao usado pela arquitetura atual | remover junto das dependencias Supabase                       |
| `generated/prisma-client/`                        | gerado                                  | decidir se deve ser versionado                                |
| `app/api/onboarding/route.ts`                     | legado possivel                         | manter so se houver plano de onboarding futuro                |

## Recomendacao de arquitetura alvo

### Produto

```text
Perfil base
  -> Dados pessoais
  -> Experiencias
  -> Formacoes
  -> Projetos
  -> Skills
  -> Reviews
  -> Apresentacoes
  -> Teste comportamental

Portfolios
  -> Versao para uma vaga/contexto
  -> Apresentacao selecionada
  -> Template aplicado
  -> Portfolio web publicado
  -> Curriculo publicado

Publico
  -> /{username}
  -> /{username}/{pageSlug}
  -> /{username}/{pageSlug}/resume
```

### Navegacao recomendada

- Inicio
- Perfil
- Portfolios
- Galeria
- Teste comportamental
- Ajustes

Telas tecnicas:

- `/pages/{pageId}/editor`: aberta a partir de um portfolio.
- `/pages/{pageId}/resume`: aberta a partir de um portfolio.
- `/versions`: remover da navegacao ou transformar em aba interna.
- `/resumes`: remover da navegacao ou transformar em filtro/modo dentro de portfolios.

## Plano sugerido de correcao

### Fase 1 - Baixo risco

- [x] Atualizar README raiz e criar `docs/current-architecture.md`.
- [x] Marcar docs antigas como historicas.
- [x] Corrigir `.prettierignore`.
- [x] Adicionar `/gallery` e `/portfolios` ao middleware e testes.
- [x] Documentar `Proof` como backing tecnico temporario de Reviews.
- [x] Remover ou arquivar `utils/supabase` se confirmado que nao ha uso.

### Fase 2 - Fluxo de produto

- [x] Consolidar navegacao em torno de `Perfil` e `Portfolios`.
- [x] Rebaixar `Pages`, `Versions` e `Resumes` para subfluxos.
- [x] Revisar copy dos CTAs para deixar claro: criar portfolio, editar, publicar, ver publico.
- [x] Alinhar preview do editor com o layout publico em abas.

### Fase 3 - Seguranca e escala

- [ ] Rotacionar a chave Gemini vazada.
- [ ] Implementar rate limit duravel.
- [x] Proteger review publica contra spam.
- [x] Adicionar limites por perfil para reviews pendentes.
- [ ] Revisar custo e limites do Gemini.

### Fase 4 - Limpeza de repositorio

- [x] Mover prototipos e legados para `prototipos-legados/`.
- [x] Auditar/remover `apps` e `packages`.
- [ ] Decidir politica para `generated/prisma-client`.
- [x] Isolar `output` como artefato local ignorado.

## Conclusao

O projeto nao precisa de uma troca grande de stack agora. A decisao de Next.js fullstack continua fazendo sentido para o MVP.

O que precisa de atencao e fechamento de produto e governanca do repositorio:

1. Uma entrada clara para criar e publicar portfolio.
2. Um perfil base como unica fonte de dados.
3. Reviews com protecao anti-spam e nomenclatura consistente.
4. Documentacao atualizada para impedir retorno de arquiteturas antigas.
5. Remocao/isolamento de prototipos e artefatos grandes.

Se essas frentes forem tratadas antes de novas features grandes, o projeto fica mais facil de evoluir sem acumular fluxos paralelos.
