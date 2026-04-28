# Plano - galeria de fotos e curriculo canonico

Status: implementado e validado localmente  
Data: 2026-04-21  
Escopo: planejamento de entrega para galeria de imagens reutilizaveis e nova UI do modo curriculo  
Referencia visual de curriculo: `assets/curriculo-code`

## Objetivo

Entregar uma galeria de fotos do usuario para reutilizar imagens ja enviadas no perfil e no editor, reduzindo reuploads repetidos e evitando crescimento desnecessario no S3.

Tambem atualizar a UI do modo curriculo mantendo o contrato canonico existente: o curriculo continua sendo uma projecao da mesma `Version`, com os mesmos dados do perfil/template, mas com uma experiencia visual mais limpa, organizada e orientada para leitura do visitante.

## Fontes consultadas

- `docs/templates-architecture.md`
- `docs/templates-canonical-contract.md`
- `prisma/schema.prisma`
- `app/api/assets/route.ts`
- `app/api/assets/upload/route.ts`
- `app/api/profile/projects/[projectId]/cover/route.ts`
- `lib/server/domain/assets.ts`
- `lib/server/domain/profile-base.ts`
- `components/profile/ProfileEditor.tsx`
- `components/pages/CanonicalPageEditor.tsx`
- `components/resume/ResumeView.tsx`
- `lib/templates/resume/portfolio-community.ts`
- `assets/curriculo-code/src/imports/Resume/Resume.tsx`
- `assets/curriculo-code/README.md`
- `assets/curriculo-code/ATTRIBUTIONS.md`

## Regras de precedencia

1. O contrato canonico existente continua valendo:
   `Profile -> Version -> Page -> Template blocks`.
2. O modo curriculo nao cria fonte nova de dados; ele projeta a mesma `Version`.
3. A referencia em `assets/curriculo-code` e materia-prima visual, nao runtime, nao dependencia e nao fonte de dados.
4. A entidade oficial de midia e `Asset`.
5. Upload novo grava no storage e cria `Asset`.
6. Se o usuario escolher uma imagem ja existente na galeria, nenhum novo upload deve acontecer.

## Estado atual observado

### Assets

O schema ja possui `Asset` com:

- `profileId`
- `kind`
- `status`
- `url`
- `storageKey`
- `name`
- `altText`
- `mimeType`
- `size`
- `width`
- `height`
- `metadata`

O `Profile` ja possui relacao `assets Asset[]`.

Algumas entidades ja conseguem apontar para `Asset`:

- `Project.coverAssetId`
- `Proof.assetId`
- `Highlight.assetId`
- `Experience.logoAssetId`
- `Achievement.assetId`

O avatar ainda usa `Profile.avatarUrl` como string, sem `avatarAssetId`.

### APIs atuais

- `POST /api/assets/upload` faz upload real para `local` ou `s3`, cria `Asset` e, quando `purpose=avatar`, atualiza `Profile.avatarUrl`.
- `POST /api/assets` cria um asset por JSON, sem upload.
- `PATCH /api/assets/[assetId]` atualiza asset do usuario.
- `PATCH /api/profile/projects/[projectId]/cover` ja valida ownership de `coverAssetId`.
- Ainda falta uma rota de listagem de assets do usuario para alimentar uma galeria.

### UI atual

- `ProfileEditor` possui fluxo de upload para avatar e capa de projeto.
- `CanonicalPageEditor` possui fluxo de upload para imagens top-level, imagens em listas e capas de projeto no editor.
- Os fluxos recentes ja usam input persistente para evitar travamento de file picker em usos repetidos.
- Ainda nao existe um picker reutilizavel de imagens ja enviadas.

### Curriculo atual

- `ResumeView` renderiza a projecao resolvida por `resolveTemplateResumeProjection`.
- `portfolio-community.ts` projeta dados semanticos do template para secoes de curriculo.
- `ResumeConfig` ja possui `sections`, `layout`, `accentColor`, `showPhoto`, `showLinks`, `publishState` e snapshot de publicacao.
- A UI atual e funcional, mas ainda muito proxima de uma lista simples em card.

