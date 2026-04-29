# Módulo - Assets, templates e shell

Status: FECHADO
Last updated: 2026-04-29

## Responsabilidade

Gerenciar assets do usuário, biblioteca de templates e navegação autenticada do produto.

## Rotas

- `app/(app)/gallery/page.tsx`
- `app/api/assets/route.ts`
- `app/api/assets/upload/route.ts`
- `app/api/assets/[assetId]/route.ts`
- `app/(app)/templates/page.tsx`
- `app/(app)/templates/[slug]/page.tsx`
- `app/api/templates/route.ts`

## Componentes

- `components/app/AppShell.tsx`
- `components/app/Header.tsx`
- `components/assets/AssetGalleryPicker.tsx`
- `components/templates/TemplateRenderer.tsx`
- `components/templates/portfolio-community/*`

## Domínio e dados

- Prisma: `Asset`, `Template`, `TemplateBlockDef`, `PageBlock`.
- Storage: `lib/storage/*`.
- Templates: `lib/templates/*` e `assets/template/*`.

## Contratos

- Shell autenticada usa top bar persistente.
- Galeria gerencia imagens reutilizáveis do perfil e projetos.
- Templates aplicam linguagem visual sem depender do editor técnico legado.
- Editor técnico foi depreciado nas entradas principais.

## Lacunas

- Busca da top bar ainda não tem contrato funcional.
- Política de lifecycle de assets e limpeza física pode ser detalhada em integrações.
- `generated/prisma-client` ainda precisa de política final de versionamento.
