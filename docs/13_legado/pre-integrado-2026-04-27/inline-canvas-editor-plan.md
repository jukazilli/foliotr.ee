# Plano de Evolucao do Editor Inline no Canvas

Status: pronto para revisao  
Data: 2026-04-20  
Escopo: UX, arquitetura de interacao e plano de execucao para `/pages/[pageId]/editor`  
Implementacao: bloqueada ate aprovacao desta documentacao

## Objetivo

Substituir o modelo atual de edicao baseado em:

- rail esquerdo de blocos
- preview central
- inspector lateral com formulario separado

por um modelo de edicao inline no proprio preview, com curva de aprendizagem proxima de PowerPoint/Figma/Canva:

- o usuario clica no bloco diretamente no canvas
- o bloco selecionado mostra seus controles no topo do proprio bloco
- textos ficam editaveis no proprio lugar
- icones podem ser ocultados/restaurados por um pequeno controle local
- imagens passam a ser ajustadas dentro do frame, por drag, sem quebrar o layout

## Estado Atual Encontrado

Fonte real atual:

- rota: `app/(app)/pages/[pageId]/editor/page.tsx`
- editor client: `components/pages/CanonicalPageEditor.tsx`
- renderer: `components/templates/TemplateRenderer.tsx`
- contrato: `docs/templates-architecture.md`
- contrato canonico: `docs/templates-canonical-contract.md`

O editor hoje ja suporta:

- selecao de bloco por lista
- reorder por API
- hide/show por API
- add/remove de blocos
- upload de imagem
- draft local antes de salvar
- preview real via `TemplateRenderer`

Limite estrutural atual:

- a selecao existe em nivel de `PageBlock`, nao em nivel de elemento renderizado
- o `TemplateRenderer` nao expoe, de forma padronizada, “slots” clicaveis de texto, imagem ou icone
- o inspector e o canvas sao superficies separadas, o que cria friccao visual e cognitiva

Conclusao:

para entregar a UX pedida sem heuristica fragil, o editor precisa evoluir do conceito “bloco selecionado por lista” para “bloco e slots internos selecionados no canvas”.

## Decisao Arquitetural

### 1. O canvas continua renderizando o template real

Nao vamos trocar `TemplateRenderer` por um canvas paralelo.

O preview continua sendo a fonte visual real. A nova camada sera uma “camada de interacao” por cima do renderer.

### 2. Precisamos de um contrato de elementos editaveis

Nao e seguro depender de `querySelector` por texto, posicao ou classe CSS do template.

Precisamos introduzir um contrato explicito de “editable slots” no renderer canonico. Exemplo conceitual:

- `data-ft-block-id`
- `data-ft-slot`
- `data-ft-kind="text|image|icon|group"`
- `data-ft-editable="true"`

Isso permite:

- detectar clique no bloco
- detectar clique no texto especifico dentro do bloco
- detectar imagem/icones sem acoplamento ao CSS visual

### 3. A UI nova sera overlay, nao reflow

Os controles do bloco nao devem empurrar o layout do preview.

Entao os botoes de:

- subir
- descer
- visivel
- oculto

devem ser overlays posicionados sobre o topo do bloco selecionado.

Isso evita quebrar o layout do template e mantem a fidelidade visual da preview.

### 4. Texto inline sera plain-text first

Os campos editaveis do template hoje sao texto simples e longText, nao rich text semantico completo.

Entao a escolha correta para v1 e:

- editar texto inline com `textarea`/`contentEditable` controlado por overlay
- nao introduzir editor rich text completo no primeiro corte

Isso reduz bundle, complexidade e risco de inconsistencias entre renderer e persistencia.

### 5. Imagem inline precisa de modelo proprio de frame

Para suportar:

- drag da imagem dentro do frame
- modos `fit`, `fill`, `crop`
- persistencia da posicao

precisamos persistir metadados de apresentacao do asset no `config` do bloco, sem depender so de `assets`.

Modelo sugerido para imagens:

```ts
type ImagePresentation = {
  src: string;
  alt?: string;
  mode: "fit" | "fill" | "crop";
  focalX: number; // 0..100
  focalY: number; // 0..100
  hidden?: boolean;
};
```

Isso fica em JSON e nao exige migration Prisma, porque o editor ja persiste `config`/`assets` em JSON.

## UX Alvo

