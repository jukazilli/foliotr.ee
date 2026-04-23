# Landing Carousel First Block Plan

## Status

- Branch de trabalho: `feat/landing-carousel-study`
- Escopo atual: primeiro corte implementado no `Hero`
- Implementacao: carrossel de 5 cards integrado

## Decisoes aprovadas depois do plano

- O primeiro corte usa `5` cards.
- O card assume o protagonismo total do primeiro bloco.
- O CTA lateral original do `Hero` nao participa deste corte.
- A copy dos cards foi reaproveitada da landing existente, sem criar narrativa nova.
- Os assets de video do estudo foram copiados para `public/landing-carousel/videos/` para servir o app principal.
- A landing publica foi reduzida ao primeiro bloco para este experimento.
- A navbar desktop passou a funcionar como overlay discreto, aparecendo ao mover o mouse.

## Objetivo do corte

Transformar apenas o primeiro bloco da landing atual em uma experiencia de carrossel com rotacao por `wheel`, usando como materia-prima estrutural a referencia clonada em `landing-test/material/carousel-standalone`, mas aplicada ao sistema visual do `foliotree`.

O corte inicial nao tenta resolver a landing inteira. Ele valida:

- mecanica de leitura do primeiro bloco
- comportamento do carrossel com `wheel`
- fidelidade estrutural ao modelo de referencia
- aplicacao da paleta do `foliotree` como tonal system
- uso dos videos/imagens ja existentes na materia-prima

## Estado atual encontrado

### Landing atual

- A landing publica monta a pagina em [app/page.tsx](/c:/projetos/foliotree/app/page.tsx).
- O primeiro bloco esta em [components/landing/Hero.tsx](/c:/projetos/foliotree/components/landing/Hero.tsx).
- O `Hero` atual possui:
  - coluna editorial com headline, subtitulo e CTA
  - preview de produto com dados da `Ana Correa`
  - badges, metadata e tabs auxiliares

### Materia-prima de referencia

- A referencia clonada usa `framer-motion` e sobreposicao de cards em [landing-test/material/carousel-standalone/app/components/CarouselScene.tsx](/c:/projetos/foliotree/landing-test/material/carousel-standalone/app/components/CarouselScene.tsx).
- O card expandido/colapsado esta em [landing-test/material/carousel-standalone/app/components/FantasyCard.tsx](/c:/projetos/foliotree/landing-test/material/carousel-standalone/app/components/FantasyCard.tsx).
- Os assets existentes estao em `landing-test/material/carousel-standalone/public/videos/`.
- A referencia atual nasce no meio da pilha e usa `activeIndex = Math.floor(cards.length / 2)`.

### Paleta e tokens do FolioTree

- Os tokens-base estao em [app/globals.css](/c:/projetos/foliotree/app/globals.css).
- Familias e grupos relevantes para este corte:
  - `lime-*`
  - `blue-*`
  - `green-*`
  - `cyan-*`
  - `violet-*`
  - `neutral-*`
  - `coral-*`

## Contrato de produto deste corte

### O que entra

- Substituir a estrutura do preview atual do `Hero` por um carrossel de cards.
- Manter o primeiro bloco como ponto de entrada da landing.
- Fazer a rotacao dos cards com `wheel` do mouse.
- Comecar o fluxo no primeiro card, e nao no meio.
- Converter o conteudo principal do card para:
  - `h1` grande
  - uma frase de impacto logo abaixo
- Reusar os videos/imagens ja existentes na materia-prima.
- Aplicar combinacoes cromaticas baseadas na paleta do `foliotree`.

### O que sai do primeiro card

- `foliotree.com/@ana`
- `ao vivo`
- `AC`
- `Ana Correa`
- bio descritiva da Ana
- blocos de experiencia, versao, pagina, curriculo
- blocos `Case`, `Projeto`, `Prova`
- bloco `Seu trabalho, com contexto`
- tabs `Perfil`, `Projetos`, `Provas`

### O que deve ser preservado

- headline principal e frase de impacto do topo, no mesmo espirito do bloco atual
- leitura limpa e intuitiva
- fidelidade maxima ao comportamento estrutural do carrossel de referencia
- uso de assets reais ja existentes como placeholder

