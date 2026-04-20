# FolioTree Canonical Templates Contract

Status: active - library and first ingestion implemented  
Scope: execution contract for the canonical templates track  
Primary reference: `doc/templates-architecture.md`  
First target: `portfolio-community`

## Contexto da task

- Objetivo:
  canonizar o template local em `assets/template/portfolio-community/template-code/template1`, integrar esse template ao dominio real do FolioTree e publicar `template mode` e `resume mode` a partir da mesma base de dados.
- Superficie afetada:
  `assets/template/portfolio-community`, `doc/templates-architecture.md`, schema Prisma de templates se necessario, sync/seed de templates, renderer canonico, biblioteca de templates, `Page`, `PageBlock`, `ResumeConfig`, rotas publicas `/{username}` e `/{username}/resume`.
- Estado atual:
  o dominio de templates ja existe em parte com `Template`, `TemplateBlockDef`, `Page`, `PageBlock`, `ResumeConfig`, APIs de blocos e um renderer inicial de `portfolio-community`; o template bruto local ja esta no repositorio e deve virar a materia-prima do primeiro template canonico.
- Criterio de sucesso:
  existir pelo menos 1 template canonico utilizavel, selecionavel na area logada, fiel ao template fornecido, preenchido por dados reais do usuario, com blocos editaveis, suporte a imagens, reorder, hide/show, add/remove compativel e `resume mode` derivado da mesma `Version`.
- Restricoes:
  nao usar MCP do Figma; nao executar a SPA bruta como runtime do app; nao permitir customizacao livre de tema/cores/fontes; nao quebrar auth, Prisma, ownership ou rotas publicas existentes.

## Contrato de implementacao

1. `assets/template/<slug>/template-code/template1` e fonte bruta arquivada, nao runtime final.
2. O runtime canonico vive no app real, em renderer interno controlado.
3. O source of truth estrutural do template fica em manifesto local versionado no repo.
4. O estado operacional continua no banco via `Template`, `TemplateBlockDef`, `Page`, `PageBlock` e `ResumeConfig`.
5. O fluxo do produto permanece `Profile -> Version -> Page -> Template blocks`.
6. Toda resolucao de dados usa precedencia:
   `PageBlock override -> Version -> Profile -> default canonico`.
7. Tema, cores, tipografia e identidade visual do template canonico ficam bloqueados.
8. O usuario pode editar apenas conteudo, links, imagens, ordem, visibilidade e blocos compativeis.
9. `resume mode` nao cria nova fonte de dados; ele projeta a mesma `Version`.
10. Publicacao publica continua em:
    - `/{username}` para template mode
    - `/{username}/resume` para resume mode

## Decisoes fechadas

- Ingestao:
  curada por template, sem parser generico de SPA.
- Persistencia:
  manifesto local + sync/seed para banco.
- Slots semanticos:
  tipados e resolvidos por codigo, sem eval.
- Ausencia de dados:
  sem lorem ipsum em saida publica; bloco opcional pode sumir; bloco obrigatorio usa fallback minimo canonico.
- Assets:
  `Asset` e a entidade oficial; upload local provisiorio continua aceitavel nesta fase.
- Fidelidade:
  o template sera portado com fidelidade, nao reinterpretado.

## Checklist de execucao

- [ ] Contexto confirmado
  - Prova: contrato ativo em `doc/templates-canonical-contract.md` e arquitetura-base registrada em `doc/templates-architecture.md`.
- [x] Exploracao concluida
  - Prova: `assets/template/portfolio-community/template-code/template1` inspecionado; contrato local e manifest definidos; `notes.md` mantido como contexto do pacote bruto.
- [x] Regra/abordagem fechada
  - Prova: `assets/template/portfolio-community/manifest.ts`, `lib/templates/manifest.ts` e `lib/templates/registry.ts`.
- [ ] Implementacao concluida
  - Prova: ingestao canonica, sync para banco, biblioteca `/templates`, detalhe `/templates/[slug]`, acao "usar template", editor real `/pages/[pageId]/editor`, resume autenticado `/pages/[pageId]/resume`, rotas publicas `/{username}` e `/{username}/{pageSlug}` e toolbar publica integradas; ainda faltam calibracao visual final e QA de fidelidade.
