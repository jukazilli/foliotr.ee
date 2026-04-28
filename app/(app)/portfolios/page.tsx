import Link from "next/link";
import {
  Copy,
  Edit2,
  Eye,
  FileText,
  GitBranch,
  Globe,
  Lock,
  MoreVertical,
  Plus,
  Power,
} from "lucide-react";
import { getAppViewer, getOwnedVersions } from "@/lib/server/app-viewer";
import { getPrimaryVersionPage } from "@/lib/server/domain/includes";
import { formatDate } from "@/lib/utils";
import {
  setPortfolioPublishStateAction,
  setPortfolioResumeModeAction,
  versionPortfolioAction,
} from "./actions";

type PortfolioFilter = "all" | "public" | "drafts";

interface PortfoliosPageProps {
  searchParams?: Promise<{ filter?: string }>;
}

function publicPath(username: string | null | undefined, slug: string) {
  return `/${username ?? "seu-usuario"}/${slug}`;
}

function countSelectedItems(
  version: Awaited<ReturnType<typeof getOwnedVersions>>[number]
) {
  return (
    version.experiences.length +
    version.educations.length +
    version.projects.length +
    version.achievements.length +
    version.skills.length +
    version.proofs.length +
    version.highlights.length +
    version.links.length
  );
}

function normalizeFilter(value: string | undefined): PortfolioFilter {
  if (value === "public" || value === "drafts") return value;
  return "all";
}

function FilterTab({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`rounded-full px-4 py-1.5 text-sm font-extrabold transition-colors ${
        active ? "bg-ink text-white" : "text-muted hover:bg-gray-100 hover:text-ink"
      }`}
    >
      {children}
    </Link>
  );
}

function StatusPill({ active }: { active: boolean }) {
  if (active) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border-2 border-[#059669]/20 bg-[#dcfce7]/50 px-2.5 py-1 text-xs font-extrabold text-[#059669]">
        <span className="h-1.5 w-1.5 rounded-full bg-[#059669]" />
        Live
      </span>
    );
  }

  return (
    <span className="inline-flex items-center rounded-full border-2 border-gray-200 bg-gray-100 px-2.5 py-1 text-xs font-extrabold text-gray-500">
      Rascunho
    </span>
  );
}

function IconAction({
  href,
  label,
  children,
  target,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
  target?: "_blank";
}) {
  return (
    <Link
      href={href}
      target={target}
      rel={target === "_blank" ? "noopener noreferrer" : undefined}
      aria-label={label}
      title={label}
      className="rounded-md p-1.5 text-gray-600 transition-colors hover:bg-gray-100 hover:text-black"
    >
      {children}
    </Link>
  );
}

function MenuButton({
  action,
  children,
  danger = false,
}: {
  action: () => Promise<void>;
  children: React.ReactNode;
  danger?: boolean;
}) {
  return (
    <form action={action}>
      <button
        type="submit"
        className={`flex w-full items-center gap-2 px-4 py-2 text-left text-sm font-semibold hover:bg-gray-100 ${
          danger ? "text-red-600 hover:bg-red-50" : "text-ink"
        }`}
      >
        {children}
      </button>
    </form>
  );
}