### O que fica explicitamente fora deste corte

- personagens
- novas geracoes de imagem/video
- redesign completo das secoes seguintes da landing
- nova arquitetura de copy para a pagina inteira
- ajustes globais de branding fora da superficie do primeiro bloco

## Contrato de copy

Este corte nao deve inventar narrativa nova nem preencher lacunas de marketing.

Regras:

- manter como base a copy ja presente hoje no `Hero`
- reduzir o texto do card ao minimo necessario
- nao reintroduzir taxonomia interna, metadados ficticios ou labels documentais
- nao criar claims novas sem aprovacão explicita

Hipotese operacional para a implementacao:

- reaproveitar o `h1` atual como titulo do card inicial
- reaproveitar a frase de apoio atual como frase de impacto do card inicial

Se surgir necessidade de copy adicional para navegacao do carrossel, ela deve ser funcional e minima.

## Contrato de fidelidade estrutural

### Base obrigatoria

Consumir como base tecnica:

- empilhamento de cards com profundidade
- card ativo centralizado
- cards adjacentes parcialmente visiveis
- transicao com `framer-motion`
- uso de video ou gradiente dentro do card

### Adaptacoes permitidas

- trocar o ponto de partida do centro para o primeiro card
- remover o modo expandido/CTA do card de referencia se ele atrapalhar a leitura
- simplificar o conteudo interno do card para `h1 + frase`
- ajustar proporcoes do card para o grid do `Hero`
- aplicar o tonal system do `foliotree`

### Adaptacoes proibidas neste corte

- transformar o carrossel em slider generico de tela cheia sem sobreposicao
- trocar a leitura em camadas por uma grade comum
- introduzir visual futurista/tech excessivo
- deixar a mecanica principal dependente de clique em vez de `wheel`

## Contrato de cor e tonal system

Direcao aprovada pelo pedido:

- se o card usar verde/abacate como tom dominante, o background deve contrastar com azul eletrico ou azul profundo do sistema
- se o card usar verde musgo, a tipografia deve ir para branco ou off-white
- o contraste entre card e fundo deve ser complementar, nao monocromatico

Proposta de pareamentos iniciais usando tokens existentes:

1. Card `green-900` ou `lime-900`
   Background `blue-500` ou `blue-700`
   Texto `neutral-50`

2. Card `lime-500`
   Background `blue-900`
   Texto `neutral-900` no card e `neutral-50` fora do card

3. Card `blue-700`
   Background `green-300` ou `lime-200`
   Texto `neutral-50`

4. Card `cyan-500`
   Background `green-900`
   Texto `neutral-900` ou `neutral-50` conforme contraste final

Observacao:

- os pareamentos acima sao contratos de partida, nao grade final de arte
- a implementacao deve usar tokens existentes antes de criar novos hexadecimais

## Contrato de layout e navegacao

- o carrossel deve comecar no inicio da sequencia
- a leitura inicial precisa nascer no topo do fluxo, nao no meio
- o primeiro card deve ser imediatamente compreensivel sem interacao previa
- a `wheel` deve avancar ou retroceder um card por gesto controlado
- o sistema deve evitar sensacao de perda de controle ou rolagem excessiva

## Contrato de performance e alta densidade

O pedido menciona evitar efeito de `zoom` em telas de alta densidade. Para este corte, isso sera tratado assim:

- evitar escalas exageradas baseadas apenas em `transform: scale()`
- usar `clamp()` para headline, subtitulo e largura util do card
- limitar largura maxima do palco do `Hero`
- manter videos com `object-fit: cover` e recorte previsivel
- preservar nitidez tipografica e espacamento sem inflar o bloco em telas muito densas

Risco identificado:

- [app/globals.css](/c:/projetos/foliotree/app/globals.css) reduz `html font-size` em breakpoints muito largos; isso pode interferir na percepcao de escala

Decisao para este corte:

- nao alterar a politica global ainda
- desenhar o primeiro bloco para ser resiliente a esse contexto
- reavaliar a escala global apenas se o teste visual continuar aparentando `zoom`

## Write set proposto

Arquivos candidatos para o primeiro corte de implementacao:

- [components/landing/Hero.tsx](/c:/projetos/foliotree/components/landing/Hero.tsx)
- possivel novo componente local para o carrossel em `components/landing/`
- possivel stylesheet utilitario em [app/globals.css](/c:/projetos/foliotree/app/globals.css) apenas se necessario para tokens/efeitos reutilizaveis

Arquivos de referencia a consumir sem copiar cegamente:

- [landing-test/material/carousel-standalone/app/components/CarouselScene.tsx](/c:/projetos/foliotree/landing-test/material/carousel-standalone/app/components/CarouselScene.tsx)
- [landing-test/material/carousel-standalone/app/components/FantasyCard.tsx](/c:/projetos/foliotree/landing-test/material/carousel-standalone/app/components/FantasyCard.tsx)
- [landing-test/material/carousel-standalone/app/data/fantasyCards.ts](/c:/projetos/foliotree/landing-test/material/carousel-standalone/app/data/fantasyCards.ts)

## Write set executado

- [components/landing/Hero.tsx](/c:/projetos/foliotree/components/landing/Hero.tsx)
- [components/landing/HeroCarousel.tsx](/c:/projetos/foliotree/components/landing/HeroCarousel.tsx)
- [components/landing/heroCarouselCards.ts](/c:/projetos/foliotree/components/landing/heroCarouselCards.ts)
- [public/landing-carousel/videos](/c:/projetos/foliotree/public/landing-carousel/videos)
- [tsconfig.json](/c:/projetos/foliotree/tsconfig.json)
- `package.json` e `package-lock.json` com adicao de `framer-motion`

## Plano de execucao proposto

1. Extrair a mecanica do carrossel de referencia
2. Redesenhar a estrutura interna do card para o modelo `h1 + frase`
3. Integrar o carrossel no `Hero` atual
4. Reaplicar a paleta do `foliotree` como tonal system
5. Configurar inicio no primeiro card
6. Ajustar `wheel`, foco e acessibilidade de navegacao
7. Validar em desktop e mobile

## Validacao prevista

- `npm run lint`
- abrir a landing localmente
- validar que o primeiro bloco inicia no primeiro card
- validar que a `wheel` gira o carrossel de forma previsivel
- validar que os cards continuam legiveis em tela densa
- validar que os assets atuais continuam renderizando

## Validacao executada

- `npm run lint` executado com sucesso
- `npm run typecheck` executado com sucesso
- app principal subida localmente em `http://127.0.0.1:3001`
- `GET /` retornando `200`

## Observacoes de implementacao

- O carrossel comeca no primeiro card e avanca por `wheel` apenas enquanto ainda houver cards a percorrer.
- Nos limites inicial e final, a rolagem volta a ficar disponivel para o restante da pagina.
- O `typecheck` do `foliotree` precisou excluir `landing-test/`, porque o material de estudo clonado possui seu proprio stack React/Next e nao deve participar do app principal.
- No segundo ciclo, a pilha foi reposicionada mais para a esquerda para reforcar a leitura "desde o começo", deixando os proximos cards mais legiveis na trilha visual da direita.
- No segundo ciclo, o `wheel` passou a ser capturado tambem no nivel da janela enquanto o Hero domina a viewport, para manter o gesto principal do carrossel mesmo sem foco preciso no container.
- No ciclo atual, as secoes seguintes da landing foram removidas do `app/page.tsx` para que o experimento mantenha apenas o Hero.
- No ciclo atual, o Hero passou a ocupar a viewport disponivel inteira.
- No ciclo atual, a tipografia interna dos cards foi recalibrada com `clamp()` mais agressivo para evitar quebra ruim e efeito de zoom em telas menores.
- No ciclo atual, os links mortos da navbar foram removidos e o header desktop passou a aparecer apenas quando ha movimento do cursor perto do topo.

## Criterios de aceite para comecar a implementacao

- branch criada
- superficie de codigo mapeada
- contrato de escopo fechado
- regra de copy minimizada
- regra de fidelidade estrutural fechada
- write set claro

## Pendencias para o proximo passo

- aprovar este plano
- confirmar se o carrossel do primeiro corte tera `3`, `4` ou `5` cards
- confirmar se o CTA principal do topo continua visivel ao lado do carrossel ou se o card assume todo o protagonismo do primeiro bloco