### Referencia `assets/curriculo-code`

O pacote e um bundle de Figma Make/Vite. Ele inclui uma tela de curriculo com:

- Header com foto circular, nome forte e subtitulo.
- Layout em duas colunas no desktop.
- Coluna principal para perfil e experiencia.
- Coluna lateral para formacao, habilidades, idiomas, redes e side-projects.
- Titulos grandes, corpo com bastante respiro e separadores discretos.
- Icones/logos decorativos nas experiencias e projetos.

Esse pacote nao deve ser importado pelo app real. A entrega deve extrair a direcao visual e recriar a UI dentro do renderer canonico existente.

## Contrato da galeria de fotos

### Contrato de dados

1. A galeria lista apenas `Asset` do `Profile` autenticado.
2. A primeira entrega sera focada em `AssetKind.IMAGE`.
3. Cada item retornado para a UI deve ter, no minimo:
   - `id`
   - `url`
   - `name`
   - `altText`
   - `mimeType`
   - `size`
   - `width`
   - `height`
   - `metadata`
   - `createdAt`
4. A selecao de asset existente deve atualizar o alvo com `url` e, quando o alvo suportar, `assetId`.
5. O avatar continua usando `Profile.avatarUrl` na primeira entrega para evitar migracao desnecessaria.
6. O plano nao depende de deduplicacao por hash para gerar economia imediata. A economia inicial vem de reutilizar `Asset` existente sem novo upload.
7. Deduplicacao de upload repetido por hash deve ser uma fase posterior, pois exige calcular hash antes do upload e decidir contrato de reaproveitamento de objeto.

### Contrato de API

Adicionar `GET /api/assets`.

Parametros previstos:

- `kind=IMAGE`
- `status=READY`
- `limit`
- `cursor`

Resposta prevista:

```json
{
  "assets": [
    {
      "id": "asset_id",
      "kind": "IMAGE",
      "status": "READY",
      "url": "/api/assets/proxy?key=...",
      "name": "foto.jpg",
      "altText": null,
      "mimeType": "image/jpeg",
      "size": 123456,
      "width": null,
      "height": null,
      "metadata": {},
      "createdAt": "2026-04-21T00:00:00.000Z"
    }
  ],
  "nextCursor": null
}
```

Regras da rota:

- Exigir sessao autenticada.
- Resolver `Profile` pelo usuario autenticado.
- Filtrar por `profileId`.
- Nao permitir listar assets de outro usuario.
- Ordenar por `createdAt desc`.
- Tolerar `width` e `height` nulos.

Manter `POST /api/assets/upload` como rota de upload real. Quando a imagem for enviada pela galeria, ela deve criar `Asset`, retornar o asset e inserir o item na grade da galeria.

### Contrato de UI

Criar um componente reutilizavel, proposto como:

`components/assets/AssetGalleryPicker.tsx`

Responsabilidades:

- Abrir em modal/sheet.
- Ter duas areas: `Galeria` e `Enviar`.
- Listar imagens existentes.
- Permitir selecionar uma imagem existente.
- Permitir upload de nova imagem.
- Ao concluir, chamar `onSelect(asset)`.
- Nunca disparar upload quando o usuario seleciona asset existente.
- Reusar a logica de input persistente para upload, preservando a correcao contra travamento do file picker.
- Expor estados de loading, erro, vazio e upload em andamento.

Contrato de retorno:

```ts
interface GalleryImageAsset {
  id: string;
  url: string;
  name?: string | null;
  altText?: string | null;
  mimeType?: string | null;
  size?: number | null;
  width?: number | null;
  height?: number | null;
  metadata?: Record<string, unknown>;
}
```

### Pontos de integracao

