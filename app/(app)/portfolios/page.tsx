import Link from "next/link";
import { ExternalLink, Layers3 } from "lucide-react";
import { EmptyWorkspaceState, PageIntro } from "@/components/app/primitives";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getAppViewer, getOwnedVersions } from "@/lib/server/app-viewer";
import { getPrimaryVersionPage } from "@/lib/server/domain/includes";
import { formatDate } from "@/lib/utils";
import {
  setPortfolioPublishStateAction,
  setPortfolioResumeModeAction,
  versionPortfolioAction,
} from "./actions";

function statusLabel(state?: string | null) {
  return state === "PUBLISHED" ? "Ativo" : "Inativo";
}

function statusVariant(state?: string | null) {
  return state === "PUBLISHED" ? "success" : "default";
}

function publicPath(username: string | null | undefined, slug: string) {
  return `/${username ?? "seu-usuario"}/${slug}`;
}

export default async function PortfoliosPage() {
  const { user } = await getAppViewer();
  const versions = await getOwnedVersions(user.id);
  const rows = versions
    .map((version) => ({
      version,
      page: getPrimaryVersionPage(version),
    }))
    .filter((item) => item.page);

  const activeCount = rows.filter(
    (item) => item.page?.publishState === "PUBLISHED"
  ).length;

  return (
    <div className="space-y-6">
      <PageIntro
        eyebrow="Portfolios"
        title="Portfolios"
        description="Versoes publicas para objetivos diferentes."
        meta={
          <>
            <Badge variant="version">{rows.length} versoes</Badge>
            <Badge variant="success">{activeCount} ativas</Badge>
          </>
        }
        actions={
          <Button asChild variant="outline">
            <Link href="/templates">Novo portfolio</Link>
          </Button>
        }
      />

      {rows.length === 0 ? (
        <EmptyWorkspaceState
          accent="neutral"
          label="Sem portfolios"
          title="Escolha um modelo"
          description="Um portfolio nasce a partir de um template aplicado ao seu perfil."
          primaryAction={{ href: "/templates", label: "Ver templates" }}
          secondaryAction={{ href: "/profile", label: "Editar perfil" }}
        />
      ) : (
        <Card className="overflow-hidden rounded-[18px]">
          <CardContent className="p-0">
            <div className="hidden border-b-2 border-line bg-cream px-4 py-3 text-[0.72rem] font-extrabold uppercase tracking-[0.16em] text-muted 2xl:grid 2xl:grid-cols-[8.5rem_minmax(12rem,1fr)_7rem_minmax(11rem,0.9fr)_13rem_18rem] 2xl:items-center 2xl:gap-3">
              <span>Data</span>
              <span>Titulo</span>
              <span>Status</span>
              <span>Link</span>
              <span>Modos</span>
              <span className="text-right">Acoes</span>
            </div>

            <div className="divide-y-2 divide-line/10">
              {rows.map(({ version, page }) => {
                if (!page) return null;

                const href = publicPath(user.username, page.slug);
                const portfolioActive = page.publishState === "PUBLISHED";
                const resumeActive = version.resumeConfig?.publishState === "PUBLISHED";
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

                return (
                  <div
                    key={version.id}
                    className="grid gap-4 px-4 py-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(18rem,0.9fr)] xl:items-start xl:gap-4 2xl:grid-cols-[8.5rem_minmax(12rem,1fr)_7rem_minmax(11rem,0.9fr)_13rem_18rem] 2xl:items-center 2xl:gap-3"
                  >
                    <div className="grid gap-4 sm:grid-cols-[8.5rem_minmax(0,1fr)] xl:grid-cols-1 xl:gap-3 2xl:contents">
                      <div>
                        <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.14em] text-muted 2xl:hidden">
                          Data
                        </p>
                        <p className="mt-1 text-sm font-bold text-ink 2xl:mt-0">
                          {formatDate(page.createdAt, "short")}
                        </p>
                      </div>

                      <div className="min-w-0">
                        <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.14em] text-muted 2xl:hidden">
                          Titulo
                        </p>
                        <div className="mt-1 flex min-w-0 items-center gap-2 2xl:mt-0">
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-line bg-pink text-ink">
                            <Layers3 className="h-4 w-4" aria-hidden="true" />
                          </span>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-extrabold text-ink">
                              {page.title ?? version.name}
                            </p>
                            <p className="truncate text-xs font-semibold text-muted">
                              {version.name}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-start 2xl:contents">
                      <div className="grid gap-4 sm:grid-cols-[8.5rem_minmax(0,1fr)] xl:grid-cols-1 xl:gap-3 2xl:contents">
                        <div>
                          <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.14em] text-muted 2xl:hidden">
                            Status
                          </p>
                          <Badge variant={statusVariant(page.publishState)}>
                            {statusLabel(page.publishState)}
                          </Badge>
                        </div>

                        <div className="min-w-0">
                          <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.14em] text-muted 2xl:hidden">
                            Link
                          </p>
                          <p className="mt-1 truncate rounded-full border-2 border-line bg-white px-3 py-2 font-mono text-xs font-bold text-ink 2xl:mt-0">
                            {href}
                          </p>
                        </div>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] xl:grid-cols-1 xl:gap-3 2xl:contents">
                        <div className="flex flex-wrap gap-2">
                          <form action={togglePortfolioAction}>
                            <button
                              type="submit"
                              className={`inline-flex h-9 items-center rounded-full border-2 border-line px-3 text-xs font-extrabold uppercase transition hover:-translate-y-0.5 ${
                                portfolioActive
                                  ? "bg-pink text-ink"
                                  : "bg-white text-muted"
                              }`}
                            >
                              Portfolio
                            </button>
                          </form>
                          <form action={toggleResumeAction}>
                            <button
                              type="submit"
                              className={`inline-flex h-9 items-center rounded-full border-2 border-line px-3 text-xs font-extrabold uppercase transition hover:-translate-y-0.5 ${
                                resumeActive
                                  ? "bg-pink text-ink"
                                  : "bg-white text-muted"
                              }`}
                            >
                              Curriculo
                            </button>
                          </form>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 xl:justify-end 2xl:justify-end">
                          <form action={versionAction}>
                            <Button type="submit" variant="outline" size="sm">
                              Versionar
                            </Button>
                          </form>
                          <Button asChild variant="primary" size="sm">
                            <Link href={href} target="_blank" rel="noopener noreferrer">
                              Ver pagina
                              <ExternalLink className="h-4 w-4" aria-hidden="true" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
