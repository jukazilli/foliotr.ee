# Contratos Minimos

Status: active contracts  
Last updated: 2026-04-27

## Contrato do projeto

Objetivo: manter FolioTree como aplicacao Next.js fullstack ate nova decisao formal.

Fonte de verdade: codigo real, `docs/03_fundacoes/arquitetura-atual.md` e `docs/00_governanca/fontes-de-verdade.md`.

Criterio de pronto: qualquer mudanca respeita o runtime atual, auth atual, rotas atuais e persistencia Prisma.

Evidencia esperada: typecheck, lint, testes relevantes e documentacao atualizada.

## Contrato de produto

Objetivo: consolidar o produto em torno de perfil base, portfolios e curriculo rapido.

Dentro: perfil, portfolios, templates, paginas publicas, curriculo rapido, reviews e teste vocacional.

Fora: criar um segundo produto paralelo de paginas, curriculos ou versoes.

## Contrato de documentacao

Objetivo: manter a documentacao ativa pequena, navegavel e governada.

Dentro: `docs/00_*` a `docs/12_*`.

Legado: `docs/13_legado/` e `prototipos-legados/`.

Criterio de pronto: documento novo declara status, fonte, escopo, lacunas e evidencia.

## Contrato do slice atual

Nome: Slice documental 1 - Estrutura integrada e legado.

Objetivo: criar a estrutura documental integrada, mover docs antigas para legado e registrar backlog.

Dentro:

- reorganizar `docs/`;
- criar indice ativo;
- consolidar fontes de verdade;
- preservar documentos antigos em legado.

Fora:

- reescrever todos os modulos;
- validar cada jornada no browser;
- alterar codigo runtime;
- corrigir lacunas tecnicas pendentes.

Criterio de pronto:

- arvore documental criada;
- legado preservado;
- backlog estrutural criado;
- validacoes documentais executadas.
