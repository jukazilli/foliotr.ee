import Link from "next/link";
import {
  BriefcaseBusiness,
  ExternalLink,
  FolderOpenDot,
  GraduationCap,
  Link2,
  Medal,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { getDashboardViewer } from "@/lib/server/app-viewer";

export default async function DashboardPage() {
  const profile = await getDashboardViewer();
  const firstName = (profile.displayName || profile.user.name || "voce").split(" ")[0];

  const quickActions = [
    {
      label: "Formacao",
      href: "/profile?tab=formacao",
      count: profile._count.educations,
      icon: GraduationCap,
    },
    {
      label: "Experiencias",
      href: "/profile?tab=experiencias",
      count: profile._count.experiences,
      icon: BriefcaseBusiness,
    },
    {
      label: "Projetos",
      href: "/profile?tab=projetos",
      count: profile._count.projects,
      icon: FolderOpenDot,
    },
    {
      label: "Reconhecimentos",
      href: "/profile?tab=reconhecimentos",
      count: profile._count.achievements + profile._count.highlights,
      icon: Medal,
    },
    {
      label: "Links",
      href: "/profile?tab=links",
      count: profile._count.links + (profile.websiteUrl ? 1 : 0),
      icon: Link2,
    },
    {
      label: "Provas",
      href: "/profile?tab=provas",
      count: profile._count.proofs,
      icon: ExternalLink,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <p className="font-data text-[11px] font-semibold uppercase tracking-[0.24em] text-neutral-400">
          Area inicial
        </p>
        <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight text-neutral-950 sm:text-[2.5rem]">
          Atualize seu portfolio, {firstName}.
        </h1>
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {quickActions.map((item) => {
          const actionLabel = item.count > 0 ? "Atualizar" : "Adicionar";

          return (
            <Link key={item.label} href={item.href} className="group block">
              <Card className="rounded-[28px] border-neutral-200 transition hover:-translate-y-0.5 hover:shadow-md">
                <CardContent className="space-y-5 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-700">
                      <item.icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-semibold text-neutral-700">
                      {item.count}
                    </span>
                  </div>

                  <div>
                    <p className="text-lg font-semibold text-neutral-950">{item.label}</p>
                    <p className="mt-2 text-sm text-neutral-500">
                      {item.count > 0 ? "Revisar agora" : "Ainda vazio"}
                    </p>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-semibold text-neutral-800">{actionLabel}</span>
                    <span className="text-sm text-neutral-400 transition group-hover:translate-x-0.5">
                      Abrir
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </section>
    </div>
  );
}
