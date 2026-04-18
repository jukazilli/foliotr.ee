import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { prisma } from "@/lib/prisma"
import { BLOCK_REGISTRY } from "@/components/blocks"
import type { BlockType } from "@/components/blocks"

interface PublicProfilePageProps {
  params: Promise<{ username: string }>
}

// ── Metadata ──────────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: PublicProfilePageProps): Promise<Metadata> {
  const { username } = await params

  const user = await prisma.user.findUnique({
    where: { username },
    select: {
      profile: {
        select: { displayName: true, headline: true },
      },
    },
  })

  if (!user?.profile) {
    return { title: "Perfil não encontrado — FolioTree" }
  }

  const { displayName, headline } = user.profile

  return {
    title: `${displayName ?? username} — FolioTree`,
    description: headline ?? `Veja o perfil profissional de ${displayName ?? username} no FolioTree.`,
  }
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function PublicProfilePage({ params }: PublicProfilePageProps) {
  const { username } = await params

  // 1. Busca o usuário pelo username
  const user = await prisma.user.findUnique({
    where: { username },
    select: { id: true, username: true },
  })

  if (!user) notFound()

  // 2. Busca o perfil completo com todas as relações
  const profile = await prisma.profile.findUnique({
    where: { userId: user.id },
    include: {
      experiences: { orderBy: [{ order: "asc" }, { startDate: "desc" }] },
      educations: { orderBy: [{ order: "asc" }, { startDate: "desc" }] },
      skills: { orderBy: { order: "asc" } },
      projects: { orderBy: [{ order: "asc" }] },
      achievements: { orderBy: { order: "asc" } },
      links: { orderBy: { order: "asc" } },
      proofs: { orderBy: { order: "asc" } },
    },
  })

  if (!profile) notFound()

  // 3. Busca versão padrão com Page publicada e seus blocos
  const defaultVersion = await prisma.version.findFirst({
    where: {
      profileId: profile.id,
      isDefault: true,
    },
    include: {
      pages: {
        where: { published: true },
        include: {
          blocks: {
            where: { visible: true },
            orderBy: { order: "asc" },
          },
          template: true,
        },
        take: 1,
      },
    },
  })

  const publishedPage = defaultVersion?.pages?.[0] ?? null

  // 4. Sem página publicada: renderiza perfil básico
  if (!publishedPage) {
    return <BasicProfileFallback profile={profile} username={username} />
  }

  // 5. Renderiza blocos usando o BLOCK_REGISTRY
  return (
    <div className="min-h-screen bg-neutral-100">
      <div className="mx-auto max-w-4xl">
        {publishedPage.blocks.map((block) => {
          const BlockComponent = BLOCK_REGISTRY[block.blockType as BlockType]
          if (!BlockComponent) return null

          return (
            <BlockComponent
              key={block.id}
              config={block.config as Record<string, unknown>}
              profile={profile}
              version={defaultVersion}
            />
          )
        })}
      </div>

      {/* Footer de atribuição */}
      <div className="border-t border-neutral-200 py-6 text-center">
        <a
          href="/"
          className="text-xs text-neutral-400 hover:text-neutral-600 transition-colors"
        >
          Criado com <span className="font-semibold">FolioTree</span>
        </a>
      </div>
    </div>
  )
}

// ── Fallback: perfil básico sem página publicada ───────────────────────────────

function BasicProfileFallback({ profile, username }: { profile: any; username: string }) {
  return (
    <div className="min-h-screen bg-neutral-100">
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        {/* Hero básico */}
        <div className="rounded-2xl bg-white p-8 shadow-sm">
          <div className="flex items-start gap-5">
            {/* Avatar */}
            <div className="flex-shrink-0">
              {profile.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt={profile.displayName ?? username}
                  className="h-20 w-20 rounded-full object-cover ring-4 ring-neutral-100"
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-2xl font-bold text-white ring-4 ring-neutral-100">
                  {(profile.displayName ?? username).slice(0, 2).toUpperCase()}
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h1 className="font-display text-2xl font-extrabold text-neutral-900">
                {profile.displayName ?? username}
              </h1>
              {profile.headline && (
                <p className="mt-1 text-base text-neutral-500">{profile.headline}</p>
              )}
              {profile.location && (
                <p className="mt-1 text-sm text-neutral-400">{profile.location}</p>
              )}
            </div>
          </div>

          {profile.bio && (
            <p className="mt-6 text-sm leading-7 text-neutral-600 whitespace-pre-line border-t border-neutral-100 pt-5">
              {profile.bio}
            </p>
          )}

          {/* Links */}
          {profile.links?.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2 border-t border-neutral-100 pt-5">
              {profile.links.map((link: any) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-sm font-medium text-neutral-700 hover:bg-neutral-100 transition-colors"
                >
                  {link.label ?? link.platform}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="py-6 text-center">
        <a href="/" className="text-xs text-neutral-400 hover:text-neutral-600 transition-colors">
          Criado com <span className="font-semibold">FolioTree</span>
        </a>
      </div>
    </div>
  )
}
