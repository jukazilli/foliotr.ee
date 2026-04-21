# Planejamento: polimento do editor, projetos e carrossel

Data: 2026-04-21

Status: planejamento para revisao. Nao iniciar implementacao antes de aprovacao explicita.

## Objetivo

Transformar a secao de projetos em uma experiencia editavel diretamente no preview:

- quando houver mais de um projeto visivel, renderizar projetos em carrossel
- permitir upload de capa do projeto no perfil base
- permitir ajuste de imagem de projeto com o mesmo contrato visual do hero: `fit`, `fill`, `crop`, `positionX`, `positionY`
- permitir ocultar itens individuais do carrossel no contexto da pagina/template sem apagar o projeto base
- remover a lista lateral de blocos da interface visivel, mantendo apenas a logica interna de selecao
- transferir acoes de edicao para controles contextuais no bloco ativo
- mover a acao de adicionar bloco para o topo do canvas, mantendo a insercao ao final do template

## Principios do corte

- O preview vira a superficie principal de edicao. Barras laterais so permanecem se ainda houver campo sem alternativa contextual.
- Dados canonicos continuam vindo do perfil base e das selecoes da versao. O template pode ter overrides de exibicao, mas nao deve duplicar o projeto.
- Ocultar um item no carrossel e uma decisao da pagina/template. Nao exclui o projeto, nao remove da versao e nao altera o curriculo base fora daquele contexto.
- Imagem fallback do template nao deve ser gravada no projeto. Se a pessoa nao subir capa no perfil base, o portfolio pode usar fallback visual do template; o curriculo continua priorizando texto.
- UI visivel deve usar icones e estados. Textos longos ficam em `aria-label`, `title`, tooltips ou `sr-only`, nao como instrucoes permanentes.
- Cada recorte termina com validacao, commit e sync no Git.

## Estado Atual Encontrado

- `Project` ja possui `imageUrl` e `coverAssetId`, mas nao possui campos persistentes para enquadramento da capa.
- `ProfileEditor` ainda edita imagem do projeto como input textual de URL.
- `portfolio-community` renderiza `portfolio.work` em grid de ate 2 itens, nao em carrossel.
- A semantica de `portfolio.work` usa `selectedProjects` e fallback local de template.
- Imagens de projetos derivados aparecem no preview, mas o ajuste de imagem inline hoje atende melhor imagens top-level e fallback de lista.
- A sidebar esquerda ainda mostra a lista de blocos, apesar da selecao direta no canvas ja existir.
- A sidebar direita ainda concentra salvar/publicar/campos e parte das acoes que devem migrar para o bloco ativo.

## Contratos De Dados

### Projeto Base

Adicionar persistencia de enquadramento no modelo `Project`.

Campos propostos:

- `coverFitMode`: `"fit" | "fill" | "crop"`, default `"crop"`
- `coverPositionX`: numero de 0 a 100, default `50`
- `coverPositionY`: numero de 0 a 100, default `50`

Contrato:

- `imageUrl` continua sendo a URL publica da capa.
- `coverAssetId` referencia o asset quando a imagem veio por upload.
- `coverFitMode`, `coverPositionX` e `coverPositionY` controlam como a capa aparece em templates.
- Ao trocar/remover imagem no perfil base, esses campos continuam validos, mas sao ignorados se `imageUrl` estiver vazio.
- Ajustes feitos no preview em item derivado de projeto base devem persistir no projeto base, nao no bloco, porque a imagem pertence ao projeto.

Arquivos provaveis:

- `prisma/schema.prisma`
- nova migration Prisma
- `lib/validations.ts`
- `lib/server/domain/profile-base.ts`
- `lib/server/app-viewer.ts`
- `lib/server/domain/includes.ts`
- testes de profile/domain

### Override De Visibilidade No Template

Adicionar no config do bloco `portfolio.work`:

```ts
type PortfolioWorkConfig = {
  title?: string;
  intro?: string;
  maxItems?: number;
  hiddenProjectIds?: string[];
  fallbackProjects?: Array<{
    title?: string;
    description?: string;
    date?: string;
    href?: string;
    image?: EditableImageValue;
    hidden?: boolean;
  }>;
};
```

Contrato:

- `hiddenProjectIds` vale apenas para projetos reais vindos do perfil/versao.
- `fallbackProjects[n].hidden` vale apenas para fallback local do template.
- O carrossel recebe somente itens visiveis.
- Se todos os projetos forem ocultados, a secao `work` pode ficar vazia no preview, mas deve manter controles de restauracao no editor.
- A restauracao de um item oculto fica em uma mini-lista contextual do bloco ativo ou em menu de itens ocultos, com icone e `aria-label`.

### Semantica Portfolio E Curriculo

Contrato:

- Portfolio: `portfolio.work.items` deve ser resolvido a partir de projetos selecionados na versao, aplicando `hiddenProjectIds`, fallback visual de imagem e ajuste de capa.
- Curriculo no preview: deve usar os mesmos projetos selecionados da versao e respeitar ocultacoes de item quando a visualizacao estiver dentro do editor daquela pagina.
- Curriculo publico/canonico fora de um contexto de pagina deve continuar usando a selecao da versao sem depender de fallback visual do template.

Arquivos provaveis:

- `lib/templates/portfolio-community-semantics.ts`
- `lib/templates/resume/portfolio-community.ts`
- `components/resume/ResumeView.tsx`, se precisar indicar ocultacoes no preview
- testes em `tests/templates/*`

## Contratos De UI

### Perfil Base: Projetos

Substituir o input textual de imagem por controle de capa:

- miniatura com proporcao fixa
- botao iconico de upload/troca
- botao iconico de remover
- estado de upload
- preview da capa usando `object-fit` e `object-position`
- controles de ajuste quando ha imagem: fit/fill/crop e reposicionamento

Regras:

- Upload usa `POST /api/assets/upload` com `purpose=project`.
- Ao concluir upload: setar `imageUrl`, `coverAssetId`, resetar fit para `crop` e posicao para `50/50`, salvo decisao contraria no desenvolvimento.
- Remover imagem limpa `imageUrl` e `coverAssetId`, mas nao apaga o asset historico.
- Nao exibir copy longa. Usar icones com `aria-label`.

### Preview: Carrossel De Projetos

Renderizacao:

- 0 itens visiveis: manter bloco selecionavel no editor com estado vazio contextual; publico pode omitir conteudo vazio.
- 1 item visivel: renderizar card unico, sem controles de carrossel.
- 2 ou mais itens visiveis: renderizar carrossel.

Contrato de carrossel:

- Sem dependencia nova, salvo se ficar provado que CSS scroll-snap + estado React nao atende.
- Itens com dimensoes estaveis para evitar layout shift.
- Navegacao por botoes iconicos anterior/proximo.
- Teclado: setas navegam entre slides quando o carrossel ou slide esta focado.
- Acessibilidade: `aria-roledescription="carousel"`, slide atual anunciado em `sr-only` ou `aria-live` discreto.
- O slide/item deve continuar expondo `data-ft-config-path` ou contrato equivalente para selecao no preview.

### Preview: Acoes Contextuais No Bloco Ativo

Mover para dentro do bloco ativo:

- salvar rascunho
- publicar
- mover bloco para cima
- mover bloco para baixo
- ocultar/exibir bloco
- remover bloco, quando permitido
- adicionar novo bloco no topo do canvas
- para imagem selecionada: trocar imagem e remover imagem
- para item de carrossel selecionado: ocultar/restaurar item

Regras de UI:

- Usar icones: `Save`, `Upload`, `Trash2`, `Eye`, `EyeOff`, `ArrowUp`, `ArrowDown`, `Plus`, `ChevronLeft`, `ChevronRight`, `ImagePlus`.
- Texto visivel minimo. Acoes devem ter `aria-label`, `title` e tooltip se o componente local suportar.
- Controles nao podem sobrepor conteudo importante em desktop ou mobile.
- A toolbar do bloco ativo deve ser posicionada no canvas, proxima ao bloco, mas com fallback para nao sair do viewport.
- A toolbar deve ser navegavel por teclado.

### Remocao Das Barras Laterais

Remover da UI visivel:

- lista lateral "Blocos / Selecionar"
- editor lateral de campos que ja foram transferidos para o canvas
- acoes laterais duplicadas

Manter internamente:

- `selectedBlockId`
- ordenacao dos blocos
- visibilidade dos blocos
- lista de blocos disponiveis
- validacoes e persistencia existentes

Regra:

- Se ainda existir campo sem editor contextual, ele nao deve ser removido sem alternativa. O plano exige primeiro mapear esses campos e criar controle no bloco ativo ou menu contextual.

## Slices De Execucao

### Slice 1: Contrato De Dados De Capa Do Projeto

Status: entregue em 2026-04-21.

Checklist:

- [x] criar migration com campos de ajuste da capa do projeto
- [x] atualizar validacoes de projeto
- [x] atualizar serializers/selects/includes
- [x] atualizar sync de profile base
- [x] validar testes de dominio existentes
- [x] validar `typecheck`, `lint` e testes focados
- [ ] commit do slice
- [ ] sync/push do slice

Criterio de aceite:

- projeto aceita upload/capa com dados de ajuste sem quebrar dados existentes
- projetos antigos continuam funcionando com defaults

### Slice 2: Upload E Ajuste De Capa No Perfil Base

Checklist:

- [ ] substituir input textual de imagem por controle visual de capa
- [ ] integrar upload com `/api/assets/upload`
- [ ] adicionar trocar/remover com icones
- [ ] adicionar fit/fill/crop e posicao da imagem
- [ ] garantir responsividade e foco por teclado
- [ ] validar fluxo no browser
- [ ] commit do slice
- [ ] sync/push do slice

Criterio de aceite:

