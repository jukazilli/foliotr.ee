import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Plus, Globe, Eye, EyeOff, ExternalLink, MoreHorizontal } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Mock de páginas — em produção, buscar do banco
const mockPages: {
  id: string;
  title: string;
  slug: string;
  versionName: string;
  status: "draft" | "published";
  template: string;
  updatedAt: string;
  views: number;
}[] = [];

export default async function PagesPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = session.user as typeof session.user & { username?: string };
  const hasPages = mockPages.length > 0;

  return (
    <div className="max-w-4xl space-y-8">
      {/* Cabeçalho */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-neutral-900">
            Páginas
          </h1>
          <p className="mt-2 text-neutral-500 max-w-md">
            Sua presença pública. Cada versão pode ter uma página com um
            template visual.
          </p>
        </div>
        <Button variant="primary">
          <Plus className="h-4 w-4" />
          Nova página
        </Button>
      </div>

      {hasPages ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {mockPages.map((page) => (
            <Card key={page.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <CardTitle>{page.title}</CardTitle>
                      <Badge
                        variant={page.status === "published" ? "success" : "default"}
                      >
                        {page.status === "published" ? (
                          <>
                            <Eye className="mr-1 h-2.5 w-2.5" />
                            Publicada
                          </>
                        ) : (
                          <>
                            <EyeOff className="mr-1 h-2.5 w-2.5" />
                            Rascunho
                          </>
                        )}
                      </Badge>
                    </div>
                    <CardDescription>
                      Versão: {page.versionName} · {page.template}
                    </CardDescription>
                  </div>
                  <button className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600">
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-1 text-xs text-neutral-400 font-mono mb-4">
                  <Globe className="h-3 w-3" />
                  foliotr.ee/{user.username ?? "..."}/{page.slug}
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    Editar
                  </Button>
                  {page.status === "published" && (
                    <Button variant="ghost" size="sm" asChild>
                      <Link
                        href={`https://foliotr.ee/${user.username}/${page.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        Ver
                      </Link>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center py-12 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-lime-100 mb-4">
                <Globe className="h-8 w-8 text-lime-600" />
              </div>
              <h3 className="font-semibold text-neutral-900">
                Nenhuma página ainda
              </h3>
              <p className="mt-2 text-sm text-neutral-500 max-w-xs">
                Crie uma página pública e compartilhe sua história profissional
                de forma elegante.
              </p>
              <Button variant="primary" className="mt-6">
                <Plus className="h-4 w-4" />
                Criar primeira página
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Explicação */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          {
            step: "1",
            title: "Escolha uma versão",
            desc: "Cada página é baseada em uma versão do seu perfil.",
          },
          {
            step: "2",
            title: "Selecione um template",
            desc: "Templates modernos e personalizáveis para seu estilo.",
          },
          {
            step: "3",
            title: "Publique e compartilhe",
            desc: "Sua URL exclusiva em foliotr.ee/seu-username.",
          },
        ].map((item) => (
          <div key={item.step} className="text-center">
            <div className="mx-auto mb-3 flex h-8 w-8 items-center justify-center rounded-full bg-neutral-200 text-sm font-bold text-neutral-600">
              {item.step}
            </div>
            <p className="text-sm font-medium text-neutral-800">{item.title}</p>
            <p className="mt-1 text-xs text-neutral-500">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
