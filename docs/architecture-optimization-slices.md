# Architecture optimization slices

Branch: `chore/architecture-optimization-slices`  
Fonte: `docs/architecture-checkup-2026-04-27.md`  
Status: plano operacional para implementar as otimizacoes sem misturar fluxo de produto, arquitetura e layout.

## Objetivo

Executar as otimizacoes do checkup de arquitetura por cortes pequenos, verificaveis e reversiveis.

O alvo principal e simplificar o produto em torno de:

```text
Perfil base -> Portfolios -> Pagina publica / Curriculo rapido
```

Sem quebrar:

- layout em grids de 12, 16 ou 18 colunas;
- escala visual dos componentes;
- preview/editor;
- rotas publicas ja existentes;
- publicacao de portfolio e curriculo;
- dados base do usuario.

## Regras de layout obrigatorias

Estas regras valem para todas as slices com UI.

- Nao trocar grids existentes por `w-screen`, `scale-*`, `zoom`, `transform: scale(...)` ou wrappers globais.
- Nao aumentar fonte base global, `html`, `body`, `app-shell`, `main` ou tokens globais para resolver problema local.
- Nao remover `minmax(0, 1fr)` de grids existentes.
- Nao remover `min-w-0`, `overflow-hidden`, `truncate`, `line-clamp` ou constraints similares sem substituto.
- Nao criar cards dentro de cards para resolver agrupamento.
- Nao transformar tabelas/listas densas em cards gigantes sem necessidade.
- Manter componentes de backoffice com densidade operacional: headings compactos, acoes claras, linhas escaneaveis.
- Qualquer grid novo com muitas colunas deve usar tracks nomeadas ou formula equivalente a:

```text
grid-template-columns: repeat(12, minmax(0, 1fr))
grid-template-columns: repeat(16, minmax(0, 1fr))
grid-template-columns: repeat(18, minmax(0, 1fr))
```

- Em telas publicas com viewport fechado, todo painel precisa ter:
  - `min-h-0` em filhos de grid/flex;
  - overflow controlado no painel, nao no body;
  - imagem com `object-fit` definido;
  - texto limitado por `line-clamp` ou area rolavel interna.
- Validar visualmente em pelo menos:
  - desktop largo: 1440x900;
  - desktop menor: 1280x720;
  - mobile: 390x844.

## Regra de nomenclatura

O produto deve falar em portugues claro:

- `Portfolio`: pagina web completa e especifica para um contexto/vaga.
- `Curriculo`: versao mais rapida, objetiva e com menos detalhes, derivada do mesmo portfolio/versao.
- `Versao`: variacao interna de dados para um objetivo.
- `Pagina`: entidade tecnica/editorial, nao deve ser entrada primaria para o usuario comum.
- `Reviews`: nome publico e de UI.
- `Proof`: somente backing tecnico temporario, enquanto nao houver migracao para `Review`.

Observacao: o checkup tem uma anotacao manual sobre `resumes` significar curriculos. A implementacao deve seguir essa regra: no produto, "curriculo" nao e uma segunda pagina concorrente, e sim um modo rapido de leitura associado ao portfolio.

## Slices

### Slice 0 - Baseline e protecoes

Objetivo: preparar o terreno sem mudar fluxo de produto.

Status: concluida em 2026-04-27.

Arquivos provaveis:

- `middleware.ts`
- `tests/auth/protected-routes.test.ts`
- `.prettierignore`
- `docs/current-architecture.md`
- `README.md`
- `docs/architecture-checkup-2026-04-27.md`

Checklist:

- [x] Confirmar branch ativa.
- [x] Corrigir mojibake ou anotacoes soltas em docs tocadas.
- [x] Corrigir `.prettierignore` para `docs/Design System`.
- [x] Adicionar `/gallery` e `/portfolios` em `PROTECTED_PREFIXES`.
- [x] Atualizar teste de rotas protegidas.
- [x] Criar doc curta da arquitetura atual.
- [x] Marcar docs antigas como historicas ou superseded sem apagar contexto.

Provas:

- Branch ativa: `chore/architecture-optimization-slices`.
- Protecao atualizada em `middleware.ts`.
- Teste atualizado em `tests/auth/protected-routes.test.ts`.
- Arquitetura atual documentada em `docs/current-architecture.md`.
- README raiz atualizado para npm, Next.js fullstack, NextAuth e Prisma.
- Docs antigas marcadas como historicas: `docs/mvp-architecture.md`, `docs/mvp-executable-plan.md`, `docs/mvp-technical-audit.md`.
- `docs/README.md` agora aponta para `docs/current-architecture.md`.

Validacao:

- `npm run typecheck`
- `npm run test -- tests/auth/protected-routes.test.ts`
- `npx prettier --check README.md docs/current-architecture.md docs/architecture-checkup-2026-04-27.md`

Risco:

- Baixo. Mudancas pequenas e sem schema.

### Slice 1 - Navegacao primaria e mapa de produto

Objetivo: reduzir entradas duplicadas sem remover rotas tecnicas.

Status: concluida em 2026-04-27.

Arquivos provaveis:

- `components/app/navigation.ts`
- `components/app/Header.tsx`
- `components/app/Sidebar.tsx`
- `app/(app)/dashboard/page.tsx`
- `app/(app)/portfolios/page.tsx`
- `app/(app)/pages/page.tsx`
- `app/(app)/versions/page.tsx`
- `app/(app)/resumes/page.tsx`

Decisao:

- Navegacao primaria deve ficar: Inicio, Perfil, Portfolios, Galeria, Teste, Ajustes.
- Templates pode continuar como biblioteca, mas a criacao deve ser apresentada dentro do fluxo de Portfolios.
- Pages, Versions e Resumes devem sair da navegacao primaria.
- Rotas tecnicas continuam funcionando para deep links e editor.

Checklist:

- [x] Atualizar `appNavigation` sem quebrar active state de rotas filhas.
- [x] Garantir que `/pages/*`, `/versions/*` e `/resumes/*` ainda tenham label contextual quando abertas por link direto.
- [x] Ajustar copy do dashboard para apontar para Portfolios como cockpit.
- [x] Ajustar empty states para evitar "escolha uma versao" como primeira instrucao ao usuario.
- [x] Trocar "resume" visivel para "curriculo" quando a UI estiver em portugues.

Provas:

- `components/app/navigation.ts` coloca Portfolios antes de Galeria e mapeia `/pages`, `/versions` e `/resumes` para o item ativo de Portfolios.
- `app/(app)/dashboard/page.tsx` passa a tratar Portfolios como saida principal e curriculos como modo rapido.
- `app/(app)/portfolios/page.tsx` descreve a tela como cockpit de publicacao.
- `app/(app)/pages/page.tsx`, `app/(app)/versions/page.tsx` e `app/(app)/resumes/page.tsx` foram reposicionadas como telas tecnicas/subordinadas.
- Nao houve alteracao em grid global, largura de sidebar, escala base, `html`, `body` ou reset do app shell.

Guardrails de layout:

- Nao aumentar largura da sidebar.
- Nao aumentar altura dos links de navegacao.
- Manter header mobile com overflow horizontal controlado.
- Em 1280px, nenhum item deve empurrar a busca ou conta para fora da viewport.

Validacao:

- `npm run typecheck`
- `npm run lint -- --quiet` se o script aceitar escopo; se nao, `npm run lint`.
- Browser em `/dashboard`, `/portfolios`, `/pages`, `/versions`, `/resumes`.
- Screenshot 1440x900 e 390x844 do app shell.

Risco:

- Medio. Alterar navegacao pode esconder rotas ainda necessarias se CTAs nao forem ajustados.

### Slice 2 - Portfolios como cockpit principal

Objetivo: transformar `/portfolios` na tela principal de criacao, publicacao e leitura de status.

Status: concluida em 2026-04-27.

Arquivos provaveis:

- `app/(app)/portfolios/page.tsx`
- `app/(app)/portfolios/actions.ts`
- `app/(app)/templates/page.tsx`
- `app/(app)/templates/[slug]/page.tsx`
- `app/(app)/templates/actions.ts`
- `components/app/primitives.tsx`

Experiencia alvo:

- Mostrar portfolios ativos e rascunhos.
- Mostrar se cada portfolio tem:
  - pagina web publicada;
  - curriculo publicado;
  - apresentacao selecionada;
  - template aplicado;
  - ultima atualizacao.
- CTA primario: criar novo portfolio.
- Acoes por item:
  - editar portfolio;
  - publicar/despublicar pagina web;
  - publicar/despublicar curriculo rapido;
  - ver publico;
  - criar variacao.

Checklist:

- [x] Reorganizar `PortfoliosPage` sem alterar dominio de `Version/Page/ResumeConfig`.
- [x] Manter toggles atuais de publicacao.
- [x] Tornar "Novo portfolio" o inicio claro, encaminhando para templates quando necessario.
- [x] Reduzir dependencia conceitual de `/pages` na copy.
- [x] Garantir que curriculo seja explicado como modo rapido de leitura.
- [x] Revalidar paths publicos apos publicacao.

Provas:

- `app/(app)/portfolios/page.tsx` agora exibe resumo operacional, portfolios ativos/rascunhos, curriculos rapidos, apresentacoes e variacoes sem pagina.
- Acoes existentes de publicar/despublicar portfolio, publicar/despublicar curriculo e criar variacao foram preservadas.
- `app/(app)/templates/page.tsx` passa a se posicionar como etapa de escolha de modelo para portfolio.
- Nenhuma server action, schema Prisma ou contrato publico foi alterado nesta slice.
- Nao houve uso de `scale`, `zoom`, wrappers globais, alteracao de fonte base ou mudanca no reset do app shell.

Guardrails de layout:

- Lista deve continuar densa; evitar card gigante por portfolio.
- Em desktop largo, se usar grid/tabela, preferir 12/16/18 tracks com `minmax(0, 1fr)`.
- Em mobile, cada item pode virar bloco vertical, mas sem headings hero-scale.
- Nao usar `text-5xl` ou superior em cards de backoffice.

Validacao:

- `npm run typecheck`
- `npm run test -- tests/domain/versions-domain.test.ts`
- Browser em `/portfolios` com estados vazios e populados.
- Verificar que links publicos continuam em `/{username}/{pageSlug}`.

Risco:

- Medio/alto. Esta e a slice que mais mexe em fluxo percebido pelo usuario.

### Slice 3 - Editor e preview publico com abas

Objetivo: reduzir divergencia entre editor e pagina publica final.

Status: concluida em 2026-04-27.

Arquivos provaveis:

- `components/pages/CanonicalPageEditor.tsx`
- `components/templates/TemplateRenderer.tsx`
- `components/public/PublicPortfolioTabsPage.tsx`
- `components/public/PublicTemplatePage.tsx`
- `docs/public-portfolio-tabs-plan.md`

Decisao inicial:

- Nao substituir o editor inteiro.
- Adicionar um modo de preview ou aviso claro: "preview do portfolio publicado".
- Reusar `PublicPortfolioTabsPage` somente se os dados necessarios estiverem disponiveis sem duplicar query ou quebrar interacao do editor.

Checklist:

- [x] Mapear props disponiveis no editor versus props exigidas pelo public tabs.
- [x] Decidir entre preview real em abas ou preview tecnico documentado.
- [x] Se criar preview em abas, encapsular em componente especifico para nao afetar runtime publico.
- [x] Validar que editor nao ganha zoom ou escala artificial.
- [x] Garantir que canvas/preview mantenha limites e nao estoure horizontalmente.

Execucao:

- `PublicPortfolioTabsPage` nao foi reutilizado dentro do editor porque exige `username`, `pageSlug`, `reviewSummary`, analise comportamental opcional e usa `h-screen`, o que poderia quebrar o painel interno do editor.
- `components/pages/CanonicalPageEditor.tsx` ganhou `EditorPublicTabsPreview`, um espelho compacto das abas publicas: Apresentacao, Personalidade, Portfolio, Curriculo rapido e Reviews.
- O titulo do painel mudou para "Preview do portfolio publicado" e o modo de curriculo passou a aparecer como "Curriculo rapido".
- A escala existente do canvas foi preservada: o preview continua usando wrapper compensado com largura/altura calculadas, sem novo `scale()`.
- Nenhuma mudanca foi feita em `TemplateRenderer`, `PublicPortfolioTabsPage` ou no runtime publico nesta slice.

