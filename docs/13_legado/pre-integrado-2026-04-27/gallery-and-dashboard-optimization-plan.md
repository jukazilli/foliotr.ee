# Plano - otimizacoes da galeria e da area inicial

Status: proposto para revisao  
Data: 2026-04-21  
Escopo: `app/(app)/gallery`, `app/(app)/dashboard`, assets e navegacao de atualizacao rapida

## Objetivo

Planejar um corte de UX e produto com quatro metas:

1. permitir exclusao de fotos na galeria;
2. marcar imagens em uso;
3. reduzir copy e blocos desnecessarios na tela da galeria;
4. transformar a area inicial em uma tela de atualizacao rapida do portfolio.

## Fontes consultadas

- `app/(app)/gallery/page.tsx`
- `components/assets/AssetGalleryManager.tsx`
- `components/assets/AssetGalleryPicker.tsx`
- `app/(app)/dashboard/page.tsx`
- `app/api/assets/route.ts`
- `app/api/assets/[assetId]/route.ts`
- `lib/server/domain/assets.ts`
- `lib/server/domain/templates.ts`
- `components/pages/CanonicalPageEditor.tsx`
- `components/profile/ProfileEditor.tsx`
- `components/profile/ProfileTabs.tsx`
- `prisma/schema.prisma`
- `docs/asset-gallery-and-resume-ui-plan.md`
- `docs/mvp-technical-audit.md`
- `docs/README.md`

## Regra de precedencia

1. comportamento real e contratos atuais do codigo;
2. schema Prisma e ownership server-side;
3. direcao documental que pede shell menos frio e menos cara de dashboard;
4. diretriz do usuario nesta conversa: menos texto na interface e mais foco em acao.

## Estado atual observado

### Galeria

- A rota `/gallery` existe e renderiza `AssetGalleryManager`.
- A tela hoje ainda tem copy demais para o objetivo dela:
  - `PageIntro` com descricao longa;
  - cards de resumo (`Imagens`, `Upload`, `Mais recente`);
  - CTAs auxiliares abaixo do header.
- `GET /api/assets` lista assets com `cursor`, sem total, sem pagina numerada e sem metadata de uso.
- A pagina carrega ate 48 imagens por vez.
- Existe `PATCH /api/assets/[assetId]`, mas nao existe `DELETE /api/assets/[assetId]`.
- Nao existem helpers de delete no storage local nem no storage S3.

### Uso de assets

O projeto ja tem referencias explicitas em banco:

- `Project.coverAssetId`
- `Proof.assetId`
- `Highlight.assetId`
- `Achievement.assetId`
- `Experience.logoAssetId`

Tambem ja existe uso indireto em blocos de pagina:

- `PageBlock.assets` guarda `assetId` dentro de JSON;
- `lib/server/domain/templates.ts` ja percorre `assetId` recursivamente.

Limite atual:

- avatar ainda usa `Profile.avatarUrl`, nao `avatarAssetId`;
- portanto o uso em avatar hoje so pode ser inferido por match de URL, nao por FK.

### Area inicial

- A rota `/dashboard` ainda e uma tela de resumo/status.
- Ela prioriza estatisticas, checklist, cards de progresso e copy explicativa.
- Isso conflita com o objetivo funcional pedido agora: lembrar o usuario de atualizar o portfolio e levá-lo rapido para Formacao, Experiencias, Projetos, Reconhecimentos, Links e Provas.

## Decisoes de produto para este corte

### 1. Galeria mais direta

Manter a galeria como ferramenta operacional, nao como tela explicativa.

Diretriz:

- remover `PageIntro` descritivo;
- remover os cards de resumo;
- remover blocos abaixo da grade que nao sejam essenciais para a acao;
- deixar apenas:
  - toolbar curta;
  - grade;
  - estados de erro/vazio;
  - paginacao.

Copy alvo:

- curta;
- utilitaria;
- sem texto de marketing;
- sem explicar o obvio.

### 2. Exclusao segura

A exclusao deve existir, mas nao pode quebrar referencias ativas.

Decisao recomendada:

- permitir exclusao direta apenas para assets sem uso;
- bloquear exclusao quando o asset estiver em uso;
- retornar no erro onde ele esta sendo usado.

Justificativa:

- e o corte mais seguro;
- evita limpar referencia de projeto, prova, logo ou bloco em cascata sem confirmacao;
- entrega valor sem abrir risco de regressao visual em paginas publicadas.

### 3. Imagem em uso

A galeria deve mostrar claramente quando uma imagem esta em uso.

Decisao recomendada:

- cada item retorna `usageSummary`;
- a UI mostra badge `Em uso` ou `Livre`;
- quando houver uso, a UI exibe quantidade e tipos principais de uso.

### 4. Paginacao real

O usuario pediu ate 12 fotos por pagina. A UX deve refletir pagina, nao "carregar mais".

Decisao recomendada:

- trocar o fluxo da pagina de galeria para paginacao numerada;
- tamanho fixo: `12`;
- controles: `Anterior`, numeros, `Proxima`.

### 5. Dashboard como central de manutencao

A area inicial deixa de ser status board e vira um painel de atualizacao rapida.

Decisao recomendada:

- remover o conteudo atual inteiro;
- substituir por uma grade de acessos rapidos para:
  - Formacao
  - Experiencias
  - Projetos
  - Reconhecimentos
  - Links
  - Provas

O foco da tela passa a ser:

- lembrar de atualizar;
- mostrar onde existe lacuna;
- abrir rapido o lugar certo para editar.

## Contrato proposto - galeria

### UI final

Estrutura proposta para `/gallery`:

1. barra superior curta:
   - titulo curto ou nenhum hero;
   - botao `Enviar`;
   - filtro opcional futuro;
   - pagina atual.
2. grade paginada com 12 cards.
3. cada card mostra:
   - preview;
   - nome;
   - badge `Em uso` ou `Livre`;
   - acao `Excluir`;
   - detalhes compactos so quando agregarem.

Remocoes explicitas:

- remover descricao longa de topo;
- remover cards `Imagens`, `Upload`, `Mais recente`;
- remover CTA auxiliar `Usar no perfil` / `Usar nas paginas` se ele continuar sendo ruido e nao acao primaria.

### Contrato de dados recomendado

Expandir `GET /api/assets` para retornar, por item:

```ts
type AssetUsageLocation = {
  type:
    | "avatar"
    | "project_cover"
    | "experience_logo"
    | "achievement"
    | "highlight"
    | "proof"
    | "page_block";
  label: string;
  referenceId?: string;
};

type AssetUsageSummary = {
  inUse: boolean;
  count: number;
  locations: AssetUsageLocation[];
};

type GalleryAssetListItem = {
  id: string;
  url: string;
  name?: string | null;
  altText?: string | null;
  mimeType?: string | null;
  size?: number | null;
  width?: number | null;
  height?: number | null;
  createdAt: string;
  usageSummary: AssetUsageSummary;
  canDelete: boolean;
};
```

### Contrato de paginacao recomendado

Para esta tela, paginacao numerada e mais importante do que cursor puro.

Proposta:

`GET /api/assets?kind=IMAGE&status=READY&page=1&limit=12`

Resposta:

```json
{
  "assets": [],
  "page": 1,
  "limit": 12,
  "total": 37,
  "totalPages": 4
}
```

Observacao:

- o cursor atual funciona, mas nao atende tao bem a UX pedida;
- para galeria pessoal com volume moderado, pagina numerada com `skip/take` e aceitavel neste corte.

### Contrato de exclusao recomendado

Adicionar:

`DELETE /api/assets/[assetId]`

Regras:

1. exigir ownership do asset;
2. resolver `usageSummary` antes de deletar;
3. se `usageSummary.inUse === true`, retornar `409`;
4. se estiver livre:
   - apagar do storage;
   - apagar do banco;
   - responder `200`.

Resposta de bloqueio:

```json
{
  "error": {
    "code": "ASSET_IN_USE",
    "message": "A imagem esta em uso e nao pode ser excluida.",
    "details": {
      "usageSummary": {
        "inUse": true,
        "count": 3,
        "locations": []
      }
    }
  }
}
```

## Estrategia tecnica - deteccao de uso

### Cobertura desta entrega

Cobrir:

- avatar por match de `Profile.avatarUrl`;
- capas de projeto;
- logos de experiencia;
- assets de `Achievement`;
- assets de `Highlight`;
- assets de `Proof`;
- referencias dentro de `PageBlock.assets` por `assetId`.

### Como resolver

Criar um resolver central em `lib/server/domain/assets.ts`:

- `getOwnedAssetUsageSummary(db, userId, assetId)`

Ele deve:

1. confirmar ownership;
2. consultar relacoes diretas;
3. consultar `pageBlock.assets` do usuario e varrer `assetId`;
4. verificar avatar por URL normalizada;
5. montar `usageSummary`.

### Risco conhecido

Avatar continua sem FK.

Implicacao:

- deteccao de uso em avatar e boa, mas ainda nao perfeita;
- migrar para `avatarAssetId` continua sendo melhoria futura, nao pre-requisito deste corte.