### Fluxo de selecao

1. Hover no bloco:
   - contorno sutil
   - cursor de area editavel
2. Clique no bloco:
   - bloco vira selecionado
   - toolbar overlay aparece no topo do bloco
3. Clique em texto dentro do bloco selecionado:
   - o texto entra em modo de edicao
   - aparece caixa de edicao no proprio bounding box
4. Clique em imagem:
   - imagem entra em modo de ajuste
   - aparecem opcoes `fit`, `fill`, `crop`
   - drag reposiciona a imagem dentro do frame
5. Clique em icone:
   - aparece um `x` pequeno para ocultar
   - novo clique restaura

### Regras de comportamento

- so um bloco selecionado por vez
- so um slot interno editando por vez
- `Esc` sai da edicao do slot
- `Enter` confirma textos curtos
- `Cmd/Ctrl+Enter` confirma textos longos
- blur nao deve salvar sem criterio; o correto e salvar no commit da interacao
- toolbar do bloco deve flutuar sem alterar o layout da preview

## Slices de Implementacao

### Slice 0 - Fundacao e contrato de slot

Objetivo:

- definir infraestrutura para o canvas reconhecer blocos e slots internos

Entrega:

- especificar shape de `EditableSlotMeta`
- adicionar atributos `data-ft-*` no renderer canonico
- criar utilitarios de hit-test no editor
- validar que clique em um bloco identifica `blockId`

Arquivos alvo:

- `components/templates/portfolio-community/PortfolioCommunityRenderer.tsx`
- `components/templates/TemplateRenderer.tsx`
- `components/pages/CanonicalPageEditor.tsx`
- possivel helper novo em `lib/templates/` ou `components/pages/`

Aceite:

- clicar no preview seleciona bloco sem usar a lista lateral
- nenhum layout do template muda visualmente

### Slice 1 - Chrome inline de bloco

Objetivo:

- mover os controles estruturais do inspector para o topo do bloco selecionado

Entrega:

- overlay toolbar por bloco com:
  - subir
  - descer
  - olho
  - olho cortado
- sem labels textuais, apenas icones
- posicionamento robusto ao scroll e resize

Aceite:

- reorder e hide/show continuam chamando as mesmas APIs atuais
- toolbar acompanha o bloco selecionado
- nao ha deslocamento visual do template

### Slice 2 - Texto inline

Objetivo:

- editar texto diretamente no canvas

Entrega:

- selecionar slot de texto dentro do bloco
- overlay de edicao alinhado ao retangulo do texto
- componentes:
  - `InlineTextEditor` para texto curto
  - `InlineTextareaEditor` para longText
- draft local por slot, commit para `draftConfig`, depois save

Aceite:

- clique em texto curto entra em modo de edicao
- clique em texto longo abre edicao inline sem empurrar layout
- preview reflete o draft antes do save final

### Slice 3 - Icones inline

Objetivo:

- permitir ocultar/restaurar icones decorativos e sociais localmente

Entrega:

- slot `icon`
- pequeno botao `x` no canto do icone quando selecionado
- estado salvo em config, por exemplo:
  - `hiddenIcons: string[]`
  - ou `icons.<id>.hidden = true`

Aceite:

- ocultar nao quebra alinhamento do bloco
- restaurar e idempotente

### Slice 4 - Imagem inline por frame

Objetivo:

- transformar toda imagem editavel em “frame + media presentation”

Entrega:

- selecao da imagem no canvas
- modos `fit`, `fill`, `crop`
- drag interno com limites do frame
- persistencia de `focalX/focalY/mode`

Aceite:

- a imagem nunca sai visualmente do frame
- ao soltar, a posicao e persistida
- `fit/fill/crop` alteram o comportamento sem quebrar o template

### Slice 5 - Reducao da poluicao lateral

Objetivo:

- encolher radicalmente o inspector lateral, sem matar funcoes de suporte

Entrega:

- a rail esquerda deixa de ser seletor principal e vira:
  - visao de estrutura
  - add block
  - navegacao secundaria
- o painel direito deixa de ser editor principal e vira:
  - estado do bloco
  - fallback controls
  - propriedades nao inline

Aceite:

- a edicao principal acontece no canvas
- rails laterais viram apoio, nao dependencia

### Slice 6 - Persistencia, acessibilidade e performance

Objetivo:

- consolidar comportamento sem degradar o editor

Entrega:

- teclado:
  - Tab
  - Esc
  - Enter/Ctrl+Enter
- throttling/debouncing de resize e reposicionamento
- invalidacao de overlays ao trocar preview mode
- testes de hit area e persistencia de imagem

Aceite:

- sem flicker de overlays
- sem drift de posicao ao scrollar
- sem regressao no save atual

## Bibliotecas Avaliadas

### Recomendacao principal

#### `@floating-ui/react-dom`

Uso proposto:

- posicionar toolbar do bloco
- posicionar editor inline de texto
- reposicionar overlays em scroll/resize

Motivo:

- resolve exatamente o problema de overlay ancorado a um elemento do DOM
- e toolkit de posicionamento, nao componente pronto pesado
- mantem controle total do layout

Leitura oficial:

- https://floating-ui.com/docs/react

Ponto relevante da doc:

- `useFloating()` retorna refs e estilos de posicionamento
- `autoUpdate` mantem o overlay ancorado em scroll e resize
- `@floating-ui/react-dom` existe justamente para caso de posicionamento sem precisar de todo o pacote de interacoes

Decisao:

- aprovado para o plano

#### Nativo DOM + Pointer Events

Uso proposto:

- selecao de bloco/slot
- hit test
- inline text activation
- drag simples de imagem se o comportamento ficar sob controle

Motivo:

- menor bundle
- menor acoplamento
- total previsibilidade com o renderer existente

Decisao:

- base padrao do corte

### Recomendacao opcional

#### `@use-gesture/react`

Uso proposto:

- drag de imagem dentro do frame, caso a implementacao nativa comece a ficar verbosa

Motivo:

- `useDrag` cobre bem o caso de arraste
- suporta `bounds`
- suporta `filterTaps`
- suporta `preventDefault`

Leitura oficial:

- https://use-gesture.netlify.app/docs/gestures/
- https://use-gesture.netlify.app/docs/options/

Pontos relevantes da doc:

- `useDrag` e o hook correto para drag
- `bounds` pode restringir o gesto
- `filterTaps` ajuda a separar clique de arraste
- `preventDefault` ajuda com imagens/links arrastaveis

Decisao:

- opcional, entrar apenas se o drag nativo passar do ponto de complexidade aceitavel

#### `react-easy-crop`

Uso proposto:

- fallback para uma etapa posterior ou modal de ajuste de imagem mais avancado

Motivo:

- resolve crop/zoom/objectFit
- tem suporte claro a `objectFit`

Leitura oficial:

- https://github.com/ValentinH/react-easy-crop

Pontos relevantes da doc:

- auto injeta CSS por padrao
- tem `objectFit`
- possui caveat conhecido em modal com animacao de escala

Decisao:

- nao usar na primeira implementacao inline no canvas
- manter como fallback se o ajuste de imagem pedir crop mais pesado no futuro

### Bibliotecas avaliadas e descartadas para v1

#### Lexical

Leitura oficial:

- https://lexical.dev/

Motivo para nao usar agora:

- excelente para editor de texto rich text, mas o problema atual nao e escrever documento rico
- nosso caso e edicao puntual de textos simples sobre um renderer existente
- introduzir um editor de documento completo aqui aumenta muito a superficie sem resolver o problema estrutural do canvas

Decisao:

- descartado para v1

#### Tiptap

Leitura oficial:

- https://tiptap.dev/docs/editor/getting-started/install/react

Motivo para nao usar agora:

- mesmo problema do Lexical
- bom para rich text e documento, nao para “editar slots do template” com baixo overhead

Decisao:

- descartado para v1

## Impacto no Contrato do Template

Esse update exige evolucao controlada do contrato canonico.

Hoje o contrato fala em:

- blocos editaveis
- fields allowlisted
- assets por bloco

Para o editor inline, precisaremos adicionar o conceito de:

- slot editavel dentro do bloco
- tipo de slot
- relacionamento entre slot e `config` path

Modelo conceitual:

```ts
type EditableSlotMeta = {
  id: string;
  blockId: string;
  kind: "text" | "longText" | "image" | "icon";
  configPath: string;
  removable?: boolean;
};
```

Isso pode nascer primeiro como contrato interno do renderer canonico, sem migrar todo o sistema de templates de uma vez.

## Riscos Reais