Guardrails de layout:

- Nao usar `scale()` para "fazer caber" sem wrapper com dimensao compensada.
- Se houver preview responsivo, usar container com width/max-width fixos e overflow interno.
- Preservar `min-h-0` nos paineis do editor.
- Nao alterar `app-shell .block` reset sem teste visual amplo.

Validacao:

- `npm run typecheck`
- Browser em `/pages/{pageId}/editor`.
- Screenshot desktop 1440x900 e 1280x720 do editor.
- Conferir upload/galeria se tocar no editor.

Risco:

- Alto. Editor e uma superficie grande e sensivel.

### Slice 4 - Reviews: anti-spam e isolamento sem migracao de schema

Objetivo: proteger reviews publicas e esconder o nome `Proof` atras do dominio de reviews.

Status: concluida em 2026-04-27.

Arquivos provaveis:

- `lib/server/domain/reviews.ts`
- `app/[username]/review-actions.ts`
- `components/public/PublicReviewsSection.tsx`
- `components/public/PublicPortfolioTabsPage.tsx`
- `lib/security/rate-limit.ts`
- `lib/validations.ts`

Checklist:

- [x] Adicionar honeypot no formulario publico.
- [x] Adicionar limite de reviews pendentes por perfil.
- [x] Adicionar rate limit por IP + username, mesmo que inicialmente use store atual.
- [x] Centralizar leitura/escrita em `reviews.ts`.
- [x] Documentar `Proof` como backing temporario.
- [x] Nao expor email do reviewer publicamente.

Execucao:

- `components/public/PublicReviewsSection.tsx` e `components/public/PublicPortfolioTabsPage.tsx` adicionam o campo honeypot `website` sem impacto visual.
- `app/[username]/review-actions.ts` coleta IP via headers e repassa para o dominio.
- `lib/security/rate-limit.ts` define `PUBLIC_REVIEW_RATE_LIMIT` com 3 envios por 10 minutos.
- `lib/server/domain/reviews.ts` centraliza leitura/escrita, aplica honeypot, rate limit e trava novos envios quando o perfil tem 20 reviews publicas pendentes.
- `Proof` permanece como backing temporario de persistencia; a UI e o dominio exposto continuam usando o termo `Review`.
- `reviewerEmail` continua sendo salvo apenas para moderacao futura e nao e retornado em `getPublicReviewSummary`.
- `tests/domain/reviews-domain.test.ts` cobre criacao, honeypot, limite de pendentes e rate limit.

Guardrails de layout:

- Formulario de review deve caber no painel de abas sem scroll global.
- Em mobile, campos devem empilhar e manter altura de botao normal.
- Nao aumentar card de review para ocupar a tela inteira.

Validacao:

- `npm run typecheck`
- Testes novos ou existentes para `createPublicReview`.
- Browser em `/{username}` e `/{username}/{pageSlug}#reviews`.

Risco:

- Medio. Sem store duravel, rate limit ainda nao sera protecao final.

### Slice 5 - Curriculo rapido como modo do portfolio

Objetivo: alinhar semantica de curriculo como leitura rapida, nao como segundo produto separado.

Status: concluida em 2026-04-27.

Arquivos provaveis:

- `app/(app)/resumes/page.tsx`
- `app/(app)/pages/[pageId]/resume/page.tsx`
- `components/resume/ResumeView.tsx`
- `components/public/PublicResumePage.tsx`
- `lib/templates/resume/*`
- `app/[username]/[pageSlug]/resume/page.tsx`
- `app/[username]/resume/page.tsx`

Checklist:

- [x] Revisar copy para "curriculo rapido" quando fizer sentido.
- [x] Garantir que publicacao do curriculo esteja sempre associada ao portfolio/versao.
- [x] Evitar CTA que sugira criar curriculo independente sem portfolio.
- [x] Validar rota legada `/{username}/resume` e decidir se permanece como alias/default.
- [x] Ajustar empty states de `/resumes` para apontar para `/portfolios`.

Execucao:

- `app/(app)/pages/[pageId]/resume/page.tsx` passa a chamar a tela autenticada de "Curriculo rapido", com retorno explicito para o portfolio e link publico identificado.
- `components/public/PublicToolbar.tsx` troca o item publico para "Curriculo rapido" e preserva o item "Portfolio".
- `components/public/PublicResumePage.tsx` adiciona uma faixa compacta explicando que a leitura objetiva esta associada ao portfolio publico.
- `app/[username]/resume/page.tsx` e `app/[username]/[pageSlug]/resume/page.tsx` preservam os aliases publicos existentes, mas atualizam metadata e mensagens para curriculo rapido.
- `components/public/PublicProfileHubPage.tsx` direciona o CTA para "curriculo rapido deste portfolio".
- `app/(app)/templates/[slug]/page.tsx` passa a tratar a aplicacao de modelo como criacao de portfolio + curriculo rapido em rascunho.
- `lib/templates/resume/portfolio-community.ts` usa "Analise comportamental" sem acento para manter o padrao ASCII dos templates.

Guardrails de layout:

- Curriculo deve ser mais denso que portfolio, nao mais espalhado.
- Evitar headings muito grandes em cards de experiencia.
- Impressao/print nao deve ser afetada por estilos do app shell.

Validacao:

- `npm run typecheck`
- Browser em `/pages/{pageId}/resume`, `/{username}/{pageSlug}/resume`.
- Se houver CSS print, testar preview visual basico.

Risco:

- Medio. Pode afetar links publicos existentes se aliases forem removidos cedo demais.

### Slice 6 - Higiene de repositorio e dependencias

Objetivo: reduzir ruido sem perder referencias importantes.

Status: concluida em 2026-04-27.

Arquivos provaveis:

- `.gitignore`
- `.eslintignore`
- `.prettierignore`
- `package.json`
- `package-lock.json`
- `utils/supabase/*`
- `docs/*`

Checklist:

- [x] Confirmar se `utils/supabase/*` nao e importado.
- [x] Remover dependencias Supabase se nao houver uso ativo.
- [x] Isolar ou ignorar `output`.
- [x] Decidir politica para `landing-test`, `redesign-teste`, `editor-otimizacao`, `orientacao-profissional-app`.
- [x] Nao remover referencias de design antes de copiar o essencial para docs.
- [x] Nao mexer em `generated/prisma-client` nesta slice sem decisao especifica.

Execucao:

- `rg` confirmou que `utils/supabase/*` nao era importado pela aplicacao.
- `utils/supabase/*` foi removido junto das dependencias `@supabase/ssr` e `@supabase/supabase-js`.
- `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` foram removidas de `.env.example`, `lib/env.ts` e testes de ambiente.
- `docs/setup.md` agora documenta Supabase apenas como possivel endpoint S3 compativel via `STORAGE_S3_*`, sem Auth/client Supabase.
- `.gitignore`, `.prettierignore`, `.eslintignore` e `tsconfig.json` isolam `output`, `landing-test`, `redesign-teste`, `editor-otimizacao` e `orientacao-profissional-app` como referencia local/historica, sem apagar material visual.
- `generated/prisma-client` nao foi alterado nesta slice.

Validacao:

- `npm install` se dependencias mudarem.
- `npm run typecheck`
- `npm run lint`
- `npm run test`

Risco:

- Medio. Remover referencias cedo demais pode apagar contexto de design.

### Slice 7 - Favicon e erro 500 residual

Objetivo: evitar 500 em `/favicon.ico` por handler dinamico fragil.

Status: concluida em 2026-04-27.

Arquivos provaveis:

- `app/favicon.ico/route.ts`
- `public/favicon.svg`
- possivel `app/icon.svg`

Checklist:

- [x] Decidir entre arquivo estatico e handler com fallback.
- [x] Se manter handler, tratar erro de leitura.
- [x] Registrar que o padrao Next estatico nao foi usado neste corte para preservar `/favicon.ico`.
- [x] Validar content-type.

Execucao:

- A rota `app/favicon.ico/route.ts` foi mantida para preservar compatibilidade direta com `/favicon.ico`.
- O handler agora trata falhas de leitura de `public/favicon.svg` e responde com SVG fallback embutido.
- O `Content-Type` ficou explicito como `image/svg+xml; charset=utf-8`.
- Nenhuma alteracao foi feita em layout, metadata global ou assets publicos.

