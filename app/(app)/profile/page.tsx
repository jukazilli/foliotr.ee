import { auth } from "@/auth";
import { redirect } from "next/navigation";
import {
  User,
  Briefcase,
  GraduationCap,
  Zap,
  FolderGit2,
  Trophy,
  Link2,
  Plus,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const PROFILE_SECTIONS = [
  {
    id: "identity",
    label: "Identidade",
    icon: User,
    description: "Nome, headline, bio, foto e localização",
    emptyLabel: "Complete suas informações básicas",
    items: [],
  },
  {
    id: "experience",
    label: "Experiências",
    icon: Briefcase,
    description: "Histórico profissional e cargos",
    emptyLabel: "Adicione sua primeira experiência profissional",
    items: [],
  },
  {
    id: "education",
    label: "Formação",
    icon: GraduationCap,
    description: "Cursos, graduações e certificações",
    emptyLabel: "Adicione sua formação acadêmica",
    items: [],
  },
  {
    id: "skills",
    label: "Habilidades",
    icon: Zap,
    description: "Tecnologias, ferramentas e competências",
    emptyLabel: "Adicione suas principais habilidades",
    items: [],
  },
  {
    id: "projects",
    label: "Projetos",
    icon: FolderGit2,
    description: "Projetos pessoais, open source e portfólio",
    emptyLabel: "Adicione projetos que você se orgulha",
    items: [],
  },
  {
    id: "achievements",
    label: "Conquistas",
    icon: Trophy,
    description: "Prêmios, reconhecimentos e marcos",
    emptyLabel: "Adicione conquistas relevantes",
    items: [],
  },
  {
    id: "links",
    label: "Links",
    icon: Link2,
    description: "GitHub, LinkedIn, portfolio e redes sociais",
    emptyLabel: "Adicione seus links profissionais",
    items: [],
  },
];

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = session.user as typeof session.user & { username?: string };
  const firstName = user.name?.split(" ")[0] ?? "você";

  return (
    <div className="max-w-3xl space-y-8">
      {/* Cabeçalho */}
      <div>
        <h1 className="font-display text-3xl font-bold text-neutral-900">
          Meu Perfil
        </h1>
        <p className="mt-2 text-neutral-500 max-w-lg">
          Esta é sua base central. Tudo que você adicionar aqui pode aparecer
          nas suas páginas e currículos.
        </p>
      </div>

      {/* Banner de boas-vindas se perfil vazio */}
      <Card className="border-blue-100 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500">
              <User className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-blue-900">
                Olá, {firstName}! Seu perfil está em branco.
              </p>
              <p className="mt-1 text-sm text-blue-700">
                Comece adicionando suas experiências profissionais. Quanto mais
                completo seu perfil, mais versões ricas você poderá criar.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Seções do perfil */}
      <div className="space-y-4">
        {PROFILE_SECTIONS.map((section) => {
          const Icon = section.icon;
          const hasItems = section.items.length > 0;

          return (
            <Card key={section.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-100">
                      <Icon className="h-4 w-4 text-neutral-600" />
                    </div>
                    <div>
                      <CardTitle>{section.label}</CardTitle>
                      <CardDescription>{section.description}</CardDescription>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Plus className="h-4 w-4" />
                    Adicionar
                  </Button>
                </div>
              </CardHeader>

              {!hasItems && (
                <CardContent>
                  <div className="rounded-xl border-2 border-dashed border-neutral-200 p-6 text-center">
                    <Icon className="mx-auto mb-2 h-8 w-8 text-neutral-300" />
                    <p className="text-sm text-neutral-400">
                      {section.emptyLabel}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-3"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Adicionar {section.label.toLowerCase()}
                    </Button>
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
