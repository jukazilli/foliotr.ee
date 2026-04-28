# Contrato - Versionamento de Portfolio

Status: draft contract  
Last updated: 2026-04-28  
Modo de entrada: Slice

## Objetivo

Separar definitivamente o perfil do sistema das variacoes de portfolio.

O perfil publico do usuario continua seguindo a identidade visual do FolioTree e os dados base globais da conta. Ja cada portfolio/variacao deve ter uma copia editavel dos dados que serao exibidos naquele portfolio e curriculo, sem redirecionar o usuario para editar o perfil global.

## Fontes de verdade

- Pedido atual do usuario em 2026-04-28.
- Codigo real em `prisma/schema.prisma`.
- `lib/server/domain/versions.ts`.
- `lib/server/domain/page-snapshots.ts`.
- `app/(app)/portfolios/page.tsx`.
- `app/(app)/portfolios/actions.ts`.
- `app/(app)/templates/actions.ts`.
- Contrato base do remaster: `docs/02_contratos/contrato-remaster-social-ui.md`.

## Realidade observada

- `Profile` armazena os dados base globais da conta.
- `Version` hoje pertence a `Profile` e guarda nome, contexto, headline/bio customizados, apresentacao e selecoes de IDs do perfil.
- `VersionExperience`, `VersionEducation`, `VersionProject`, `VersionSkill`, `VersionAchievement`, `VersionProof`, `VersionHighlight` e `VersionLink` referenciam entidades vivas do perfil global.
- `Page.editorSnapshot` e `Page.publishedSnapshot` ja congelam dados para renderizacao, mas `buildEditorSnapshot(profile, version)` ainda e recalculado a partir do `Profile` atual quando paginas/curriculos sao atualizados.
- `versionPortfolioAction` cria variacao copiando selecoes do perfil global atual, nao uma copia independente dos dados base.
- A tela `/portfolios` ainda tem acao "Editar dados do perfil" apontando para `/profile`, o que mistura edicao de perfil global com edicao de variacao.
- A aplicacao de template em `/templates` aplica tema a uma `Version`, mas nao conduz o usuario por uma edicao multi-step da variacao.

## Decisao de produto

### Perfil

- Perfil e a pagina social/publica do usuario.
- Perfil nao aplica template.
- Perfil segue visual padrao do FolioTree.
- Edicoes em `/profile` alteram apenas os dados base globais da conta.
- Perfil mostra links para portfolios publicados, mas nao e o lugar para editar dados especificos de uma variacao.

### Portfolio/variacao

- Portfolio e uma publicacao/versionamento de uma experiencia profissional.
- Cada variacao deve ter dados base proprios, copiados do perfil no momento da criacao.
- A variacao pode ocultar ou exibir partes da copia: experiencia, formacao, skills, projetos, conquistas, reviews, links, apresentacao e dados pessoais/profissionais.
- A variacao pode ter foto propria para portfolio/curriculo.
- A variacao pode escolher um template.
- O template afeta apenas a publicacao do portfolio/curriculo, nao o perfil.
- O nome exibido da variacao deve priorizar o cargo/role da copia da variacao, nao o nome do template.

## Contrato de dados desejado

Criar um agregado persistente por `Version` para representar a copia editavel da variacao.

Opcoes tecnicas aceitaveis para o primeiro corte:

1. `Version.profileSnapshot Json`: copia editavel consolidada dos dados base da variacao.
2. Tabelas normalizadas `VersionProfile`, `VersionExperienceCopy`, etc.

Decisao recomendada para o primeiro corte: `Version.profileSnapshot Json`.

Motivo:

- Reduz migração inicial.
- Aproveita o modelo de snapshot ja existente em `Page.editorSnapshot` e `Page.publishedSnapshot`.
- Permite evoluir para tabelas normalizadas depois, se filtros/relatorios por item versionado se tornarem necessarios.

Contrato minimo do `profileSnapshot`:

- `displayName`
- `headline`
- `bio`
- `avatarUrl`
- `bannerUrl`
- `bannerPositionX`
- `bannerPositionY`
- `location`
- `publicEmail`
- `phone`
- `birthDate`
- `openToOpportunities`
- `opportunityMotivation`
- `presentation`
- `experiences`
- `educations`
- `skills`
- `projects`
- `achievements`
- `proofs`
- `highlights`
- `links`
- `visibility`

## Contrato de jornada

### Criar variacao

1. Usuario clica em criar variacao a partir de um portfolio ou de um modelo.
2. Sistema cria `Version` e copia os dados base atuais para `Version.profileSnapshot`.
3. Sistema leva para `/portfolios/{versionId}/edit`.
4. Usuario passa pelo fluxo multi-step.
5. Ao final, sistema salva, cria/aplica `Page`, configura curriculo e publica se o usuario confirmar.
6. Link publicado aparece no perfil publico.

### Editar variacao

Rota alvo: `/portfolios/{versionId}/edit`.

Passos:

1. Foto e identidade da variacao.
   - Avatar/capa ou foto especifica do portfolio.
   - Nome/cargo exibido.
2. Dados e visibilidade.
   - Editar copia dos dados base.
   - Ocultar/exibir secoes e itens.
3. Tema/template.
   - Selecionar template visual.
   - Trocar template sem mandar para editor tecnico.
4. Publicacao.
   - Revisar link.
   - Salvar rascunho ou publicar.

## Contrato de nomes

- `Version.name` deve ser derivado do cargo/role principal da variacao.
- Fallback: headline da variacao.
- Fallback final: `Portfolio {n}`.
- `Page.title` deve acompanhar o nome da variacao.
- O nome do template deve aparecer como metadado visual, nunca como nome principal do portfolio.

## Lacunas

- Definir se cada variacao tera uma experiencia principal obrigatoria.
- Definir quais campos pessoais podem ser ocultos por padrao.
- Definir se reviews entram na copia da variacao ou continuam globais com filtro de visibilidade.
- Definir comportamento de variacoes existentes sem `profileSnapshot`.
- Definir se publicar no final do wizard sera sempre automatico ou se havera opcao de salvar rascunho.
- Definir limite de tamanho para `profileSnapshot`.

## Nao escopo deste contrato

- Remover o perfil publico.
- Aplicar templates no perfil.
- Recriar o renderer `portfolio-community` do zero.
- Deletar snapshots existentes.
- Migrar toda a estrutura para tabelas normalizadas neste primeiro corte.

## Evidencias de fechamento esperadas

- Variacao nova nasce com copia independente do perfil.
- Editar `/profile` depois de criar variacao nao altera o draft da variacao.
- Editar variacao nao chama `/api/profile` para dados especificos da variacao.
- Publicar portfolio usa `Version.profileSnapshot` para `Page.editorSnapshot` e `Page.publishedSnapshot`.
- Card em `/portfolios` mostra cargo/nome da variacao, nao nome do template.
- Usuario consegue editar foto, dados, visibilidade e template em fluxo multi-step.
- `npm run typecheck` sem erro.
- Validacao browser da jornada criar/editar/publicar.