Validacao:

- `npm run typecheck`
- `npm run lint`
- Acessar `/favicon.ico` localmente.

Risco:

- Baixo.

### Slice 8 - Heranca `apps` e `packages`

Objetivo: fechar a pendencia de repositorio sobre diretorios da arquitetura monorepo antiga.

Status: concluida em 2026-04-27.

Arquivos alterados:

- `.gitignore`
- `.eslintignore`
- `.prettierignore`
- `tsconfig.json`
- `docs/architecture-checkup-2026-04-27.md`

Checklist:

- [x] Confirmar que `apps/` e `packages/` nao possuem arquivos versionados.
- [x] Confirmar que nao ha imports ativos para `apps/`, `packages/` ou `@foliotree`.
- [x] Isolar os diretorios dos checks locais sem apagar referencia do disco.
- [x] Atualizar o checkup como pendencia resolvida.

Execucao:

- `git ls-files apps packages` nao retornou arquivos versionados.
- `git ls-files --others --exclude-standard apps packages` nao retornou arquivos pendentes para commit.
- Fora de `node_modules`, `.next` e `dist`, foi encontrado apenas `apps/web/tsconfig.tsbuildinfo`, que ja e artefato ignorado.
- `.gitignore`, `.eslintignore`, `.prettierignore` e `tsconfig.json` agora tratam `apps` e `packages` como heranca local/historica fora do runtime atual.
- Nenhum codigo de runtime Next.js, Prisma, auth, UI ou API foi alterado.

Validacao:

- `npm run typecheck`
- `npm run lint`
- `npx prettier --check .gitignore .eslintignore .prettierignore tsconfig.json docs/architecture-checkup-2026-04-27.md docs/architecture-optimization-slices.md`

Risco:

- Baixo. Mudanca restrita a ignores, TypeScript exclude e documentacao.

## Ordem recomendada

1. Slice 0 - Baseline e protecoes.
2. Slice 1 - Navegacao primaria.
3. Slice 2 - Portfolios cockpit.
4. Slice 5 - Curriculo rapido como modo do portfolio.
5. Slice 4 - Reviews anti-spam.
6. Slice 3 - Editor/preview em abas.
7. Slice 6 - Higiene de repositorio.
8. Slice 7 - Favicon.
9. Slice 8 - Heranca `apps` e `packages`.

Motivo:

- Primeiro fecha seguranca leve e documentacao.
- Depois reduz duplicidade de produto sem mexer em schema.
- Em seguida melhora a tela principal de trabalho.
- Editor fica para depois porque tem maior risco visual.
- Limpeza pesada fica depois para nao apagar referencias ainda uteis.

## Definition of done por slice

Cada slice so deve ser considerada concluida quando tiver:

- checklist marcado;
- arquivos alterados listados;
- validacao executada ou bloqueio declarado;
- busca de mojibake nos arquivos tocados quando houver texto visivel;
- pelo menos uma verificacao visual quando tocar UI;
- nenhum aumento global de escala visual;
- nenhum overflow horizontal novo em desktop ou mobile.

## Comandos uteis de validacao

```powershell
npm run typecheck
npm run lint
npm run test
npx prettier --check docs/architecture-optimization-slices.md
rg -n -e '<padrao-de-mojibake>' -e '<anotacao-solta>' <arquivos-tocados>
```

Para UI, usar navegador em:

```text
/dashboard
/profile
/portfolios
/templates
/pages/{pageId}/editor
/pages/{pageId}/resume
/{username}
/{username}/{pageSlug}
/{username}/{pageSlug}/resume
```

## Memoria de decisao

- Nao vamos trocar a stack agora. O modelo Next.js fullstack continua valido.
- Nao vamos criar outro fluxo de perfil.
- Portfolios vira a porta principal de publicacao.
- Curriculo e modo rapido de leitura associado ao portfolio.
- Pages e Versions sao entidades tecnicas/internas.
- Reviews sao produto; Proof e nome tecnico temporario.
- Layout deve ser preservado por constraints locais, nao por zoom global.
