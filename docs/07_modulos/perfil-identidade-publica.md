# Módulo - Perfil e identidade pública

Status: FECHADO
Last updated: 2026-04-29

## Responsabilidade

Manter a fonte base da identidade profissional do usuário e publicar a experiência central em `/{username}`.

## Rotas

- `app/(app)/profile/page.tsx`
- `app/api/profile/route.ts`
- `app/api/profile/collections/[collection]/route.ts`
- `app/[username]/page.tsx`

## Componentes

- `components/profile/ProfileEditor.tsx`
- `components/profile/ProfileTabs.tsx`
- `components/public/PublicProfileHubPage.tsx`
- `components/public/EditableProfileCover.tsx`

## Domínio e dados

- Prisma: `User`, `Profile`, `Experience`, `Education`, `Project`, `ProfilePresentation`, `ProfileLink`, `Skill`, `Asset`.
- Validações: `profileSchema`, `profileBaseSchema` e schemas de coleções em `lib/validations.ts`.

## Contratos

- Perfil base alimenta hub público, portfólios e currículo.
- Dono autenticado pode editar dados e capa.
- Visitante anônimo vê apenas dados públicos.
- Editor de perfil usa lista lateral, painel contextual, colapso de itens repetíveis e rolagem interna.

## Lacunas

- Visibilidade granular por campo ainda não está fechada.
- Busca da top bar segue sem contrato funcional.