- [x] Validacao concluida
  - Prova: `npm run typecheck`, `npm run lint`, `npm run test`, `npm run build`; cover sincronizado em `public/template-assets/portfolio-community/cover.png`; rota `/pages/[pageId]/editor` compilada; servidor local ativo em `http://127.0.0.1:3002`.
- [x] Memoria atualizada
  - Prova: este contrato e `doc/templates-architecture.md` atualizados com o modelo de manifest local e sync de assets publicos.

## Subfases de execucao

### Subfase 1 — Auditoria do template bruto

- [ ] Ler `template1` inteiro
- [ ] Inventariar secoes, assets, textos, links e imagens
- [ ] Identificar dependencias desnecessarias da SPA
- [ ] Registrar gaps em `notes.md`

### Subfase 2 — Definicao canonica local

- [x] Criar `manifest.ts` do `portfolio-community`
- [x] Definir metadados de biblioteca
- [x] Definir blocos compativeis
- [x] Definir slots semanticos
- [x] Definir regras de edicao e bloqueios visuais

### Subfase 3 — Ajuste do dominio

- [x] Revisar `Template` e `TemplateBlockDef`
- [x] Adicionar campos minimos que faltarem
- [x] Versionar estrutura do template
- [x] Preparar sync do manifest para o banco

### Subfase 4 — Sync e seed

- [x] Implementar rotina de sync do template local
- [x] Popular `Template`
- [x] Popular `TemplateBlockDef`
- [x] Garantir seed idempotente dos `PageBlocks`
- [x] Preencher seed inicial com mapping semantico `Profile -> Version -> Template`

### Subfase 5 — Runtime do template canonico

- [x] Criar renderer interno isolado
- [x] Portar layout com fidelidade
- [x] Migrar assets estaticos necessarios
- [x] Escopar CSS e fontes do template
- [x] Remover dependencia do bundle Vite bruto

### Subfase 6 — Camada de mapeamento semantico

- [x] Implementar resolvers de slots
- [x] Definir precedencia `profile/version/pageBlock/default`
- [x] Tratar ausencia de dados
- [x] Ligar imagens do dominio e overrides por bloco

### Subfase 7 — Edicao estrutural

- [x] Expor blocos compativeis no editor
- [x] Reorder por `PageBlock.order`
- [x] Hide/show por `PageBlock.visible`
- [x] Add/remove com validacao server-side
- [x] Campos editaveis por whitelist

### Subfase 8 — Biblioteca de templates

- [x] Montar tela de biblioteca usando `cover.png`
- [x] Exibir template canonico com preview
- [x] Permitir selecao por versao
- [x] Garantir criacao ou atualizacao da `Page`

### Subfase 9 — Resume mode

  - [x] Projetar curriculo a partir da mesma `Version`
  - [x] Ligar `ResumeConfig`
  - [x] Remover fotos e ornamentos por padrao
  - [x] Garantir consistencia com os mesmos dados semanticos

### Subfase 10 — Publicacao e QA

  - [x] Publicar `/{username}`
  - [x] Publicar `/{username}/resume`
  - [x] Validar autorizacao e ownership
- [ ] Rodar testes de dominio e bloco
- [ ] Rodar comparacao visual com `reference.png`

## Memoria curta

- Decisoes:
  manifesto local + persistencia em banco; renderer interno controlado; visual canonico bloqueado; resume derivado da mesma `Version`; `Education/Formacao` e dado canonico selecionavel por versao e projetado para template e curriculo.
- Regras relevantes:
  nao usar runtime da SPA bruta; nao usar MCP do Figma; nao quebrar auth/Prisma/rotas atuais; evitar memoria paralela fora deste contrato e de `doc/templates-architecture.md`.
- Pendencias:
  validar fidelidade do template publico e do resume derivado contra a referencia final.
- Proximo passo logico:
  consolidar QA visual do template publico e do resume derivado contra a referencia canonica.
