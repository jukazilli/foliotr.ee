# Backlog - Versionamento de Portfolio

Status: active backlog  
Last updated: 2026-04-28  
Contrato base: `docs/02_contratos/contrato-versionamento-portfolio.md`

## Slice 0 - Contrato e auditoria do modelo atual

Status: FECHADO

Dependencias:

- Pedido atual do usuario.
- Leitura de `Version`, `Page`, snapshots, portfolios e templates.

Escopo:

- Documentar o contrato de separacao entre perfil e portfolio.
- Registrar riscos do modelo atual.
- Definir primeiro corte implementavel.

Evidencia:

- `docs/02_contratos/contrato-versionamento-portfolio.md`.
- Este backlog criado.
- `docs/11_slices_e_cortes/slice-atual.md` atualizado.

## Slice 1 - Snapshot editavel por variacao

Status: FECHADO

Dependencias:

- Slice 0.

Escopo:

- Adicionar `Version.profileSnapshot Json`.
- Criar builder para copiar dados base do `Profile` para a variacao.
- Alterar `createOwnedVersion` e `versionPortfolioAction` para criar a copia.
- Alterar `buildEditorSnapshot` para preferir `Version.profileSnapshot`.
- Migrar variacoes existentes com fallback seguro.

Fora:

- UI multi-step completa.
- Remocao de selecoes antigas.

Evidencia:

- Variacao nova possui `profileSnapshot`.
- Editar perfil global depois da criacao nao altera o snapshot da variacao.
- Typecheck e Prisma validate sem erro.
- Migration `20260428150000_version_profile_snapshot` criada.
- `buildEditorSnapshot` prefere `Version.profileSnapshot` e usa fallback seguro para variacoes antigas.

## Slice 2 - Editor multi-step da variacao

Status: FECHADO

Dependencias:

- Slice 1.

Escopo:

- Criar `/portfolios/{versionId}/edit`.
- Step 1: foto/identidade da variacao.
- Step 2: dados e visibilidade.
- Step 3: template.
- Step 4: salvar/publicar.
- Remover link de card que manda para `/profile` quando a intencao for editar portfolio.

Fora:

- Redesign completo do renderer publico.

Evidencia:

- Usuario edita dados da variacao sem chamar `/api/profile`.
- Usuario troca foto especifica da variacao.
- Usuario salva rascunho e publica a variacao.
- Rota `/portfolios/{versionId}/edit` criada.
- Acao de versionar portfolio redireciona para o editor da variacao criada.
- Persistencia inicial atualiza `Version.profileSnapshot`, `Page` e `ResumeConfig`.

## Slice 3 - Nome por cargo e cards de portfolios

Status: FECHADO

Dependencias:

- Slice 1.

Escopo:

- Definir derivacao de nome da variacao a partir de cargo/role principal.
- Atualizar `Version.name`, `Page.title` e cards de `/portfolios`.
- Exibir template apenas como metadado.

Evidencia:

- Card mostra cargo/nome da variacao.
- Nome do template aparece apenas como detalhe.
- Criar variacao nao gera nomes baseados em template.
- Helper `derivePortfolioVersionName` centraliza a regra de nome.
- Duplicar portfolio usa cargo/headline da variacao fonte como nome base.

## Slice 4 - Templates aplicados a variacao

Dependencias:

- Slice 2.

Escopo:

- Fazer selecao de template dentro do wizard de variacao.
- Aplicar template sem editor tecnico.
- Atualizar `Page` e `ResumeConfig` com base no `profileSnapshot`.

Evidencia:

- Usuario seleciona template no wizard.
- Publicacao usa template selecionado e dados da variacao.
- Trocar template nao altera perfil global.

## Slice 5 - Compatibilidade e QA

Dependencias:

- Slices 1 a 4.

Escopo:

- Auditar variacoes antigas.
- Validar publicacao anonima e dono logado.
- Validar curriculo.
- Validar que `/profile` e portfolio nao se confundem.

Evidencia:

- Fluxo criar variacao -> editar dados -> escolher template -> publicar validado em browser.
- `npm run typecheck`, lint/testes relevantes e busca de mojibake.
