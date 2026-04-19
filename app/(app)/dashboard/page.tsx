import Link from "next/link";
import { ArrowRight, CheckCircle2, CircleDashed, Globe, Layers3, UserRound } from "lucide-react";
import { FlowStepCard, PageIntro, StatCard } from "@/components/app/primitives";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getDashboardViewer } from "@/lib/server/app-viewer";
import { getPrimaryVersionPage } from "@/lib/server/domain/includes";
import { formatDate } from "@/lib/utils";

export default async function DashboardPage() {
  const profile = await getDashboardViewer();
  const firstName = (profile.displayName || profile.user.name || "voce").split(" ")[0];
  const pages = profile.versions.flatMap((version) => {
    const page = getPrimaryVersionPage(version);
    return page ? [page] : [];
  });
  const resumeConfigs = profile.versions.flatMap((version) =>
    version.resumeConfig ? [version.resumeConfig] : []
  );
  const counts = {
    versions: profile.versions.length,
    pages: pages.length,
    publishedPages: pages.filter((page) => page.publishState === "PUBLISHED").length,
    resumeConfigs: resumeConfigs.length,
    publishedResumes: resumeConfigs.filter((config) => config.publishState === "PUBLISHED").length,
    experiences: profile._count.experiences,
    projects: profile._count.projects,
    proofs: profile._count.proofs,
    links: profile._count.links + (profile.websiteUrl ? 1 : 0),
  };
  const checks = [
    Boolean(profile.displayName || profile.user.name),
    Boolean(profile.headline),
    Boolean(profile.bio),
    counts.experiences > 0,
    counts.projects > 0,
    counts.links > 0,
    profile._count.achievements > 0 || profile._count.proofs > 0,
  ];
  const strength = {
    completed: checks.filter(Boolean).length,
    total: checks.length,
    percent: Math.round((checks.filter(Boolean).length / checks.length) * 100),
  };
  const defaultVersion = profile.versions.find((version) => version.isDefault) ?? profile.versions[0];

  return (
    <div className="space-y-8">
      <PageIntro
        eyebrow="Area inicial"
        title={`Oi, ${firstName}.`}
        description="Veja o que falta e siga para a proxima etapa."
        meta={
          <>
            <Badge variant="warning">Perfil {strength.percent}%</Badge>
            <Badge variant="version">{counts.versions} versoes</Badge>
            <Badge variant="info">{counts.publishedPages} paginas</Badge>
          </>
        }
        actions={
          <>
            <Button asChild variant="outline">
              <Link href="/profile">Editar perfil</Link>
            </Button>
            <Button asChild variant="primary">
              <Link href="/versions">
                Ver versoes
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
          </>
        }
      />

      <section className="grid gap-4 xl:grid-cols-4">
        <StatCard label="Perfil" value={`${strength.percent}%`} hint="Complete seu perfil." tone="blue" />
        <StatCard label="Versoes" value={counts.versions} hint="Crie versoes diferentes." tone="violet" />
        <StatCard label="Paginas" value={counts.publishedPages} hint="Paginas publicadas." tone="cyan" />
        <StatCard label="Curriculos" value={counts.resumeConfigs} hint="Curriculos prontos." tone="lime" />
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <FlowStepCard
          step="01"
          title="Perfil"
          description="Complete suas informacoes."
          href="/profile"
          status={strength.percent >= 70 ? "pronto" : "falta preencher"}
          tone="blue"
        />
        <FlowStepCard
          step="02"
          title="Versoes"
          description="Crie versoes para objetivos diferentes."
          href="/versions"
          status={counts.versions > 1 ? "mais de uma versao" : "primeira versao"}
          tone="violet"
        />
        <FlowStepCard
          step="03"
          title="Paginas e curriculos"
          description="Publique sua pagina ou veja o curriculo."
          href={counts.publishedPages > 0 ? "/pages" : "/resumes"}
          status={
            counts.publishedPages > 0 || counts.resumeConfigs > 0 ? "pronto" : "sem publicar"
          }
          tone="cyan"
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="rounded-[28px]">
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div>
              <CardTitle className="font-display text-2xl font-semibold tracking-tight">
                Resumo
              </CardTitle>
              <CardDescription className="mt-2 max-w-2xl text-sm leading-7 text-neutral-600">
                Veja o que ja esta pronto.
              </CardDescription>
            </div>
            {defaultVersion ? (
              <Badge variant="version" className="shrink-0">
                Versao principal
              </Badge>
            ) : null}
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              {[
                {
                  icon: UserRound,
                  label: "Perfil",
                  value: `${counts.experiences} experiencias`,
                  description: "Experiencias cadastradas.",
                },
                {
                  icon: Layers3,
                  label: "Versao",
                  value: defaultVersion?.name ?? "Principal",
                  description: "Versao em foco.",
                },
                {
                  icon: Globe,
                  label: "Pagina",
                  value: counts.publishedPages > 0 ? `${counts.publishedPages} no ar` : "sem pagina",
                  description: "Status atual.",
                },
              ].map((item) => (
                <div key={item.label} className="rounded-[24px] border border-neutral-200 bg-neutral-50 p-5">
                  <item.icon className="h-5 w-5 text-neutral-500" aria-hidden="true" />
                  <p className="mt-4 font-data text-[11px] font-semibold uppercase tracking-[0.24em] text-neutral-400">
                    {item.label}
                  </p>
                  <p className="mt-2 font-display text-2xl font-semibold tracking-tight text-neutral-950">
                    {item.value}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-neutral-600">{item.description}</p>
                </div>
              ))}
            </div>

            <div className="rounded-[24px] border border-neutral-200 bg-white p-5">
              <p className="font-data text-[11px] font-semibold uppercase tracking-[0.24em] text-neutral-400">
                Proximo passo
              </p>
              <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-base font-semibold text-neutral-900">
                    {strength.percent < 70
                      ? "Complete seu perfil."
                      : counts.publishedPages === 0
                        ? "Crie sua primeira pagina."
                        : "Revise suas versoes."}
                  </p>
                </div>
                <Button asChild variant="outline">
                  <Link href={strength.percent < 70 ? "/profile" : "/versions"}>
                    {strength.percent < 70 ? "Completar perfil" : "Ver versoes"}
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[28px]">
          <CardHeader>
            <CardTitle className="font-display text-2xl font-semibold tracking-tight">
              Checklist
            </CardTitle>
            <CardDescription className="mt-2 text-sm leading-7 text-neutral-600">
              O que ja esta pronto.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              {
                done: Boolean(profile.headline && profile.bio),
                label: "Perfil preenchido",
                description: "Nome, headline e bio.",
              },
              {
                done: counts.versions > 0,
                label: "Versao criada",
                description: "Uma versao ja esta pronta.",
              },
              {
                done: counts.publishedPages > 0 || counts.resumeConfigs > 0,
                label: "Saida pronta",
                description: "Pagina ou curriculo.",
              },
            ].map((item) => (
              <div key={item.label} className="flex gap-3 rounded-[22px] border border-neutral-200 bg-neutral-50 p-4">
                {item.done ? (
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
                ) : (
                  <CircleDashed className="mt-0.5 h-5 w-5 shrink-0 text-neutral-400" />
                )}
                <div>
                  <p className="text-sm font-semibold text-neutral-900">{item.label}</p>
                  <p className="mt-1 text-sm leading-6 text-neutral-600">{item.description}</p>
                </div>
              </div>
            ))}

            {defaultVersion ? (
              <div className="rounded-[22px] border border-violet-100 bg-violet-50/70 p-4">
                <p className="font-data text-[11px] font-semibold uppercase tracking-[0.24em] text-violet-700">
                  Versao
                </p>
                <p className="mt-2 font-semibold text-neutral-950">{defaultVersion.name}</p>
                <p className="mt-1 text-sm leading-6 text-neutral-600">
                  Atualizada em {formatDate(defaultVersion.updatedAt, "long")}.
                </p>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
