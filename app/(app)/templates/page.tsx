import Link from "next/link";
import { ArrowRight, SlidersHorizontal } from "lucide-react";
import { EmptyWorkspaceState, PageIntro } from "@/components/app/primitives";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { listCanonicalTemplates } from "@/lib/server/domain/canonical-templates";

type TemplatesSearchParams = {
  category?: string;
  sort?: string;
};

function buildTemplatesHref(params: TemplatesSearchParams) {
  const query = new URLSearchParams();

  if (params.category && params.category !== "all") {
    query.set("category", params.category);
  }

  if (params.sort && params.sort !== "curated") {
    query.set("sort", params.sort);
  }

  const qs = query.toString();
  return qs ? `/templates?${qs}` : "/templates";
}

export default async function TemplatesPage({
  searchParams,
}: {
  searchParams: Promise<TemplatesSearchParams>;
}) {
  const params = await searchParams;
  const templates = await listCanonicalTemplates(prisma);

  const categoryOptions = [
    "all",
    ...Array.from(new Set(templates.map((template) => template.category.toLowerCase()))),
  ];
  const selectedCategory = categoryOptions.includes((params.category ?? "all").toLowerCase())
    ? (params.category ?? "all").toLowerCase()
    : "all";
  const selectedSort = params.sort === "name" ? "name" : "curated";

  const filteredTemplates = templates
    .filter((template) =>
      selectedCategory === "all" ? true : template.category.toLowerCase() === selectedCategory
    )
    .sort((left, right) => {
      if (selectedSort === "name") {
        return left.name.localeCompare(right.name);
      }

      return left.libraryStatus.localeCompare(right.libraryStatus);
    });

  return (
    <div className="space-y-8">
      <PageIntro
        eyebrow="Modelos"
        title="Biblioteca de modelos"
        description="Escolha um modelo para usar."
        meta={
          <>
            <Badge variant="success">{templates.length} modelos</Badge>
            <Badge variant="default">Disponiveis</Badge>
          </>
        }
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button asChild variant="outline">
              <Link href="/versions">Ver versoes</Link>
            </Button>
            <Button asChild variant="ghost">
              <Link href="/profile">Completar perfil</Link>
            </Button>
          </div>
        }
      />

      <section className="rounded-[30px] border border-lime-100 bg-white/85 p-4 sm:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="font-data text-[11px] font-semibold uppercase tracking-[0.24em] text-neutral-400">
              Filtros
            </p>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-neutral-600">
              Filtre e ordene os modelos.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex flex-wrap rounded-full border border-neutral-200 bg-neutral-100 p-1">
              {categoryOptions.map((category) => {
                const isActive = category === selectedCategory;
                return (
                  <Link
                    key={category}
                    href={buildTemplatesHref({ category, sort: selectedSort })}
                    className={`rounded-full px-3 py-1.5 text-sm font-semibold transition ${
                      isActive
                        ? "bg-green-500 text-green-900"
                        : "text-neutral-600 hover:bg-white hover:text-neutral-900"
                    }`}
                  >
                    {category === "all" ? "Todos" : category}
                  </Link>
                );
              })}
            </div>

            <div className="flex items-center rounded-full border border-neutral-200 bg-neutral-100 p-1 text-sm font-semibold">
              <SlidersHorizontal className="ml-2 mr-1 h-4 w-4 text-neutral-500" aria-hidden="true" />
              {[
                { key: "curated", label: "Destaque" },
                { key: "name", label: "Nome" },
              ].map((option) => {
                const isActive = option.key === selectedSort;
                return (
                  <Link
                    key={option.key}
                    href={buildTemplatesHref({
                      category: selectedCategory,
                      sort: option.key,
                    })}
                    className={`rounded-full px-3 py-1.5 transition ${
                      isActive
                        ? "bg-white text-neutral-900 shadow-sm"
                        : "text-neutral-600 hover:text-neutral-900"
                    }`}
                  >
                    {option.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {filteredTemplates.length === 0 ? (
        <EmptyWorkspaceState
          title="Nenhum modelo encontrado"
          description="Tente outro filtro."
          primaryAction={{ href: "/templates", label: "Ver todos" }}
          secondaryAction={{ href: "/profile", label: "Voltar ao perfil" }}
          accent="lime"
          label="Sem resultados"
        />
      ) : (
        <section className="grid gap-6 xl:grid-cols-2">
          {filteredTemplates.map((template) => {
            return (
              <Link key={template.slug} href={template.detailHref} className="group block">
                <Card className="overflow-hidden rounded-[32px] border border-neutral-200 bg-white transition-all hover:-translate-y-0.5 hover:shadow-xl">
                  <div className="relative aspect-[16/10] overflow-hidden bg-[#FBF8CC]">
                    <img
                      src={template.coverUrl}
                      alt={template.name}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]"
                    />
                  </div>

                  <CardContent className="flex justify-end p-5">
                    <span className="inline-flex items-center gap-2 rounded-full bg-neutral-950 px-5 py-2.5 text-sm font-semibold text-white transition group-hover:bg-lime-500 group-hover:text-neutral-950">
                      Ver detalhes
                      <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" aria-hidden="true" />
                    </span>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </section>
      )}
    </div>
  );
}
