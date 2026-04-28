import Link from "next/link";
import {
  CheckCircle2,
  CopyPlus,
  Eye,
  FileText,
  Layers3,
  Pencil,
  Plus,
  Power,
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

function IconButton({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <button
      type="submit"
      aria-label={label}
      title={label}
      className="inline-flex h-10 w-10 items-center justify-center rounded-full border-2 border-line bg-white text-ink transition hover:-translate-y-0.5 hover:bg-pink"
    >
      {children}
    </button>
  );
}

function IconLink({
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
      className="inline-flex h-10 w-10 items-center justify-center rounded-full border-2 border-line bg-white text-ink transition hover:-translate-y-0.5 hover:bg-pink"
    >
      {children}
    </Link>
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
      detail: `${activeCount} ativo${activeCount === 1 ? "" : "s"}`,
    },
    {
      label: "Curriculos",
      value: activeResumeCount,
      detail: "Modos de leitura publicados.",
    },
    {
      label: "Apresentacoes",
      value: withPresentationCount,
      detail: "Com apresentacao selecionada.",
    },
    {
      label: "Sem pagina",
      value: versionsWithoutPage.length,
      detail: "Aguardando modelo.",
    },
  ];

  return (
    <div className="space-y-6">
      <PageIntro
        eyebrow="Portfolios"
        title="Portfolios"
        description="Gerencie as experiencias publicadas no seu perfil."
        meta={
          <>
            <Badge variant="version">{rows.length} portfolios</Badge>
            <Badge variant="success">{activeCount} ativos</Badge>
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
        <section
          className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3"
          aria-label="Portfolios publicados e rascunhos"
        >
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
              <article
                key={version.id}
                className="flex min-h-[19rem] flex-col rounded-[18px] border-2 border-line bg-white p-4 shadow-app"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-line bg-pink text-ink">
                    <Layers3 className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <Badge variant={statusVariant(page.publishState)}>
                    {statusLabel(page.publishState)}
                  </Badge>
                </div>

                <div className="mt-4 min-w-0 flex-1">
                  <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-muted">
                    {formatDate(page.createdAt, "short")}
                  </p>
                  <h2 className="mt-2 line-clamp-2 text-2xl font-extrabold leading-tight tracking-[-0.03em] text-ink">
                    {page.title ?? version.name}
                  </h2>
                  <p className="mt-2 truncate text-sm font-semibold text-muted">
                    {version.name} / {page.template.name}
                  </p>
                  <p className="mt-3 rounded-full border-2 border-line bg-cream px-3 py-2 font-mono text-xs font-bold text-ink">
                    <span className="block truncate">{href}</span>
                  </p>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="rounded-full border-2 border-line bg-white px-3 py-1 text-xs font-extrabold text-ink">
                    {selectedCount} itens
                  </span>
                  {resumeActive ? (
                    <span className="inline-flex items-center gap-1 rounded-full border-2 border-line bg-lime px-3 py-1 text-xs font-extrabold text-ink">
                      <FileText className="h-3.5 w-3.5" aria-hidden="true" />
                      curriculo
                    </span>
                  ) : null}
                  {version.presentation ? (
                    <span className="inline-flex items-center gap-1 rounded-full border-2 border-line bg-cream px-3 py-1 text-xs font-extrabold text-ink">
                      <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                      apresentacao
                    </span>
                  ) : null}
                </div>

                <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t-2 border-line/10 pt-4">
                  <div className="flex flex-wrap gap-2">
                    <form action={togglePortfolioAction}>
                      <IconButton
                        label={
                          portfolioActive
                            ? "Despublicar portfolio"
                            : "Publicar portfolio"
                        }
                      >
                        <Power className="h-4 w-4" aria-hidden="true" />
                      </IconButton>
                    </form>
                    <form action={toggleResumeAction}>
                      <IconButton
                        label={
                          resumeActive ? "Despublicar curriculo" : "Publicar curriculo"
                        }
                      >
                        <FileText className="h-4 w-4" aria-hidden="true" />
                      </IconButton>
                    </form>
                    <form action={versionAction}>
                      <IconButton label="Criar variacao">
                        <CopyPlus className="h-4 w-4" aria-hidden="true" />
                      </IconButton>
                    </form>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <IconLink href="/profile" label="Editar dados do perfil">
                      <Pencil className="h-4 w-4" aria-hidden="true" />
                    </IconLink>
                    <IconLink href={href} label="Ver publico" target="_blank">
                      <Eye className="h-4 w-4" aria-hidden="true" />
                    </IconLink>
                  </div>
                </div>
              </article>
            );
          })}
        </section>
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
