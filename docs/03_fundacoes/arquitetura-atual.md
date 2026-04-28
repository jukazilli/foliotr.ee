# Arquitetura Atual

Status: active architecture summary  
Last updated: 2026-04-27

## Runtime

FolioTree roda como aplicacao Next.js fullstack na raiz do repositorio.

```text
Browser
  -> Next.js App Router
  -> Server Components / Server Actions / app/api/*
  -> NextAuth
  -> Prisma
  -> PostgreSQL
```

## Stack

- Next.js App Router.
- NextAuth.
- Prisma.
- PostgreSQL.
- API interna em `app/api/*`.
- Storage local ou S3 compativel conforme ambiente.
- Gemini opcional para relatorio do teste vocacional.

## Rotas publicas principais

- `/`
- `/login`
- `/register`
- `/forgot-password`
- `/{username}`
- `/{username}/{pageSlug}`
- `/{username}/{pageSlug}/resume`

## Rotas autenticadas principais

- `/dashboard`
- `/profile`
- `/portfolios`
- `/gallery`
- `/templates`
- `/teste-vocacional/app`
- `/settings`

## Rotas tecnicas/editoriais

- `/pages`
- `/pages/{pageId}/editor`
- `/pages/{pageId}/resume`
- `/versions`
- `/resumes`

## Regra de autorizacao

Middleware e gate de UX para rotas autenticadas. A fronteira real de seguranca fica em server pages, server actions, API handlers e helpers de sessao/ownership.

## Legado

Planos antigos que falam de monorepo `apps/web`, API Fastify separada, Clerk ou Render API nao sao arquitetura ativa.
