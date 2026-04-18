import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Plus, Layers, MoreHorizontal, Star } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Mock de versões — em produção, buscar do banco
const mockVersions = [
  {
    id: "v1",
    name: "Versão Principal",
    description: "Apresentação geral, para a maioria das vagas",
    context: "Geral",
    emoji: "⭐",
    isDefault: true,
    createdAt: "2024-01-10",
    experiencesCount: 0,
  },
];

export default async function VersionsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const hasVersions = mockVersions.length > 0;

  return (
    <div className="max-w-3xl space-y-8">
      {/* Cabeçalho */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-neutral-900">
            Versões
          </h1>
          <p className="mt-2 text-neutral-500 max-w-md">
            Adapte sua apresentação para cada contexto. Cada versão usa a mesma
            base, mas conta histórias diferentes.
          </p>
        </div>
        <Button variant="primary" asChild>
          <Link href="/versions/new">
            <Plus className="h-4 w-4" />
            Nova versão
          </Link>
        </Button>
      </div>

      {hasVersions ? (
        <div className="space-y-4">
          {mockVersions.map((version) => (
            <Card
              key={version.id}
              className="hover:shadow-md transition-shadow"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-100 text-xl">
                      {version.emoji}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <CardTitle>{version.name}</CardTitle>
                        {version.isDefault && (
                          <Badge variant="version">
                            <Star className="mr-1 h-2.5 w-2.5" />
                            Principal
                          </Badge>
                        )}
                      </div>
                      <CardDescription>{version.description}</CardDescription>
                    </div>
                  </div>
                  <button className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 transition-colors">
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-neutral-400">
                    Contexto: <span className="text-neutral-600">{version.context}</span>
                  </span>
                  <span className="text-xs text-neutral-400">
                    {version.experiencesCount} experiências selecionadas
                  </span>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    Editar versão
                  </Button>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/pages">Ver página</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center py-12 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-100 mb-4">
                <Layers className="h-8 w-8 text-violet-500" />
              </div>
              <h3 className="font-semibold text-neutral-900">
                Nenhuma versão ainda
              </h3>
              <p className="mt-2 text-sm text-neutral-500 max-w-xs">
                Crie sua primeira versão e comece a adaptar sua apresentação
                para diferentes contextos.
              </p>
              <Button variant="primary" className="mt-6" asChild>
                <Link href="/versions/new">
                  <Plus className="h-4 w-4" />
                  Criar primeira versão
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info card */}
      <Card className="bg-neutral-50 border-neutral-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Layers className="h-5 w-5 text-neutral-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-neutral-700">
                Como funcionam as versões?
              </p>
              <p className="mt-1 text-sm text-neutral-500">
                Cada versão seleciona e reordena experiências do seu perfil base,
                podendo ter um headline e bio personalizados. Uma versão pode
                virar uma página pública ou um currículo PDF.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
