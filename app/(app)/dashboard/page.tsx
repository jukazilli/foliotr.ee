import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import {
  UserCircle,
  Layers,
  Globe,
  CheckCircle2,
  Circle,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

// Mock de progresso — em produção, buscar do banco
const mockProgress = {
  profileFilled: false,
  versionCreated: false,
  pagePublished: false,
};

const quickActions = [
  {
    title: "Complete seu perfil",
    description: "Adicione experiências, habilidades e projetos.",
    href: "/profile",
    icon: UserCircle,
    cta: "Ir para o perfil",
    accent: "bg-blue-50 border-blue-100",
    iconClass: "text-blue-500",
  },
  {
    title: "Criar uma versão",
    description: "Adapte sua apresentação para cada oportunidade.",
    href: "/versions/new",
    icon: Layers,
    cta: "Nova versão",
    accent: "bg-violet-50 border-violet-100",
    iconClass: "text-violet-500",
  },
  {
    title: "Publicar sua página",
    description: "Coloque sua página pública no ar.",
    href: "/pages",
    icon: Globe,
    cta: "Ver páginas",
    accent: "bg-lime-50 border-lime-100",
    iconClass: "text-lime-600",
  },
];

const checklistItems = [
  {
    label: "Perfil preenchido",
    description: "Nome, bio, experiências e habilidades",
    done: mockProgress.profileFilled,
    href: "/profile",
  },
  {
    label: "Versão criada",
    description: "Sua primeira versão de apresentação",
    done: mockProgress.versionCreated,
    href: "/versions",
  },
  {
    label: "Página publicada",
    description: "Sua presença pública no ar",
    done: mockProgress.pagePublished,
    href: "/pages",
  },
];

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = session.user as typeof session.user & { username?: string };
  const firstName = user.name?.split(" ")[0] ?? "profissional";
  const completedSteps = checklistItems.filter((i) => i.done).length;
  const totalSteps = checklistItems.length;

  return (
    <div className="max-w-4xl space-y-10">
      {/* Cabeçalho */}
      <div>
        <h1 className="font-display text-3xl font-bold text-neutral-900">
          Olá, {firstName}!
        </h1>
        <p className="mt-1 text-neutral-500">
          Vamos construir sua presença profissional.
        </p>
      </div>

      {/* Ações rápidas */}
      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-400 mb-4">
          Ações rápidas
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link key={action.href} href={action.href} className="group block">
                <Card
                  className={`h-full border transition-shadow hover:shadow-md ${action.accent}`}
                >
                  <CardContent className="pt-6 space-y-4">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm ${action.iconClass}`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-neutral-900">
                        {action.title}
                      </h3>
                      <p className="mt-1 text-sm text-neutral-500">
                        {action.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-sm font-medium text-neutral-700 group-hover:gap-2 transition-all">
                      {action.cta}
                      <ArrowRight className="h-3.5 w-3.5" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Checklist de onboarding */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-400">
            Próximos passos
          </h2>
          <span className="text-sm text-neutral-500">
            {completedSteps}/{totalSteps} concluídos
          </span>
        </div>

        {/* Barra de progresso */}
        <div className="mb-6 h-1.5 w-full rounded-full bg-neutral-200 overflow-hidden">
          <div
            className="h-full rounded-full bg-lime-500 transition-all"
            style={{ width: `${(completedSteps / totalSteps) * 100}%` }}
          />
        </div>

        <Card>
          <CardContent className="pt-6 divide-y divide-[rgba(15,17,21,0.06)]">
            {checklistItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-4 py-4 first:pt-0 last:pb-0 group hover:opacity-80 transition-opacity ${
                  item.done ? "opacity-60" : ""
                }`}
              >
                {item.done ? (
                  <CheckCircle2 className="h-5 w-5 text-lime-500 shrink-0" />
                ) : (
                  <Circle className="h-5 w-5 text-neutral-300 shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm font-medium ${
                      item.done
                        ? "line-through text-neutral-400"
                        : "text-neutral-900"
                    }`}
                  >
                    {item.label}
                  </p>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    {item.description}
                  </p>
                </div>
                {!item.done && (
                  <ArrowRight className="h-4 w-4 text-neutral-300 group-hover:text-neutral-500 transition-colors shrink-0" />
                )}
              </Link>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