1. Avatar em `ProfileEditor`
   - Botao "Trocar foto" abre a galeria.
   - Selecionar existente atualiza `Profile.avatarUrl` com `asset.url`.
   - Upload novo pela galeria usa `purpose=avatar`, recebe o asset e atualiza `avatarUrl`.
   - O fluxo deve manter o preview imediato.

2. Capa de projeto em `ProfileEditor`
   - Botao de capa abre a galeria.
   - Selecionar existente atualiza `imageUrl` e `coverAssetId`.
   - Upload novo cria `Asset` e atualiza `imageUrl` e `coverAssetId`.

3. Imagens no `CanonicalPageEditor`
   - Triggers "Trocar imagem" e "Adicionar imagem" abrem a galeria.
   - Selecionar existente atualiza o `EditableImageValue` com `src`, `alt`, `fitMode`, `positionX`, `positionY`.
   - Quando houver metadata de assets no bloco, gravar `assetId`, `url` e `src`.
   - Preservar contratos existentes de crop, fit/fill e reposicionamento.

4. Capas de projeto no editor canonico
   - Selecionar existente deve preencher a mesma estrutura usada hoje para project covers.
   - O save de blocks deve continuar recebendo `config` e `assets` validos.

## Contrato de otimizacao do curriculo

### Contrato funcional

1. O curriculo continua renderizado por `components/resume/ResumeView.tsx`.
2. A projecao continua resolvida por `resolveTemplateResumeProjection`.
3. O template `portfolio-community` continua usando `lib/templates/resume/portfolio-community.ts`.
4. Nenhum arquivo de `assets/curriculo-code` deve ser importado no runtime.
5. A UI pode mudar, mas o contrato de dados de `ResumeProjection` nao deve quebrar sem necessidade.
6. `ResumeConfig.sections`, `showPhoto`, `showLinks` e `accentColor` continuam respeitados.
7. O layout deve funcionar em:
   - rota autenticada de preview
   - rota publica `/{username}/resume`
   - rota publica `/{username}/{pageSlug}/resume`
   - impressao/PDF

### Direcao visual

Extrair da referencia:

- Identidade forte no topo.
- Nome e headline como ponto de entrada.
- Leitura em duas colunas no desktop.
- Conteudo principal priorizando resumo, experiencia e projetos.
- Coluna lateral para contatos, competencias, formacao e destaques compactos.
- Separadores discretos.
- Tipografia com hierarquia clara.
- Pouco uso de imagem, mantendo foto opcional.

Adaptar para FolioTree:

- Evitar logos decorativos que nao existam nos dados.
- Evitar texto fixo de exemplo.
- Evitar depender de Montserrat/Open Sans se o template canonico ja define familia propria.
- Manter cores do tema/projecao, com `accentColor` aplicado em detalhes.
- Priorizar legibilidade e interesse do visitante, nao apenas impressao documental.

### Estrutura proposta

Header:

- Foto opcional.
- Nome.
- Headline.
- Localizacao e contatos principais.
- Links principais quando `showLinks=true`.

Coluna principal:

- Resumo.
- Experiencia.
- Projetos.
- Destaques/provas relevantes.

Coluna lateral:

- Competencias agrupadas.
- Formacao.
- Links e contatos adicionais.

Mobile:

- Uma coluna.
- Header primeiro.
- Resumo e experiencia antes de listas auxiliares.
- Sem sobreposicao de textos ou chips.

Print:

- Remover sombras e fundos pesados.
- Preservar hierarquia e links legiveis.
- Evitar quebra ruim dentro de experiencias/projetos.

## Fases de entrega

### Fase 0 - planejamento e revisao

Entrega deste documento.

Criterio de aceite:

- Plano salvo em `docs/asset-gallery-and-resume-ui-plan.md`.
- Contratos de dados, API, UI e curriculo claros.
- Nenhuma implementacao feita antes da revisao.

### Fase 1 - galeria backend

Entregas:

- Implementar `GET /api/assets`.
- Reusar ownership existente via perfil autenticado.
- Criar presenter/normalizer de asset para nao vazar shape interno desnecessario.
- Testar listagem autenticada e bloqueio sem sessao.

