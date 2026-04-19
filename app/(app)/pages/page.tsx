import Link from "next/link";
import { ArrowRight, ExternalLink, Globe } from "lucide-react";
import { EmptyWorkspaceState, PageIntro } from "@/components/app/primitives";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAppViewer, getOwnedPages, getOwnedVersions } from "@/lib/server/app-viewer";
import { formatDate } from "@/lib/utils";

export default async function PagesPage() {
  const { user } = await getAppViewer();
  const [pages, versions] = await Promise.all([getOwnedPages(user.id), getOwnedVersions(user.id)]);
  const versionsWithoutPage = versions.filter((version) => !version.page);

  return (
    <div className="space-y-8">
      <PageIntro
        eyebrow="Paginas"
        title="Paginas"
        description="Edite e publique suas paginas."
        meta={
          <>
            <Badge variant="info">{pages.length} paginas</Badge>
            <Badge variant="success">
              {pages.filter((page) => page.publishState === "PUBLISHED").length} publicadas
            </Badge>
            <Badge variant="version">{versionsWithoutPage.length} sem pagina</Badge>
          </>
        }
        actions={
          <Button asChild variant="outline">
            <Link href="/templates">
              Ver modelos
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
        }
      />

      {pages.length === 0 ? (
        <EmptyWorkspaceState
          accent="cyan"
          label="Sem paginas"
          title="Voce ainda nao tem paginas"
          description="Escolha um modelo para comecar."
          primaryAction={{ href: "/templates", label: "Escolher modelo" }}
          secondaryAction={{ href: "/versions", label: "Ver versoes" }}
        />
      ) : (
        <section className="grid gap-4 xl:grid-cols-2">
          {pages.map((page) => (
            <Card key={page.id} className="rounded-[28px]">
              <CardHeader className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <CardTitle className="font-display text-2xl font-semibold tracking-tight">
                        {page.title ?? page.version.name}
                      </CardTitle>
                      <Badge variant={page.publishState === "PUBLISHED" ? "success" : "default"}>
                        {page.publishState === "PUBLISHED" ? "ao vivo" : "rascunho"}
                      </Badge>
                    </div>
                    <CardDescription className="mt-2 text-sm leading-7 text-neutral-600">
                      {page.version.name} • {page.template.name}
                    </CardDescription>
                  </div>
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-700 shadow-sm">
                    <Globe className="h-5 w-5" aria-hidden="true" />
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-[22px] border border-neutral-200 bg-neutral-50 p-4">
                  <p className="font-data text-[11px] font-semibold uppercase tracking-[0.24em] text-neutral-400">
                    Link
                  </p>
                  <p className="mt-2 font-mono text-sm text-neutral-800">
                    /{user.username ?? "seu-endereco"}/{page.slug}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-neutral-600">
                    Atualizada em {formatDate(page.updatedAt, "long")}.
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap gap-2">
                    <Button asChild variant="primary" size="sm">
                      <Link href={`/pages/${page.id}/editor`}>Editar pagina</Link>
                    </Button>
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/pages/${page.id}/resume`}>Ver curriculo</Link>
                    </Button>
                    <Button asChild variant="ghost" size="sm">
                      <Link href="/templates">Trocar modelo</Link>
                    </Button>
                  </div>
                  {user.username ? (
                    <Link
                      href={`/${user.username}/${page.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-700 transition-colors hover:text-neutral-950"
                    >
                      Abrir
                      <ExternalLink className="h-4 w-4" aria-hidden="true" />
                    </Link>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          ))}
        </section>
      )}

      <Card className="rounded-[28px]">
        <CardHeader>
          <CardTitle className="font-display text-2xl font-semibold tracking-tight">
            Versoes sem pagina
          </CardTitle>
          <CardDescription className="mt-2 text-sm leading-7 text-neutral-600">
            Escolha um modelo para criar a pagina.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {versionsWithoutPage.length > 0 ? (
            versionsWithoutPage.map((version) => (
              <div
                key={version.id}
                className="flex flex-col gap-3 rounded-[22px] border border-neutral-200 bg-neutral-50 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-sm font-semibold text-neutral-900">{version.name}</p>
                  <p className="mt-1 text-sm leading-6 text-neutral-600">
                    {version.description || version.context || "Sem descricao"}
                  </p>
                </div>
                <Badge variant="default">sem pagina</Badge>
              </div>
            ))
          ) : (
            <p className="text-sm leading-7 text-neutral-600">Todas as versoes ja tem pagina.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
