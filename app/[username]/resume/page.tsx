import { notFound } from "next/navigation"
import type { Metadata } from "next"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import ResumeView from "@/components/resume/ResumeView"
import PrintButton from "./PrintButton"

interface ResumePageProps {
  params: Promise<{ username: string }>
}

// ── Metadata ──────────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: ResumePageProps): Promise<Metadata> {
  const { username } = await params

  const user = await prisma.user.findUnique({
    where: { username },
    select: {
      profile: { select: { displayName: true } },
    },
  })

  const displayName = user?.profile?.displayName ?? username

  return {
    title: `Currículo — ${displayName} | FolioTree`,
    description: `Currículo profissional de ${displayName}.`,
  }
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function ResumePage({ params }: ResumePageProps) {
  const { username } = await params

  // 1. Busca usuário
  const user = await prisma.user.findUnique({
    where: { username },
    select: { id: true, username: true },
  })

  if (!user) notFound()

  // 2. Busca perfil completo
  const profile = await prisma.profile.findUnique({
    where: { userId: user.id },
    include: {
      experiences: { orderBy: [{ order: "asc" }, { startDate: "desc" }] },
      educations: { orderBy: [{ order: "asc" }, { startDate: "desc" }] },
      skills: { orderBy: { order: "asc" } },
      projects: { orderBy: [{ order: "asc" }] },
      achievements: { orderBy: { order: "asc" } },
      links: { orderBy: { order: "asc" } },
    },
  })

  if (!profile) notFound()

  // 3. Busca versão padrão e seu ResumeConfig
  const defaultVersion = await prisma.version.findFirst({
    where: {
      profileId: profile.id,
      isDefault: true,
    },
    include: {
      resumeConfig: true,
    },
  })

  const resumeConfig = defaultVersion?.resumeConfig

  // Verifica se o currículo está publicado — se ResumeConfig não existir, mostra mesmo assim
  // (fallback para perfil completo sem configuração)

  const displayName = profile.displayName ?? username

  return (
    <div className="min-h-screen bg-neutral-100 print:bg-white">
      {/* ── Barra de ações (oculta na impressão) ── */}
      <div className="print:hidden sticky top-0 z-10 border-b border-neutral-200 bg-white">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link
            href="/"
            className="font-display text-base font-bold text-neutral-900 tracking-tight"
          >
            FolioTree
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href={`/${username}`}
              className="rounded-lg border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
            >
              Ver página completa
            </Link>
            <PrintButton />
          </div>
        </div>
      </div>

      {/* ── Conteúdo do currículo ── */}
      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 print:p-0 print:max-w-none">
        <div className="rounded-2xl bg-white p-8 shadow-sm print:shadow-none print:rounded-none print:p-0">
          <ResumeView
            profile={profile}
            version={defaultVersion}
            config={resumeConfig}
          />
        </div>
      </main>

      {/* ── Footer de atribuição ── */}
      <div className="print:hidden border-t border-neutral-200 py-6 text-center">
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
