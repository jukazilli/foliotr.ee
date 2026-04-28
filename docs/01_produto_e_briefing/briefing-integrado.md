# Briefing Integrado

Status: active product briefing  
Last updated: 2026-04-27

## Identificacao

- Projeto tecnico: FolioTree
- Produto publico: LINKFOLIO
- Estagio: MVP em consolidacao
- Runtime atual: Next.js fullstack na raiz do repositorio

## Conceito

FolioTree e uma camada estruturada de identidade profissional. O usuario mantem um perfil base e gera saidas publicas para contextos diferentes.

Fluxo conceitual:

```text
Perfil base -> Versoes -> Portfolios -> Curriculo rapido / Pagina publica
```

## Problema

Profissionais precisam apresentar experiencia, portfolio, curriculo e evidencias com mais contexto do que um curriculo estatico ou perfil social tradicional permite.

## Objetivo principal

Permitir que o usuario organize sua identidade profissional em uma fonte central e publique portfolios e curriculos rapidos para oportunidades especificas.

## Publico

- Profissionais que querem apresentar carreira e projetos com contexto.
- Pessoas em transicao ou reposicionamento profissional.
- Usuarios que precisam de portfolio publico e curriculo objetivo.

## Escopo atual

- Autenticacao.
- Perfil base.
- Portfolios.
- Paginas publicas.
- Curriculo rapido.
- Templates.
- Galeria/assets.
- Reviews publicas.
- Teste vocacional/comportamental.

## Fora do escopo deste corte

- Reescrever todos os planos antigos.
- Redesenhar UI.
- Alterar schema Prisma.
- Migrar runtime para outro backend.
- Fechar rate limit duravel ou politica Gemini.

## Decisoes de linguagem

- Portfolio: pagina web completa e especifica para um contexto.
- Curriculo: leitura rapida e objetiva associada ao portfolio.
- Versao: variacao interna de dados.
- Pagina: entidade tecnica/editorial.
- Reviews: conceito de produto.
- Proof: backing tecnico temporario.