### 1. Genericidade excessiva cedo demais

Se tentarmos resolver “qualquer template, qualquer elemento, qualquer nesting” no primeiro corte, o projeto expande demais.

Mitigacao:

- pilotar primeiro no `portfolio-community`
- criar contrato reutilizavel, mas validar no template canonico atual

### 2. Overlay drift

Toolbar e editores inline podem desalinhar com scroll, resize e escala da preview.

Mitigacao:

- usar overlay ancorado a bounding rect real
- reposicionamento com `autoUpdate`
- invalidar e recalcular em resize/scroll/previewScale

### 3. Imagem drag conflitando com scroll

Mitigacao:

- `filterTaps`
- `preventDefault` quando necessario
- arraste habilitado apenas quando a imagem esta em modo ativo de ajuste

### 4. Texto inline quebrando renderer

Mitigacao:

- editor inline nao altera DOM estrutural do template
- ele renderiza overlay alinhado ao retangulo do texto
- o renderer continua puro

## Provas de viabilidade antes de codar

Antes de comecar a implementacao, a primeira spike deve provar:

1. um bloco do `portfolio-community` pode expor `data-ft-block-id`
2. um texto do hero pode expor `data-ft-slot`
3. o editor consegue clicar nesse elemento e obter seu `configPath`
4. um overlay pode ser ancorado ao elemento sem empurrar layout

Se essa spike falhar, a implementacao deve ser revista antes de entrar nos slices seguintes.

## Ordem Recomendada de Execucao

1. Slice 0
2. Slice 1
3. Slice 2
4. Slice 4
5. Slice 3
6. Slice 5
7. Slice 6

Motivo:

- bloco e texto precisam existir antes da imagem
- imagem inline e a parte de maior risco tecnico
- icone pode entrar depois que o contrato de slot ja existir

## Fora de Escopo Neste Corte

- free transform de blocos
- drag and drop livre no canvas
- rich text completo
- comentario colaborativo
- undo/redo completo
- crop profissional estilo Photoshop
- suporte universal para todos os templates antes da prova no `portfolio-community`

## Definicao de Pronto da Documentacao

Esta documentacao esta pronta quando:

- a nova UX fica quebrada em slices claros
- a necessidade de evolucao do contrato e explicitada
- as bibliotecas foram avaliadas com criterio
- ha uma recomendacao objetiva do que usar e do que nao usar
- a execucao pode comecar sem rediscutir a fundacao tecnica

## Progresso de execucao

### Slice 0 e Slice 1 base entregues em 2026-04-20

Status:

- renderer `portfolio-community` agora expõe `data-ft-block-id`, `data-ft-kind` e `data-ft-config-path` nos principais blocos e slots de texto
- o `CanonicalPageEditor` já permite selecionar o bloco diretamente no canvas
- os controles de ordem e visibilidade agora aparecem sobre o bloco selecionado no topo da preview
- clique em slots de texto mapeados abre um editor inline sobreposto no canvas
- o inspector lateral continua ativo como fallback para edição completa

Arquivos-base deste slice:

- `components/templates/portfolio-community/PortfolioCommunityRenderer.tsx`
- `components/pages/CanonicalPageEditor.tsx`

Validacao executada:

- `npm run lint`
- `npm run test -- tests/templates/template-domain.test.ts tests/templates/template-semantic-mapper.test.ts`
- `npm run build`

### Slice 2 parcial entregue em 2026-04-20

Status:

- o bloco selecionado agora expõe highlights visuais para todos os slots editáveis mapeados
- slots de imagem top-level (`hero.portrait` e `contact.image`) já podem ser selecionados direto na preview
- o editor inline de imagem agora mostra toolbar contextual com `Fit`, `Fill`, `Crop`, `Trocar` e `Remover`
- imagens com `fill/crop` podem ser arrastadas dentro do frame; ao soltar, a posição é persistida no bloco
- a semântica do `portfolio-community` passou a aceitar `fitMode`, `positionX` e `positionY` em imagens top-level

Arquivos-base deste slice:

- `components/pages/CanonicalPageEditor.tsx`
- `components/templates/portfolio-community/PortfolioCommunityRenderer.tsx`
- `lib/templates/portfolio-community-semantics.ts`

Validacao executada:

- `npm run lint`
- `npm run test -- tests/templates/template-domain.test.ts tests/templates/template-semantic-mapper.test.ts tests/templates/resume-projection.test.ts`
- `npm run build`

### Slice 3 entregue em 2026-04-20

Status:

- ornamentos e icones sociais do `hero` viraram campos booleanos persistidos no bloco
- clique nesses elementos no canvas abre controle inline de ocultar/restaurar
- quando ocultos, placeholders discretos permanecem no canvas para permitir restauracao sem depender do painel lateral
- o inspector lateral tambem passou a exibir esses toggles

Arquivos-base deste slice:

- `components/pages/CanonicalPageEditor.tsx`
- `components/templates/portfolio-community/PortfolioCommunityRenderer.tsx`
- `assets/template/portfolio-community/manifest.ts`
- `lib/templates/portfolio-community-semantics.ts`

Validacao executada:

- `npm run lint`
- `npm run build`

### Slice 4 parcial entregue em 2026-04-20

Status:

- imagens top-level (`hero.portrait`, `contact.image`) seguem com `fit`, `fill`, `crop`, drag e persistencia
- `fallbackProjects.image` agora tambem pode ser selecionada direto no canvas quando o card vem do repeater local
- cards de fallback expõem `configPath` por indice, permitindo trocar, remover e reposicionar a imagem inline
- cards derivados de projetos selecionados continuam read-only no canvas para evitar conflito entre conteudo derivado e override manual

Arquivos-base deste slice:

- `components/pages/CanonicalPageEditor.tsx`
- `components/templates/portfolio-community/PortfolioCommunityRenderer.tsx`
- `lib/templates/portfolio-community-semantics.ts`

Validacao executada:

- `npm run lint`
- `npm run test -- tests/templates/template-domain.test.ts tests/templates/template-semantic-mapper.test.ts tests/templates/resume-projection.test.ts`
- `npm run build`

### Slice 5 parcial entregue em 2026-04-20

Status:

- o painel lateral agora deixa de listar campos que ja estao editaveis inline no canvas
- o inspector passou a priorizar apenas campos ainda dependentes de painel, como listas e links
- quando um bloco pode ser editado quase todo na preview, o painel indica isso explicitamente
- a preview agora exibe uma dica contextual curta no bloco ativo para reforcar a interacao direta
- o editor inline de texto ganhou chrome proprio com estado de caixa ativa, acoes explicitas de salvar/cancelar e hints de teclado
- `Esc` fecha a edicao inline atual e `Ctrl/Cmd + S` salva o bloco selecionado

Arquivos-base deste slice:

- `components/pages/CanonicalPageEditor.tsx`

Validacao executada:

- `npm run lint`
- `npm run build`

### Slice 6 parcial entregue em 2026-04-20

Status:

- o editor agora expõe mensagens de feedback em regiao `aria-live`
- o canvas recebeu papeis e labels mais explicitos para tecnologia assistiva
- overlays de selecao e edicao passaram a evitar re-render quando o frame calculado nao mudou de fato
- os refinamentos de foco e teclado foram consolidados sem reestruturar o renderer

Arquivos-base deste slice:

- `components/pages/CanonicalPageEditor.tsx`

Validacao executada:

- `npm run lint`
- `npm run build`

### Pendencias imediatas do proximo slice

- substituir o editor de texto simples por affordance mais proxima de caixa ativa de apresentacao
- decidir se imagens derivadas de projetos selecionados devem continuar read-only ou ganhar um nivel de override local
- decidir se o plano segue com otimizaçao adicional ou migra para polimento visual / browser QA

### Retomada de Slice 6 em 2026-04-21

Status:

- os overlays de slots editaveis do canvas passaram de marcadores puramente visuais para botoes focaveis com `aria-label`
- `Enter` e `Espaco` ativam o slot focado, mantendo o mesmo fluxo de edicao usado pelo clique
- setas direcionais navegam entre os slots editaveis do bloco selecionado sem abrir edicao acidentalmente
- a limpeza de estado inline tambem cobre imagens de listas, evitando residuo de foco/editor em casos derivados

Arquivos-base deste ajuste:

- `components/pages/CanonicalPageEditor.tsx`
- `docs/inline-canvas-editor-plan.md`

## Proximo passo

Entrar em fechamento final e QA do editor inline, porque a fundacao dos Slices 0 a 6 ja foi coberta de forma executavel.