- usuario consegue adicionar, trocar, remover e ajustar capa do projeto no perfil base sem digitar URL

### Slice 3: Semantica De Projetos Para Portfolio E Curriculo

Checklist:

- [ ] resolver imagem de projeto usando capa base + ajuste persistido
- [ ] manter fallback visual do template quando projeto nao tiver imagem
- [ ] adicionar suporte a `hiddenProjectIds`
- [ ] garantir que curriculo em preview usa os mesmos projetos visiveis quando estiver no contexto da pagina
- [ ] ampliar testes de mapper e resume projection
- [ ] commit do slice
- [ ] sync/push do slice

Criterio de aceite:

- portfolio e curriculo preview sao alimentados pelos projetos base e respeitam ocultacao sem apagar dados

### Slice 4: Carrossel De Projetos No Template

Checklist:

- [ ] substituir grid de `portfolio.work` por card unico/carrossel conforme quantidade
- [ ] manter dimensoes estaveis e imagens ajustaveis
- [ ] expor slots editaveis por item/slide no preview
- [ ] adicionar controles iconicos anterior/proximo
- [ ] validar teclado, mobile e desktop
- [ ] commit do slice
- [ ] sync/push do slice

Criterio de aceite:

- mais de um projeto aparece como carrossel manipulavel no preview
- um projeto continua simples, sem UI desnecessaria

### Slice 5: Acoes De Item No Preview

Checklist:

- [ ] selecionar item/slide do carrossel no preview
- [ ] ocultar/restaurar item sem remover do perfil
- [ ] trocar/remover imagem do projeto selecionado quando item vier do perfil base
- [ ] ajustar fit/fill/crop e posicao no preview persistindo no projeto base
- [ ] manter fallback local editavel quando item for fallback do template
- [ ] validar comportamento com projetos reais e fallbacks
- [ ] commit do slice
- [ ] sync/push do slice

Criterio de aceite:

- usuario manipula item do carrossel diretamente no preview, com icones e sem depender da sidebar

### Slice 6: Reorganizacao Da Interface Do Editor

Checklist:

- [ ] esconder/remover lista lateral de blocos da UI visivel
- [ ] mover "adicionar bloco" para o topo do canvas
- [ ] mover salvar/publicar/ordem/visibilidade/remocao para toolbar do bloco ativo
- [ ] remover barras de acao laterais duplicadas
- [ ] garantir alternativa para campos ainda nao contextuais
- [ ] validar acessibilidade e navegacao por teclado
- [ ] commit do slice
- [ ] sync/push do slice

Criterio de aceite:

- editor fica limpo, com acoes no contexto do bloco selecionado e sem perda funcional

### Slice 7: QA Visual E Fechamento

Checklist:

- [ ] testar desktop e mobile no editor
- [ ] testar perfil base com upload real ou mockado conforme ambiente
- [ ] testar portfolio preview
- [ ] testar curriculo preview
- [ ] testar publicar apos alteracoes
- [ ] executar `typecheck`, `lint`, testes focados e `build`
- [ ] registrar memoria final no documento de editor
- [ ] commit do fechamento
- [ ] sync/push do fechamento

Criterio de aceite:

- fluxo completo de projeto com capa, carrossel, ocultacao e edicao contextual validado localmente

## Riscos E Decisoes A Confirmar

- Decidir se ajuste de imagem feito no preview deve sempre alterar o projeto base. Recomendacao: sim, quando a imagem pertence ao projeto base.
- Decidir como restaurar itens ocultos sem sidebar. Recomendacao: menu iconico de itens ocultos no bloco ativo.
- Decidir se o curriculo publico deve respeitar ocultacoes especificas da pagina. Recomendacao: somente o curriculo preview da pagina respeita; curriculo canonico segue a versao.
- Confirmar se fallback visual de projeto sem capa deve aparecer no publico. Recomendacao: sim no portfolio, nao como dado gravado no projeto.
- Confirmar se remover imagem pelo preview remove do projeto base. Recomendacao: sim, com acao clara e desfazivel apenas por novo upload.

## Validacao Minima Por Slice

- TypeScript: `npm run typecheck`
- Lint: `npm run lint`
- Testes de templates: `npx vitest run tests/templates/template-semantic-mapper.test.ts tests/templates/resume-projection.test.ts`
- Testes de dominio afetado: adicionar conforme mudancas em profile/project
- Build no fechamento: `npm run build`
- Browser QA: editor, perfil base, portfolio preview, curriculo preview

## Definicao De Pronto

O corte completo so termina quando:

- projeto base tem upload e ajuste de capa
- portfolio mostra carrossel quando ha mais de um projeto visivel
- itens podem ser ocultados/restaurados no preview
- imagem de projeto pode ser trocada/removida/ajustada por UI contextual
- sidebar de blocos nao aparece mais para o usuario
- acoes foram transferidas para o bloco ativo
- adicionar bloco fica no topo do canvas
- validacoes passaram
- cada slice foi commitado e sincronizado no Git