Criterios de aceite:

- Usuario autenticado lista apenas suas imagens.
- Usuario sem sessao recebe `401`.
- A rota aceita filtros basicos sem quebrar.

### Fase 2 - componente de galeria

Entregas:

- Criar `AssetGalleryPicker`.
- Implementar estados vazio, carregando, erro, upload e selecao.
- Integrar upload novo dentro da galeria.

Criterios de aceite:

- Selecionar imagem existente chama `onSelect` sem `POST /api/assets/upload`.
- Upload novo chama `POST /api/assets/upload` uma vez e adiciona a imagem na galeria.
- File picker nao trava em uso repetido.

### Fase 3 - integracao no perfil

Entregas:

- Usar galeria para avatar.
- Usar galeria para capa de projeto.
- Manter preview imediato e remocao de imagem.

Criterios de aceite:

- Usuario troca avatar por imagem existente sem novo upload.
- Usuario envia uma imagem uma vez e consegue reutilizar em outro ponto.
- Capa de projeto grava `coverAssetId` quando o asset existir.

### Fase 4 - integracao no editor canonico

Entregas:

- Usar galeria nas imagens top-level.
- Usar galeria nas imagens de listas.
- Usar galeria nas capas de projeto do editor.
- Preservar controles de `fit`, `fill`, `crop`, `positionX` e `positionY`.

Criterios de aceite:

- `PUT /api/pages/[pageId]/blocks` recebe payload valido.
- Selecionar imagem existente nao gera upload.
- Preview do editor atualiza sem travar e sem erro 422 causado por assets/config inconsistentes.

### Fase 5 - UI nova do curriculo

Entregas:

- Recriar a direcao visual da referencia dentro de `ResumeView`.
- Ajustar somente a UI canonica do curriculo.
- Manter `ResumeProjection` e `ResumeConfig` como contrato principal.
- Garantir responsividade desktop/mobile/print.

Criterios de aceite:

- Rota autenticada e rotas publicas de resume renderizam o mesmo contrato.
- Nao ha import de `assets/curriculo-code`.
- Visitante consegue entender rapidamente quem e a pessoa, o que ela faz, principais experiencias e provas.
- Textos longos quebram corretamente e nao sobrepoem UI.

### Fase 6 - QA e validacao

Entregas:

- `npm run typecheck`
- `npm run lint`
- `npm run test`
- Build local se a mudanca tocar rotas ou render server.
- Playwright em fluxo real de usuario.

Cenarios Playwright:

- Login.
- Abrir perfil.
- Enviar foto pela galeria.
- Trocar avatar usando imagem existente.
- Abrir editor.
- Reutilizar a mesma imagem no preview/bloco.
- Confirmar que a segunda selecao nao faz upload.
- Abrir resume autenticado.
- Abrir resume publico.
- Verificar console sem erros novos.

## Fora de escopo da primeira entrega

- Dedupe real por hash antes do upload.
- Exclusao permanente de assets e limpeza de S3.
- Galeria para documentos, videos ou audio.
- Edicao completa de metadados de imagem.
- Migracao para `Profile.avatarAssetId`.
- Sistema de pastas/colecoes dentro da galeria.
- Importar ou executar a SPA de `assets/curriculo-code`.

## Riscos e mitigacoes

### Risco: duplicacao ainda pode ocorrer se o usuario enviar a mesma imagem de novo

Mitigacao:

- A primeira entrega reduz a duplicacao tornando a reutilizacao facil.
- Uma fase posterior pode calcular hash do arquivo e reaproveitar asset existente antes de gravar no S3.

### Risco: avatar nao tem `avatarAssetId`

Mitigacao:

- Manter `avatarUrl` na primeira entrega.
- Selecionar asset existente grava a URL no perfil.
- Avaliar migracao para `avatarAssetId` depois, se a rastreabilidade do avatar virar requisito.

### Risco: assets antigos sem dimensoes

Mitigacao:

- UI da galeria nao deve depender de `width` e `height`.
- O grid usa proporcao fixa e `object-fit`.

### Risco: editor gerar payload inconsistente

Mitigacao:

- Centralizar o mapper `asset -> EditableImageValue`.
- Centralizar o mapper `asset -> block.assets`.
- Cobrir selecao existente e upload novo nos testes do editor.

### Risco: referencia de curriculo ter CSS gerado demais

Mitigacao:

- Usar a referencia apenas para direcao visual.
- Reimplementar com Tailwind e componentes internos existentes.
- Remover dimensoes fixas geradas pelo Figma quando nao forem responsivas.

## Perguntas para revisao

1. A primeira entrega da galeria deve ser somente para imagens, como proposto?
2. Voce quer deduplicacao por hash ja nesta entrega, ou primeiro focamos em reutilizacao visual pela galeria?
3. Para avatar, podemos manter `Profile.avatarUrl` agora e adiar `avatarAssetId`?
4. No curriculo, a foto deve aparecer por padrao quando `showPhoto=true`, ou prefere manter uma abordagem mais textual por padrao?

## Decisao recomendada

Seguir com uma primeira entrega sem migracao de banco para avatar e sem dedupe por hash. Isso entrega o ganho principal rapidamente: o usuario envia uma imagem uma vez e reutiliza em perfil/editor sem novo upload.

Depois que a galeria estiver validada, abrir uma segunda entrega de otimizacao de storage com hash de conteudo, deteccao de duplicados e politica de limpeza de assets nao usados.

## Memoria de execucao

Status da implementacao: concluida localmente.

Arquivos principais entregues:

- `app/api/assets/route.ts`
- `app/api/assets/upload/route.ts`
- `components/assets/AssetGalleryPicker.tsx`
- `components/profile/ProfileEditor.tsx`
- `components/pages/CanonicalPageEditor.tsx`
- `components/resume/ResumeView.tsx`
- `lib/server/domain/assets.ts`
- `lib/storage/public-url.ts`
- `lib/validations.ts`
- `tests/domain/assets-domain.test.ts`

Contratos implementados:

- `GET /api/assets` lista assets do perfil autenticado com filtro por `kind`, `status`, `limit` e `cursor`.
- A galeria sempre reutiliza um `Asset` existente quando o usuario escolhe uma foto ja enviada.
- Upload novo continua passando por `POST /api/assets/upload`, criando `Asset` e retornando URL utilizavel no app.
- URLs S3 de assets da galeria sao apresentadas via `/api/assets/proxy?key=...`.
- URLs locais `/uploads/...` tambem sao aceitas pela validacao para ambiente local.
- O editor canonico mantem `config`, `assets`, `fitMode`, `positionX` e `positionY`.
- O curriculo continua usando `ResumeProjection` e `ResumeConfig`; `assets/curriculo-code` permanece apenas como referencia visual.

Validacao local executada:

- Playwright em `http://127.0.0.1:3000/profile`: troca de avatar pela galeria duas vezes seguidas, sem seletor nativo travando, com `GET /api/assets` e `PATCH /api/profile` retornando `200`.
- Playwright em `http://127.0.0.1:3000/pages/cmo8ztx3a0002138ji2py1snu/editor`: troca de imagem do preview pela galeria, sem novo upload, e `PUT /api/pages/cmo8ztx3a0002138ji2py1snu/blocks` retornando `200`.
- Playwright em `http://127.0.0.1:3000/osman-ramirez/resume`: UI nova do curriculo renderizada em desktop e mobile sem erros de console.
- `npx prettier --check` nos arquivos alterados.
- `npm run typecheck`.
- `npm run lint`.
- `npm run test`.
- `npm run build`.

Observacoes:

- O build falhou uma vez por lock do Prisma gerado pelo dev server local em execucao; depois de encerrar apenas os processos Node do projeto, o build passou.
- A pasta `assets/curriculo-code` segue fora do commit por ser materia-prima de referencia, nao runtime.
