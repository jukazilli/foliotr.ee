import Link from "next/link";
import {
  CheckCircle2,
  ExternalLink,
  FileText,
  Layers3,
  Pencil,
  Plus,
} from "lucide-react";
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

export default async function PortfoliosPage() {
  const { user } = await getAppViewer();
  const versions = await getOwnedVersions(user.id);
  const rows = versions
    .map((version) => ({
      version,
      page: getPrimaryVersionPage(version),
    }))
    .filter((item) => item.page);
  const versionsWithoutPage = versions.filter(
    (version) => !getPrimaryVersionPage(version)
  );

  const activeCount = rows.filter(
    (item) => item.page?.publishState === "PUBLISHED"
  ).length;
  const draftCount = rows.length - activeCount;
  const activeResumeCount = versions.filter(
    (version) => version.resumeConfig?.publishState === "PUBLISHED"
  ).length;
  const withPresentationCount = versions.filter(
    (version) => version.presentation
  ).length;
  const cockpitStats = [
    {
      label: "Portfolios",
      value: rows.length,
      detail: `${activeCount} ativo${activeCount === 1 ? "" : "s"} / ${draftCount} rascunho${draftCount === 1 ? "" : "s"}`,
    },
    {
      label: "Curriculos rapidos",
      value: activeResumeCount,
      detail: "Modos de leitura objetiva publicados.",
    },
    {
      label: "Apresentacoes",
      value: withPresentationCount,
      detail: "Portfolios com apresentacao selecionada.",
    },
    {
      label: "Sem pagina",
      value: versionsWithoutPage.length,
      detail: "Variacoes aguardando modelo.",
    },
  ];

  return (
    <div className="space-y-6">
      <PageIntro
        eyebrow="Portfolios"
        title="Portfolios"
        description="Cockpit para criar, editar, publicar e acompanhar suas paginas publicas e curriculos rapidos."
        meta={
          <>
            <Badge variant="version">{rows.length} portfolios</Badge>
            <Badge variant="success">{activeCount} ativas</Badge>
          </>
        }
        actions={
          <Button asChild variant="primary">
            <Link href="/templates">
              <Plus className="h-4 w-4" aria-hidden="true" />
              Novo portfolio
            </Link>
          </Button>
        }
      />

      <section
        className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
        aria-label="Resumo de portfolios"
      >
        {cockpitStats.map((item) => (
          <Card key={item.label} className="rounded-[18px]">
            <CardContent className="p-4">
              <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.16em] text-muted">
                {item.label}
              </p>
              <strong className="mt-3 block text-3xl font-extrabold leading-none tracking-[-0.04em] text-ink">
                {item.value}
              </strong>
              <p className="mt-2 text-xs font-bold leading-5 text-muted">
                {item.detail}
              </p>
            </CardContent>
          </Card>
        ))}
      </section>

      {rows.length === 0 ? (
        <EmptyWorkspaceState
          accent="neutral"
          label="Sem portfolios"
          title="Crie seu primeiro portfolio"
          description="Um portfolio nasce a partir de um modelo aplicado ao seu perfil base."
          primaryAction={{ href: "/templates", label: "Escolher modelo" }}
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
                              {version.name} / {page.template.name}
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
                          <p className="mt-2 text-xs font-bold text-muted 2xl:hidden">
                            {selectedCount} itens selecionados
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
                          {version.presentation ? (
                            <span className="inline-flex h-9 items-center rounded-full border-2 border-line bg-cream px-3 text-xs font-extrabold uppercase text-ink">
                              Apresentacao
                            </span>
                          ) : null}
                        </div>

                        <div className="flex flex-wrap items-center gap-2 xl:justify-end 2xl:justify-end">
                          <Button asChild variant="outline" size="sm">
                            <Link href={`/pages/${page.id}/editor`}>
                              <Pencil className="h-4 w-4" aria-hidden="true" />
                              Editar
                            </Link>
                          </Button>
                          <form action={versionAction}>
                            <Button type="submit" variant="outline" size="sm">
                              Criar variacao
                            </Button>
                          </form>
                          <Button asChild variant="primary" size="sm">
                            <Link href={href} target="_blank" rel="noopener noreferrer">
                              Ver publico
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

      {versionsWithoutPage.length > 0 ? (
        <Card className="rounded-[18px]">
          <CardContent className="space-y-4 p-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.16em] text-muted">
                  Aguardando modelo
                </p>
                <h2 className="mt-1 text-xl font-extrabold tracking-[-0.03em] text-ink">
                  Variacoes sem portfolio publicado
                </h2>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link href="/templates">Escolher modelo</Link>
              </Button>
            </div>
            <div className="grid gap-3">
              {versionsWithoutPage.map((version) => (
                <div
                  key={version.id}
                  className="flex flex-col gap-3 rounded-[14px] border-2 border-line/10 bg-cream px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-extrabold text-ink">
                      {version.name}
                    </p>
                    <p className="mt-1 text-xs font-bold leading-5 text-muted">
                      {countSelectedItems(version)} itens selecionados
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {version.resumeConfig ? (
                      <Badge variant="success">
                        <FileText className="mr-1 h-3 w-3" aria-hidden="true" />
                        curriculo configurado
                      </Badge>
                    ) : null}
                    {version.presentation ? (
                      <Badge variant="version">
                        <CheckCircle2 className="mr-1 h-3 w-3" aria-hidden="true" />
                        apresentacao
                      </Badge>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
