# Presentations Feature Plan

Status: em implementacao
Data: 2026-04-27

## Objetivo

Transformar a antiga bio/sobre em "Apresentacoes" reutilizaveis. O usuario pode criar varias apresentacoes no perfil base, marcar uma como padrao para o perfil publico inicial e selecionar uma apresentacao especifica para cada versao de portfolio/curriculo.

## Decisoes deste corte

- Criar o modelo `ProfilePresentation` vinculado ao `Profile`.
- `Profile.defaultPresentationId` define a apresentacao padrao do hub publico.
- `Version.presentationId` define a apresentacao usada por uma versao especifica.
- `Version.customBio` e `Profile.bio` permanecem como fallback de compatibilidade.
- O bloco `portfolio.about` continua existindo tecnicamente, mas o texto passa a vir de:
  1. apresentacao selecionada na versao;
  2. `Version.customBio`;
  3. apresentacao padrao do perfil;
  4. `Profile.bio`;
  5. config fallback do bloco.
- O curriculo usa a mesma apresentacao resolvida para preencher o resumo.

## Checklist de implementacao

- [x] Estado atual mapeado: about/resumo usa `version.customBio ?? profile.bio`.
- [x] Contrato documentado neste arquivo.
- [x] Schema Prisma e migration adicionam apresentacoes.
- [x] Validacoes, includes e dominio salvam apresentacoes.
- [x] Editor de perfil permite criar, editar, remover e marcar padrao.
- [x] Editor de template permite selecionar apresentacao da versao.
- [x] Renderizadores resolvem apresentacao antes de bio legada.
- [x] Validacoes tecnicas executadas.

## Validacoes executadas

- `npm run db:validate`
- `npm run typecheck`
- `npm run lint -- --quiet`
- `npm run test` (19 arquivos, 75 testes)
- `npx prettier --check` nos arquivos tocados
- Busca por mojibake nos arquivos tocados (`Ãƒ`, `Ã‚`, `ï¿½`, `Æ’`, `Ã¢`) sem ocorrencias.
- `npm run db:migrate:deploy` aplicou `20260427143000_profile_presentations`.
- Dev server em `http://127.0.0.1:3000` respondeu `GET /` com HTTP 200.

## Pendencias futuras

- Migrar automaticamente `Profile.bio` para uma apresentacao inicial para bases antigas.
- Exibir historico/versoes de texto de apresentacao.
- Criar assistente de IA para adaptar apresentacao por vaga.