## Contrato proposto - area inicial

### Troca de funcao da pagina

`/dashboard` passa a ser uma tela de manutencao rapida do portfolio.

Ela deixa de mostrar:

- progresso geral;
- checklist;
- resumo de publicacao;
- blocos de status;
- cards de visao executiva.

Ela passa a mostrar:

- 6 cards de atualizacao rapida.

### Ordem sugerida

1. Formacao
2. Experiencias
3. Projetos
4. Reconhecimentos
5. Links
6. Provas

### Conteudo minimo por card

Cada card deve ter apenas:

- nome da secao;
- quantidade atual;
- status de recencia:
  - `Nunca atualizado`
  - `Precisa revisar`
  - `Atualizado recentemente`
- CTA principal:
  - `Atualizar`
  - `Adicionar`

Sem texto explicativo longo.

### Navegacao recomendada

O clique do card deve abrir a secao certa do perfil:

- `/profile?tab=educations`
- `/profile?tab=experiences`
- `/profile?tab=projects`
- `/profile?tab=achievements`
- `/profile?tab=links`
- `/profile?tab=proofs`

Para isso, `ProfileTabs` deve aceitar valor vindo da rota.

### Direcao visual

A tela precisa parecer:

- leve;
- orientada a manutencao;
- mais proxima de uma central viva de portfolio do que de um dashboard de analytics.

Evitar:

- excesso de KPI;
- explicacao longa;
- cards duplicados;
- texto que so repete o nome da funcao.

## Fases de implementacao recomendadas

### Fase 1 - infraestrutura da galeria

Entregas:

- expandir `GET /api/assets`;
- criar `DELETE /api/assets/[assetId]`;
- criar delete em storage local e S3;
- criar resolver de uso.

Arquivos provaveis:

- `app/api/assets/route.ts`
- `app/api/assets/[assetId]/route.ts`
- `lib/server/domain/assets.ts`
- `lib/storage/local.ts`
- `lib/storage/s3.ts`

### Fase 2 - UI da galeria

Entregas:

- remover blocos verbosos;
- paginacao de 12 por pagina;
- badge `Em uso`;
- acao `Excluir`;
- estado bloqueado para exclusao quando houver uso.

Arquivos provaveis:

- `app/(app)/gallery/page.tsx`
- `components/assets/AssetGalleryManager.tsx`
- `components/assets/gallery-shared.ts`

### Fase 3 - area inicial

Entregas:

- substituir o dashboard atual por grade de atualizacao rapida;
- links diretos por secao;
- `ProfileTabs` lendo `tab` da URL.

Arquivos provaveis:

- `app/(app)/dashboard/page.tsx`
- `app/(app)/profile/page.tsx`
- `components/profile/ProfileTabs.tsx`
- possivelmente `components/profile/ProfileEditor.tsx`

## Criterios de aceite

### Galeria

- mostra no maximo 12 itens por pagina;
- usuario consegue navegar entre paginas;
- imagem em uso aparece marcada;
- imagem livre pode ser excluida;
- imagem em uso nao pode ser excluida;
- resposta de bloqueio informa onde a imagem esta sendo usada;
- a tela nao exibe hero descritivo nem cards de estatistica desnecessarios.

### Area inicial

- nao sobra nenhum bloco antigo da dashboard atual;
- a tela abre direto em acoes de atualizacao;
- cada card leva para a secao certa do perfil;
- a copy da tela e curta;
- a pagina reforca manutencao continua do portfolio.

## Validacao recomendada

- `npm run typecheck`
- `npm run lint`
- teste manual em `/gallery`:
  - excluir asset livre;
  - tentar excluir asset em uso;
  - validar badge de uso;
  - validar paginas de 12 itens;
- teste manual em `/dashboard`:
  - abrir cada atalho;
  - confirmar abertura da aba correta no perfil.

## Fora de escopo deste corte

- exclusao forcada com detach automatico de referencias;
- migracao de `avatarUrl` para `avatarAssetId`;
- filtros avancados da galeria;
- bulk delete;
- reorder da galeria;
- inline editing completo do perfil dentro do dashboard.

## Decisao recomendada

Seguir em dois cortes tecnicos:

1. galeria operacional: menos copy, 12 por pagina, uso e exclusao segura;
2. dashboard de manutencao: remover o resumo atual e substituir pela central de atualizacao rapida.

Essa ordem reduz risco, entrega valor visivel rapido e respeita o objetivo do produto: portfolio vivo, sempre atualizado e facil de manter.