export default async function PortfoliosPage({ searchParams }: PortfoliosPageProps) {
  const [{ user }, params] = await Promise.all([
    getAppViewer(),
    searchParams ?? Promise.resolve({ filter: undefined }),
  ]);
  const activeFilter = normalizeFilter(params.filter);
  const versions = await getOwnedVersions(user.id);
  const rows = versions
    .map((version) => ({
      version,
      page: getPrimaryVersionPage(version),
    }))
    .filter((item) => item.page);
  const filteredRows = rows.filter(({ page }) => {
    if (!page) return false;
    const isPublic = page.publishState === "PUBLISHED";
    if (activeFilter === "public") return isPublic;
    if (activeFilter === "drafts") return !isPublic;
    return true;
  });
  const versionsWithoutPage = versions.filter(
    (version) => !getPrimaryVersionPage(version)
  );

  return (
    <div className="space-y-8 pb-12">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-display text-4xl font-black tracking-tight text-black">
            Comunidade de Portfolios
          </h1>
          <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-gray-600">
            Gerencie seu perfil mestre e crie versoes derivadas para diferentes
            oportunidades.
          </p>
        </div>

        <Link
          href="/templates"
          className="inline-flex h-11 w-fit items-center gap-2 rounded-full border-2 border-line bg-[#dcfce7] px-5 text-sm font-extrabold text-ink shadow-[2px_2px_0_#111827] transition hover:-translate-y-0.5"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          <span className="font-display">Nova versao</span>
        </Link>
      </header>

      <section className="space-y-4" aria-labelledby="master-profile-title">
        <div className="flex items-center gap-2 font-display font-extrabold text-black">
          <span className="relative h-6 w-2 overflow-hidden rounded-sm bg-black">
            <span className="absolute inset-0 bg-[#dcfce7] opacity-60" />
          </span>
          <h2 id="master-profile-title">Perfil mestre</h2>
        </div>

        <div className="relative overflow-hidden rounded-2xl border-2 border-line bg-white p-5 shadow-[4px_4px_0_#111827]">
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full border-2 border-line bg-[#f6f8f1] opacity-50" />

          <div className="relative z-10 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <h3 className="font-display text-2xl font-extrabold text-black">
                  Principal page
                </h3>
                <span className="inline-flex items-center gap-1 rounded-full border-2 border-line bg-[#dcfce7] px-3 py-1 text-xs font-extrabold text-black">
                  Perfil base
                </span>
              </div>
              <p className="mt-2 text-sm font-semibold text-gray-500">
                Fonte dos dados globais do usuario
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <span className="max-w-full truncate rounded-full border-2 border-line bg-[#f6f8f1] px-4 py-2 font-mono text-xs font-extrabold text-ink">
                  /{user.username ?? "seu-usuario"}
                </span>
                <span className="rounded-full border-2 border-line bg-white px-3 py-1.5 text-sm font-extrabold text-ink">
                  {rows.length} portfolios
                </span>
              </div>
            </div>

            <div className="flex w-fit items-center gap-2 rounded-full border-2 border-line bg-[#f6f8f1] p-2">
              <Link
                href="/profile"
                aria-label="Editar perfil mestre"
                title="Editar perfil mestre"
                className="grid h-10 w-10 place-items-center rounded-full border-2 border-line bg-white transition-colors hover:bg-black hover:text-white"
              >
                <Edit2 className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                href="/home"
                aria-label="Visualizar perfil"
                title="Visualizar perfil"
                className="grid h-10 w-10 place-items-center rounded-full border-2 border-line bg-white transition-colors hover:bg-black hover:text-white"
              >
                <Eye className="h-4 w-4" aria-hidden="true" />
              </Link>
              <span className="mx-1 h-6 w-px bg-black/20" />
              <Link
                href="/templates"
                aria-label="Criar derivado"
                title="Criar derivado"
                className="grid h-10 w-10 place-items-center rounded-full border-2 border-line bg-[#ffcce6] transition-transform hover:scale-105"
              >
                <GitBranch className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-5" aria-labelledby="portfolio-versions-title">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 font-display font-extrabold text-black">
            <GitBranch className="h-5 w-5 text-gray-400" aria-hidden="true" />
            <h2 id="portfolio-versions-title">Versoes derivadas</h2>
            <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs text-gray-700">
              {rows.length}
            </span>
          </div>

          <nav
            className="flex w-fit rounded-full border-2 border-line bg-white p-1"
            aria-label="Filtrar portfolios"
          >
            <FilterTab href="/portfolios" active={activeFilter === "all"}>
              Todas
            </FilterTab>
            <FilterTab
              href="/portfolios?filter=public"
              active={activeFilter === "public"}
            >
              Publicas
            </FilterTab>
            <FilterTab
              href="/portfolios?filter=drafts"
              active={activeFilter === "drafts"}
            >
              Rascunhos
            </FilterTab>
          </nav>
        </div>

        <div className="overflow-hidden rounded-2xl border-2 border-line bg-white">
          <div className="hidden grid-cols-12 gap-4 border-b-2 border-line bg-gray-50 p-4 text-xs font-extrabold uppercase tracking-wider text-gray-500 lg:grid">
            <div className="col-span-5">Nome / URL</div>
            <div className="col-span-2">Modificado em</div>
            <div className="col-span-2 text-center">Itens</div>
            <div className="col-span-2 text-center">Status</div>
            <div className="col-span-1 text-center">Acoes</div>
          </div>

          <div className="divide-y-2 divide-gray-100">
            {filteredRows.length > 0 ? (
              filteredRows.map(({ version, page }) => {
                if (!page) return null;

                const href = publicPath(user.username, page.slug);
                const portfolioActive = page.publishState === "PUBLISHED";
                const resumeActive = version.resumeConfig?.publishState === "PUBLISHED";
                const selectedCount = countSelectedItems(version);
                const togglePortfolioAction = setPortfolioPublishStateAction.bind(
                  null,
                  page.id,
                  portfolioActive ? "DRAFT" : "PUBLISHED"
                );
                const toggleResumeAction = setPortfolioResumeModeAction.bind(
                  null,
                  page.id,
                  resumeActive ? "DRAFT" : "PUBLISHED"
                );
                const versionAction = versionPortfolioAction.bind(null, page.id);
                const itemTitle = page.title ?? version.name;

                return (
                  <article
                    key={version.id}
                    className="group grid gap-3 p-4 transition-colors hover:bg-[#f6f8f1]/60 lg:grid-cols-12 lg:items-center lg:gap-4"
                  >
                    <div className="min-w-0 lg:col-span-5">
                      <div className="flex items-center gap-3">
                        <span
                          className={`grid h-8 w-8 shrink-0 place-items-center rounded-full border-2 border-line ${
                            portfolioActive ? "bg-[#dcfce7]" : "bg-gray-100"
                          }`}
                        >
                          {portfolioActive ? (
                            <Globe className="h-3.5 w-3.5" aria-hidden="true" />
                          ) : (
                            <Lock
                              className="h-3.5 w-3.5 text-gray-500"
                              aria-hidden="true"
                            />
                          )}
                        </span>
                        <div className="min-w-0">
                          <h3 className="truncate font-display text-base font-extrabold text-black">
                            {itemTitle}
                          </h3>
                          <p className="mt-1 w-fit max-w-full truncate rounded bg-gray-100 px-1.5 py-0.5 font-mono text-xs font-semibold text-gray-500">
                            {href}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="text-sm font-semibold text-gray-600 lg:col-span-2">
                      {formatDate(page.updatedAt, "short")}
                    </div>

                    <div className="flex items-center gap-2 text-sm font-extrabold text-black lg:col-span-2 lg:justify-center">
                      <span>{selectedCount} blocos</span>
                      {resumeActive ? (
                        <span
                          aria-label="Curriculo publicado"
                          title="Curriculo publicado"
                          className="grid h-6 w-6 place-items-center rounded-full border-2 border-line bg-[#dcfce7]"
                        >
                          <FileText className="h-3.5 w-3.5" aria-hidden="true" />
                        </span>
                      ) : null}
                    </div>

                    <div className="lg:col-span-2 lg:flex lg:justify-center">
                      <StatusPill active={portfolioActive} />
                    </div>

                    <div className="relative flex items-center justify-end gap-1 lg:col-span-1">
                      <div className="flex items-center gap-1 opacity-100 transition-opacity lg:opacity-0 lg:group-hover:opacity-100">
                        <IconAction
                          href={`/portfolios/${version.id}/edit`}
                          label="Editar variacao"
                        >
                          <Edit2 className="h-4 w-4" aria-hidden="true" />
                        </IconAction>
                        <IconAction href={href} label="Ver publico" target="_blank">
                          <Eye className="h-4 w-4" aria-hidden="true" />
                        </IconAction>
                      </div>

                      <details className="relative">
                        <summary
                          aria-label="Mais acoes"
                          title="Mais acoes"
                          className="flex cursor-pointer list-none rounded-md p-1.5 text-gray-400 transition-colors hover:text-black"
                        >
                          <MoreVertical className="h-5 w-5" aria-hidden="true" />
                        </summary>

                        <div className="absolute right-0 top-10 z-20 w-52 overflow-hidden rounded-xl border-2 border-line bg-white py-2 shadow-[2px_2px_0_#111827]">
                          <MenuButton action={togglePortfolioAction}>
                            {portfolioActive ? (
                              <Lock className="h-3.5 w-3.5" aria-hidden="true" />
                            ) : (
                              <Globe className="h-3.5 w-3.5" aria-hidden="true" />
                            )}
                            {portfolioActive ? "Tornar rascunho" : "Publicar"}
                          </MenuButton>
                          <MenuButton action={toggleResumeAction}>
                            <FileText className="h-3.5 w-3.5" aria-hidden="true" />
                            {resumeActive
                              ? "Despublicar curriculo"
                              : "Publicar curriculo"}
                          </MenuButton>
                          <MenuButton action={versionAction}>
                            <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                            Duplicar versao
                          </MenuButton>
                          <div className="my-1 h-px bg-black/10" />
                          <MenuButton action={togglePortfolioAction} danger>
                            <Power className="h-3.5 w-3.5" aria-hidden="true" />
                            Desativar vinculo
                          </MenuButton>
                        </div>
                      </details>
                    </div>
                  </article>
                );
              })
            ) : (
              <div className="p-12 text-center text-sm font-semibold text-gray-500">
                Nenhuma versao encontrada para este filtro.
              </div>
            )}
          </div>
        </div>
      </section>

      {versionsWithoutPage.length > 0 ? (
        <section className="rounded-2xl border-2 border-line bg-white p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-wider text-gray-500">
                Aguardando modelo
              </p>
              <h2 className="mt-1 font-display text-xl font-extrabold text-black">
                Variacoes sem portfolio publicado
              </h2>
            </div>
            <Link
              href="/templates"
              className="w-fit rounded-full border-2 border-line bg-white px-4 py-2 text-sm font-extrabold transition hover:bg-[#dcfce7]"
            >
              Escolher modelo
            </Link>
          </div>
          <div className="mt-4 grid gap-2">
            {versionsWithoutPage.map((version) => (
              <div
                key={version.id}
                className="flex flex-col gap-2 rounded-xl border-2 border-line/20 bg-[#f6f8f1] px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <p className="truncate text-sm font-extrabold text-ink">
                  {version.name}
                </p>
                <span className="text-xs font-bold text-gray-500">
                  {countSelectedItems(version)} blocos selecionados
                </span>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
