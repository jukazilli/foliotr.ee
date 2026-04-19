import Link from "next/link";
import { ArrowRight, FileText, Globe, Star } from "lucide-react";
import { EmptyWorkspaceState, PageIntro } from "@/components/app/primitives";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAppViewer, getOwnedVersions } from "@/lib/server/app-viewer";
import { formatDate } from "@/lib/utils";

export default async function VersionsPage() {
  const { user } = await getAppViewer();
  const versions = await getOwnedVersions(user.id);

  if (versions.length === 0) {
    return (
      <div className="space-y-8">
        <PageIntro
          eyebrow="Versoes"
          title="Versoes"
          description="Crie versoes para objetivos diferentes."
        />
        <EmptyWorkspaceState
          accent="violet"
          label="Sem versoes"
          title="Voce ainda nao tem versoes"
          description="Crie uma versao para comecar."
          primaryAction={{ href: "/profile", label: "Completar perfil" }}
          secondaryAction={{ href: "/dashboard", label: "Voltar" }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageIntro
        eyebrow="Versoes"
        title="Versoes"
        description="Crie versoes para diferentes objetivos."
        meta={
          <>
            <Badge variant="version">{versions.length} versoes</Badge>
            <Badge variant="info">
              {versions.filter((version) => version.page).length} paginas
            </Badge>
            <Badge variant="success">
              {versions.filter((version) => version.resumeConfig).length} curriculos
            </Badge>
          </>
        }
        actions={
          <Button asChild variant="outline">
            <Link href="/pages">
              Ver paginas
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
        }
      />

      <section className="grid gap-4 xl:grid-cols-2">
        {versions.map((version) => {
          const page = version.page;
          const hasResume = Boolean(version.resumeConfig);
          const selectedCount =
            version.experiences.length +
            version.projects.length +
            version.achievements.length +
            version.skills.length +
            version.proofs.length +
            version.highlights.length +
            version.links.length;

          return (
            <Card key={version.id} className="rounded-[28px]">
              <CardHeader className="space-y-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 text-xl shadow-sm">
                      {version.emoji ?? "V"}
                    </span>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <CardTitle className="font-display text-2xl font-semibold tracking-tight">
                          {version.name}
                        </CardTitle>
                        {version.isDefault ? (
                          <Badge variant="version">
                            <Star className="mr-1 h-3 w-3" aria-hidden="true" />
                            Principal
                          </Badge>
                        ) : null}
                      </div>
                      <CardDescription className="mt-2 text-sm leading-7 text-neutral-600">
                        {version.description || version.context || "Sem descricao"}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant={page?.publishState === "PUBLISHED" ? "success" : "default"}>
                    {page?.publishState === "PUBLISHED" ? "publicada" : "rascunho"}
                  </Badge>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  {[
                    { label: "Itens", value: selectedCount, hint: "selecionados" },
                    { label: "Pagina", value: page ? 1 : 0, hint: page?.template?.name ?? "sem modelo" },
                    { label: "Curriculo", value: hasResume ? "ok" : "pendente", hint: hasResume ? "criado" : "sem curriculo" },
                  ].map((item) => (
                    <div key={item.label} className="rounded-[22px] border border-neutral-200 bg-neutral-50 p-4">
                      <p className="font-data text-[11px] font-semibold uppercase tracking-[0.24em] text-neutral-400">
                        {item.label}
                      </p>
                      <p className="mt-2 font-display text-2xl font-semibold tracking-tight text-neutral-950">
                        {item.value}
                      </p>
                      <p className="mt-1 text-sm text-neutral-600">{item.hint}</p>
                    </div>
                  ))}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="rounded-[22px] border border-neutral-200 bg-white p-4">
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Badge variant={page ? "info" : "default"}>
                      <Globe className="mr-1 h-3 w-3" aria-hidden="true" />
                      {page ? "com pagina" : "sem pagina"}
                    </Badge>
                    <Badge variant={hasResume ? "success" : "default"}>
                      <FileText className="mr-1 h-3 w-3" aria-hidden="true" />
                      {hasResume ? "com curriculo" : "sem curriculo"}
                    </Badge>
                    <Badge variant="default">
                      Atualizada em {formatDate(version.updatedAt, "short")}
                    </Badge>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap gap-2">
                    <Button asChild variant="outline" size="sm">
                      <Link href="/pages">Ver paginas</Link>
                    </Button>
                    <Button asChild variant="ghost" size="sm">
                      <Link href="/resumes">Ver curriculos</Link>
                    </Button>
                  </div>
                  <Link
                    href="/profile"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-700 transition-colors hover:text-neutral-950"
                  >
                    Editar perfil
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </section>
    </div>
  );
}
