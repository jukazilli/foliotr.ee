import Link from "next/link";
import { ArrowRight, FileText } from "lucide-react";
import { EmptyWorkspaceState, PageIntro } from "@/components/app/primitives";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getPrimaryVersionPage } from "@/lib/server/domain/includes";
import {
  getAppViewer,
  getOwnedResumeConfigs,
  getOwnedVersions,
} from "@/lib/server/app-viewer";
import { formatDate } from "@/lib/utils";

export default async function ResumesPage() {
  const { user } = await getAppViewer();
  const [resumeConfigs, versions] = await Promise.all([
    getOwnedResumeConfigs(user.id),
    getOwnedVersions(user.id),
  ]);

  const versionsWithoutResume = versions.filter((version) => !version.resumeConfig);

  return (
    <div className="space-y-8">
      <PageIntro
        eyebrow="Curriculos"
        title="Curriculos"
        description="Veja uma versao mais facil de ler."
        meta={
          <>
            <Badge variant="success">{resumeConfigs.length} curriculos</Badge>
            <Badge variant="version">
              {versionsWithoutResume.length} sem curriculo
            </Badge>
          </>
        }
        actions={
          <Button asChild variant="outline">
            <Link href="/portfolios">
              Ver portfolios
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
        }
      />

      {resumeConfigs.length === 0 ? (
        <EmptyWorkspaceState
          accent="lime"
          label="Sem curriculos"
          title="Voce ainda nao tem curriculos"
          description="Escolha uma versao para comecar."
          primaryAction={{ href: "/portfolios", label: "Ver portfolios" }}
          secondaryAction={{ href: "/profile", label: "Editar perfil" }}
        />
      ) : (
        <section className="grid gap-4 xl:grid-cols-2">
          {resumeConfigs.map((resume) => {
            const page = getPrimaryVersionPage(resume.version);

            return (
              <Card key={resume.id} className="rounded-[28px]">
                <CardHeader className="space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <CardTitle className="font-display text-2xl font-semibold tracking-tight">
                          {resume.version.name}
                        </CardTitle>
                        <Badge
                          variant={
                            resume.publishState === "PUBLISHED" ? "success" : "default"
                          }
                        >
                          {resume.publishState === "PUBLISHED"
                            ? "publicado"
                            : "rascunho"}
                        </Badge>
                      </div>
                      <CardDescription className="mt-2 text-sm leading-7 text-neutral-600">
                        {resume.sections.length > 0
                          ? `${resume.sections.length} secoes ativas`
                          : "Sem secoes definidas"}
                      </CardDescription>
                    </div>
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-lime-50 text-lime-700 shadow-sm">
                      <FileText className="h-5 w-5" aria-hidden="true" />
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-[22px] border border-neutral-200 bg-neutral-50 p-4">
                    <p className="font-data text-[11px] font-semibold uppercase tracking-[0.24em] text-neutral-400">
                      Atualizado
                    </p>
                    <p className="mt-2 text-sm leading-6 text-neutral-600">
                      {formatDate(resume.updatedAt, "long")}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Badge variant={resume.showPhoto ? "success" : "default"}>
                      foto {resume.showPhoto ? "visivel" : "oculta"}
                    </Badge>
                    <Badge variant={resume.showLinks ? "info" : "default"}>
                      links {resume.showLinks ? "visiveis" : "ocultos"}
                    </Badge>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap gap-2">
                      {page?.id ? (
                        <Button asChild variant="primary" size="sm">
                          <Link href={`/pages/${page.id}/resume`}>Abrir curriculo</Link>
                        </Button>
                      ) : null}
                      <Button asChild variant="outline" size="sm">
                        <Link href="/portfolios">Ver portfolio</Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </section>
      )}

      <Card className="rounded-[28px]">
        <CardHeader>
          <CardTitle className="font-display text-2xl font-semibold tracking-tight">
            Versoes sem curriculo
          </CardTitle>
          <CardDescription className="mt-2 text-sm leading-7 text-neutral-600">
            Escolha uma versao para criar o curriculo.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {versionsWithoutResume.length > 0 ? (
            versionsWithoutResume.map((version) => (
              <div
                key={version.id}
                className="flex flex-col gap-3 rounded-[22px] border border-neutral-200 bg-neutral-50 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-sm font-semibold text-neutral-900">
                    {version.name}
                  </p>
                  <p className="mt-1 text-sm leading-6 text-neutral-600">
                    {version.description || version.context || "Sem descricao"}
                  </p>
                </div>
                <Badge variant="default">sem curriculo</Badge>
              </div>
            ))
          ) : (
            <p className="text-sm leading-7 text-neutral-600">
              Todas as versoes ja tem curriculo.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
