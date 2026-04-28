import Link from "next/link";
import {
  ArrowUpRight,
  BriefcaseBusiness,
  CheckCircle2,
  ExternalLink,
  FolderOpenDot,
  GraduationCap,
  Layers3,
  Link2,
  Medal,
  Sparkles,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { getDashboardViewer } from "@/lib/server/app-viewer";

function plural(value: number, singular: string, pluralLabel: string) {
  return value === 1 ? singular : pluralLabel;
}

export default async function DashboardPage() {
  const profile = await getDashboardViewer();
  const firstName = (profile.displayName || profile.user.name || "voce").split(" ")[0];
  const totalProfileItems =
    profile._count.educations +
    profile._count.experiences +
    profile._count.projects +
    profile._count.achievements +
    profile._count.highlights +
    profile._count.proofs +
    profile._count.links +
    (profile.websiteUrl ? 1 : 0);
  const publishedPages = profile.versions.reduce(
    (total, version) =>
      total + version.pages.filter((page) => page.publishState === "PUBLISHED").length,
    0
  );
  const publishedResumes = profile.versions.filter(
    (version) => version.resumeConfig?.publishState === "PUBLISHED"
  ).length;
  const defaultVersion =
    profile.versions.find((version) => version.isDefault) ?? profile.versions[0];

  const quickActions = [
    {
      label: "Formacao",
      href: "/profile?tab=formacao",
      count: profile._count.educations,
      icon: GraduationCap,
      helper: "Cursos, certificacoes e trajetorias de estudo.",
    },
    {
      label: "Experiencias",
      href: "/profile?tab=experiencias",
      count: profile._count.experiences,
      icon: BriefcaseBusiness,
      helper: "Cargos, freelas, estagios e responsabilidades.",
    },
    {
      label: "Projetos",
      href: "/profile?tab=projetos",
      count: profile._count.projects,
      icon: FolderOpenDot,
      helper: "Cases, produtos, estudos e entregas comprovaveis.",
    },
    {
      label: "Reconhecimentos",
      href: "/profile?tab=reconhecimentos",
      count: profile._count.achievements + profile._count.highlights,
      icon: Medal,
      helper: "Premios, marcos, metricas e destaques.",
    },
    {
      label: "Links",
      href: "/profile?tab=links",
      count: profile._count.links + (profile.websiteUrl ? 1 : 0),
      icon: Link2,
      helper: "Redes, sites, publicacoes e canais externos.",
    },
    {
      label: "Reviews",
      href: "/profile?tab=reviews",
      count: profile._count.proofs,
      icon: ExternalLink,
      helper: "Avaliacoes recebidas e aprovadas para o perfil publico.",
    },
  ];

  const stats = [
    {
      label: "Base profissional",
      value: totalProfileItems,
      detail: `${totalProfileItems} ${plural(totalProfileItems, "item preenchido", "itens preenchidos")}`,
    },
    {
      label: "Portfolios",
      value: profile.versions.length,
      detail: `${profile.versions.length} ${plural(profile.versions.length, "portfolio criado", "portfolios criados")}`,
    },
    {
      label: "Paginas publicas",
      value: publishedPages,
      detail: `${publishedPages} ${plural(publishedPages, "pagina publicada", "paginas publicadas")}`,
    },
    {
      label: "Curriculos",
      value: publishedResumes,
      detail: `${publishedResumes} ${plural(publishedResumes, "curriculo publicado", "curriculos publicados")}`,
    },
  ];

  const nextSteps = [
    {
      title: profile.headline
        ? "Refinar apresentacao"
        : "Adicionar titulo profissional",
      href: "/profile",
      done: Boolean(profile.headline),
      description: profile.headline
        ? profile.headline
        : "Uma frase clara ajuda recrutadores a entenderem sua area em segundos.",
    },
    {
      title:
        profile._count.projects > 0 ? "Revisar projetos" : "Adicionar primeiro projeto",
      href: "/profile?tab=projetos",
      done: profile._count.projects > 0,
      description:
        profile._count.projects > 0
          ? "Mantenha os projetos mais fortes com contexto, papel e resultado."
          : "Projetos tornam seu Linkfolio mais concreto que um perfil textual.",
    },
    {
      title: publishedPages > 0 ? "Portfolio ativo" : "Publicar portfolio",
      href: "/portfolios",
      done: publishedPages > 0,
      description:
        publishedPages > 0
          ? "Sua pagina ja pode ser compartilhada com clientes e recrutadores."
          : "Transforme sua base em um portfolio publico.",
    },
  ];

  return (
    <div className="grid gap-6 lg:grid-cols-12">
      <section className="relative overflow-hidden rounded-[18px] border-2 border-line bg-lime p-6 shadow-hard-sm md:p-8 lg:col-span-12">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-8">
            <p className="eyebrow">Area inicial</p>
            <h1 className="max-w-[12ch] text-[clamp(3rem,6vw,6.4rem)] font-extrabold leading-[0.98] tracking-[-0.04em] text-ink">
              Atualize seu Linkfolio, {firstName}.
            </h1>
            <p className="mt-5 max-w-2xl text-lg font-semibold leading-7 text-ink/80">
              Organize sua base profissional, publique portfolios e gere curriculos
              rapidos para cada oportunidade.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:col-span-4 lg:grid-cols-1">
            <Link
              href="/profile"
              className="inline-flex min-h-14 items-center justify-between gap-3 border-2 border-line bg-pink px-5 text-sm font-extrabold uppercase text-ink transition hover:-translate-y-0.5"
            >
              Completar perfil
              <ArrowUpRight className="h-5 w-5" aria-hidden="true" />
            </Link>
            <Link
              href="/portfolios"
              className="inline-flex min-h-14 items-center justify-between gap-3 border-2 border-line bg-white px-5 text-sm font-extrabold uppercase text-ink transition hover:-translate-y-0.5"
            >
              Portfolios
              <ArrowUpRight className="h-5 w-5" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <section
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 lg:col-span-12"
        aria-label="Resumo"
      >
        {stats.map((item) => (
          <Card key={item.label} className="rounded-[18px]">
            <CardContent className="p-5">
              <p className="text-[0.72rem] font-extrabold uppercase tracking-[0.2em] text-muted">
                {item.label}
              </p>
              <strong className="mt-4 block text-5xl font-extrabold leading-none tracking-[-0.05em] text-ink">
                {item.value}
              </strong>
              <p className="mt-3 text-sm font-bold leading-5 text-muted">
                {item.detail}
              </p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section
        className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 lg:col-span-8"
        aria-label="Ações rápidas"
      >
        <div className="md:col-span-2 xl:col-span-3">
          <p className="eyebrow">Base profissional</p>
          <h2 className="mt-2 max-w-3xl text-3xl font-extrabold leading-tight tracking-[-0.04em] text-ink md:text-4xl">
            Edite os blocos que alimentam portfolios, curriculos e variacoes.
          </h2>
        </div>

        {quickActions.map((item) => {
          const actionLabel = item.count > 0 ? "Atualizar" : "Adicionar";

          return (
            <Link key={item.label} href={item.href} className="group block">
              <Card className="h-full rounded-[18px] transition hover:-translate-y-1">
                <CardContent className="flex h-full flex-col gap-5 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <span className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-line bg-pink text-ink">
                      <item.icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <span className="rounded-full border-2 border-line bg-cream px-3 py-1 text-xs font-extrabold text-ink">
                      {item.count}
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="text-2xl font-extrabold tracking-[-0.04em] text-ink">
                      {item.label}
                    </h3>
                    <p className="mt-2 text-sm font-semibold leading-5 text-muted">
                      {item.helper}
                    </p>
                  </div>

                  <div className="flex items-center justify-between gap-3 border-t-2 border-line/10 pt-4">
                    <span className="text-sm font-extrabold uppercase text-ink">
                      {actionLabel}
                    </span>
                    <span className="text-sm font-bold text-orange transition group-hover:translate-x-0.5">
                      Abrir
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </section>

      <aside className="grid gap-4 lg:col-span-4">
        <Card className="rounded-[18px] bg-cream text-ink">
          <CardContent className="p-5">
            <p className="text-[0.72rem] font-extrabold uppercase tracking-[0.2em] text-muted">
              Proximos passos
            </p>
            <div className="mt-5 grid gap-4">
              {nextSteps.map((step) => (
                <Link
                  key={step.title}
                  href={step.href}
                  className="group grid gap-2 border-b-2 border-line/10 pb-4 last:border-0 last:pb-0"
                >
                  <div className="flex items-center gap-3">
                    <span className={step.done ? "text-ink" : "text-muted"}>
                      {step.done ? (
                        <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
                      ) : (
                        <Sparkles className="h-5 w-5" aria-hidden="true" />
                      )}
                    </span>
                    <strong className="text-base font-extrabold text-ink">
                      {step.title}
                    </strong>
                  </div>
                  <p className="text-sm font-semibold leading-5 text-muted">
                    {step.description}
                  </p>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[18px] bg-white">
          <CardContent className="p-5">
            <p className="text-[0.72rem] font-extrabold uppercase tracking-[0.2em] text-muted">
              Portfolio principal
            </p>
            <div className="mt-5 flex items-start gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-line bg-cream">
                <Layers3 className="h-5 w-5" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <h3 className="text-xl font-extrabold tracking-[-0.04em]">
                  {defaultVersion?.name ?? "Principal"}
                </h3>
                <p className="mt-1 text-sm font-semibold leading-5 text-muted">
                  Use variacoes para adaptar portfolio e curriculo a cada objetivo.
                </p>
              </div>
            </div>
            <Link
              href="/portfolios"
              className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 bg-lime px-4 text-sm font-extrabold uppercase text-ink transition hover:-translate-y-0.5"
            >
              Gerenciar portfolios
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </CardContent>
        </Card>

        <Card className="rounded-[18px] bg-cream">
          <CardContent className="p-5">
            <p className="text-[0.72rem] font-extrabold uppercase tracking-[0.2em] text-muted">
              Publicacao
            </p>
            <div className="mt-5 grid gap-3">
              <Link
                href="/portfolios"
                className="flex items-center justify-between gap-3 rounded-[14px] bg-white px-4 py-3 text-sm font-extrabold"
              >
                <span className="inline-flex items-center gap-2">
                  <Layers3 className="h-4 w-4" aria-hidden="true" />
                  Portfolios
                </span>
                <span>{publishedPages}</span>
              </Link>
              <div className="flex items-center justify-between gap-3 rounded-[14px] bg-white px-4 py-3 text-sm font-extrabold">
                <span>Curriculos ativos</span>
                <span>{publishedResumes}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}
