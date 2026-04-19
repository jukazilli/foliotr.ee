import Link from "next/link";
import { CheckCircle2, ExternalLink, Layers3, LockKeyhole, TriangleAlert } from "lucide-react";
import { notFound } from "next/navigation";
import { PageIntro, EmptyWorkspaceState } from "@/components/app/primitives";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { getAppViewer, getOwnedVersions } from "@/lib/server/app-viewer";
import {
  evaluateTemplateEligibility,
  getCanonicalTemplateBySlug,
} from "@/lib/server/domain/canonical-templates";
import { getCanonicalTemplateManifest } from "@/lib/templates/registry";
import { useCanonicalTemplateAction } from "../actions";

interface TemplateDetailPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ applied?: string; version?: string; error?: string }>;
}

export default async function TemplateDetailPage({
  params,
  searchParams,
}: TemplateDetailPageProps) {
  const [{ slug }, state] = await Promise.all([params, searchParams]);
  const { profile, user } = await getAppViewer();
  const [template, versions] = await Promise.all([
    getCanonicalTemplateBySlug(prisma, slug),
    getOwnedVersions(user.id),
  ]);

  const manifest = getCanonicalTemplateManifest(slug);

  if (!template || !manifest) {
    notFound();
  }

  const baseEligibility = evaluateTemplateEligibility(manifest, profile);
  const appliedVersionId = state.applied === "1" ? state.version ?? null : null;

  return (
    <div className="space-y-8">
      <PageIntro
        eyebrow="Modelo"
        title={template.name}
        description="Veja os detalhes e escolha uma versao."
        meta={
          <>
            <Badge variant="warning">{template.libraryStatus}</Badge>
            <Badge variant="default">{template.category}</Badge>
          </>
        }
        actions={
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline">
              <Link href="/templates">Voltar</Link>
            </Button>
            <Button asChild variant="ghost">
              <Link href="/profile">Editar perfil</Link>
            </Button>
          </div>
        }
      />

      {appliedVersionId ? (
        <Card className="rounded-[26px] border-green-200 bg-green-50/80">
          <CardContent className="flex items-start gap-3 p-5">
            <CheckCircle2 className="mt-0.5 h-5 w-5 text-green-700" aria-hidden="true" />
            <div>
              <p className="text-sm font-semibold text-green-900">Modelo aplicado.</p>
              <p className="mt-1 text-sm leading-7 text-green-800">
                A pagina e o curriculo foram criados em rascunho.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Card className="overflow-hidden rounded-[32px] border border-neutral-200">
          <div className="aspect-[16/10] bg-[#FBF8CC]">
            <img src={template.coverUrl} alt={template.name} className="h-full w-full object-cover" />
          </div>
        </Card>

        <div className="space-y-4">
          <Card className="rounded-[28px] border border-neutral-200 bg-white/90">
            <CardHeader>
              <CardTitle className="font-display text-2xl font-semibold tracking-tight">
                Sobre este modelo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm leading-7 text-neutral-600">
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                <div className="rounded-[20px] border border-neutral-200 bg-neutral-50 p-4">
                  <p className="font-data text-[11px] font-semibold uppercase tracking-[0.2em] text-neutral-400">
                    Origem
                  </p>
                  <p className="mt-2 font-semibold text-neutral-900">
                    {template.origin ?? "Interna"}
                  </p>
                </div>
                <div className="rounded-[20px] border border-neutral-200 bg-neutral-50 p-4">
                  <p className="font-data text-[11px] font-semibold uppercase tracking-[0.2em] text-neutral-400">
                    Blocos
                  </p>
                  <p className="mt-2 font-semibold text-neutral-900">
                    {template.blockDefs.length}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {template.tags.map((tag) => (
                  <Badge key={tag} variant="default">
                    {tag}
                  </Badge>
                ))}
              </div>

              <div className="rounded-[20px] border border-lime-100 bg-lime-50/80 p-4">
                <div className="flex items-start gap-3">
                  <LockKeyhole className="mt-0.5 h-4 w-4 text-lime-800" aria-hidden="true" />
                  <div>
                    <p className="font-semibold text-neutral-900">Estilo fixo</p>
                    <p className="mt-1 text-sm leading-7 text-neutral-600">
                      Voce pode editar conteudo, imagens e blocos.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[28px] border border-neutral-200 bg-white/90">
            <CardHeader>
              <CardTitle className="font-display text-2xl font-semibold tracking-tight">
                Antes de usar
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {baseEligibility.eligible ? (
                <div className="rounded-[20px] border border-green-200 bg-green-50/80 p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-green-700" aria-hidden="true" />
                    <div>
                      <p className="text-sm font-semibold text-green-900">Tudo certo.</p>
                      <p className="mt-1 text-sm leading-7 text-green-800">
                        Seu perfil ja pode usar este modelo.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-[20px] border border-coral-200 bg-coral-50/80 p-4">
                  <div className="flex items-start gap-3">
                    <TriangleAlert className="mt-0.5 h-4 w-4 text-coral-700" aria-hidden="true" />
                    <div>
                      <p className="text-sm font-semibold text-coral-900">
                        Faltam algumas informacoes.
                      </p>
                      <ul className="mt-2 space-y-2 text-sm leading-7 text-coral-900">
                        {baseEligibility.issues.map((issue) => (
                          <li key={issue.key}>- {issue.description}</li>
                        ))}
                      </ul>
                      <div className="mt-4">
                        <Button asChild variant="outline" size="sm">
                          <Link href="/profile">
                            Completar perfil
                            <ExternalLink className="h-4 w-4" aria-hidden="true" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      {versions.length === 0 ? (
        <EmptyWorkspaceState
          title="Nenhuma versao disponivel"
          description="Crie uma versao para usar este modelo."
          primaryAction={{ href: "/versions", label: "Ver versoes" }}
          secondaryAction={{ href: "/profile", label: "Voltar ao perfil" }}
          accent="lime"
          label="Sem versoes"
        />
      ) : (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Layers3 className="h-4 w-4 text-neutral-500" aria-hidden="true" />
            <h2 className="font-display text-2xl font-semibold tracking-tight text-neutral-950">
              Escolha uma versao
            </h2>
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            {versions.map((version) => {
              const eligibility = evaluateTemplateEligibility(manifest, profile, version);
              const alreadyApplied = version.page?.template?.slug === template.slug;
              const useAction = useCanonicalTemplateAction.bind(null, template.slug);

              return (
                <Card key={version.id} className="rounded-[28px] border border-neutral-200 bg-white/90">
                  <CardContent className="space-y-5 p-6">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant={version.isDefault ? "success" : "default"}>
                            {version.isDefault ? "principal" : "versao"}
                          </Badge>
                          {alreadyApplied ? <Badge variant="warning">aplicado</Badge> : null}
                          {version.page?.publishState ? (
                            <Badge variant="info">{version.page.publishState.toLowerCase()}</Badge>
                          ) : null}
                        </div>
                        <h3 className="mt-3 font-display text-2xl font-semibold tracking-tight text-neutral-950">
                          {version.name}
                        </h3>
                        {version.context ? (
                          <p className="mt-2 text-sm leading-7 text-neutral-600">{version.context}</p>
                        ) : null}
                      </div>
                    </div>

                    {!eligibility.eligible ? (
                      <div className="rounded-[20px] border border-coral-100 bg-coral-50/70 p-4">
                        <p className="text-sm font-semibold text-coral-900">Faltam algumas informacoes.</p>
                        <ul className="mt-2 space-y-1 text-sm leading-6 text-coral-900">
                          {eligibility.issues.map((issue) => (
                            <li key={`${version.id}-${issue.key}`}>- {issue.description}</li>
                          ))}
                        </ul>
                      </div>
                    ) : (
                      <div className="rounded-[20px] border border-green-100 bg-green-50/70 p-4 text-sm text-green-900">
                        Tudo certo para usar este modelo.
                      </div>
                    )}

                    <form action={useAction} className="flex flex-wrap items-center gap-3">
                      <input type="hidden" name="versionId" value={version.id} />
                      <Button type="submit" disabled={!eligibility.eligible}>
                        {alreadyApplied ? "Aplicar de novo" : "Usar modelo"}
                      </Button>
                      <Button asChild variant="outline" size="sm">
                        <Link href="/versions">Ver versao</Link>
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
