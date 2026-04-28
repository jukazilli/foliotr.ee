import Link from "next/link";
import { ExternalLink, SlidersHorizontal } from "lucide-react";
import { EmptyWorkspaceState } from "@/components/app/primitives";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { getAppViewer, getOwnedVersions } from "@/lib/server/app-viewer";
import {
  evaluateTemplateEligibility,
  listCanonicalTemplates,
} from "@/lib/server/domain/canonical-templates";
import { getPrimaryVersionPage } from "@/lib/server/domain/includes";
import { useCanonicalTemplateAction } from "./actions";

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
  const [{ profile, user }, templates] = await Promise.all([
    getAppViewer(),
    listCanonicalTemplates(prisma),
  ]);
  const versions = await getOwnedVersions(user.id);
  const targetVersion =
    versions.find((version) => version.isDefault) ?? versions[0] ?? null;

  const categoryOptions = [
    "all",
    ...Array.from(
      new Set(templates.map((template) => template.category.toLowerCase()))
    ),
  ];
  const selectedCategory = categoryOptions.includes(
    (params.category ?? "all").toLowerCase()
  )
    ? (params.category ?? "all").toLowerCase()
    : "all";
  const selectedSort = params.sort === "name" ? "name" : "curated";

  const filteredTemplates = templates
    .filter((template) =>
      selectedCategory === "all"
        ? true
        : template.category.toLowerCase() === selectedCategory
    )
    .sort((left, right) => {
      if (selectedSort === "name") {
        return left.name.localeCompare(right.name);
      }

      return left.sortOrder - right.sortOrder || left.name.localeCompare(right.name);
    });

  return (
    <div className="space-y-5">
      <section className="flex flex-col gap-4 rounded-2xl border border-neutral-200 bg-white/95 px-4 py-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <h1 className="font-display text-xl font-semibold tracking-tight text-neutral-950">
            Escolha um modelo para o portfolio
          </h1>
          <p className="mt-1 text-sm font-semibold leading-6 text-neutral-600">
            O modelo cria a pagina tecnica e abre o editor do portfolio selecionado.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex flex-wrap rounded-lg border border-neutral-200 bg-neutral-100 p-1">
            {categoryOptions.map((category) => {
              const isActive = category === selectedCategory;
              return (
                <Link
                  key={category}
                  href={buildTemplatesHref({ category, sort: selectedSort })}
                  className={`rounded-md px-3 py-1.5 text-sm font-semibold transition ${
                    isActive
                      ? "bg-white text-neutral-950 shadow-sm"
                      : "text-neutral-600 hover:bg-white hover:text-neutral-950"
                  }`}
                >
                  {category === "all" ? "Todos" : category}
                </Link>
              );
            })}
          </div>

          <div className="flex items-center rounded-lg border border-neutral-200 bg-neutral-100 p-1 text-sm font-semibold">
            <SlidersHorizontal
              className="ml-2 mr-1 h-4 w-4 text-neutral-500"
              aria-hidden="true"
            />
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
                  className={`rounded-md px-3 py-1.5 transition ${
                    isActive
                      ? "bg-white text-neutral-950 shadow-sm"
                      : "text-neutral-600 hover:text-neutral-950"
                  }`}
                >
                  {option.label}
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {filteredTemplates.length === 0 ? (
        <EmptyWorkspaceState
          title="Nenhum modelo"
          description="Tente outro filtro."
          primaryAction={{ href: "/templates", label: "Ver todos" }}
          secondaryAction={{ href: "/profile", label: "Perfil" }}
          accent="lime"
          label="Biblioteca"
        />
      ) : (
        <section className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,22rem),24rem))] justify-start gap-4">
          {filteredTemplates.map((template) => {
            const eligibility = evaluateTemplateEligibility(
              template,
              profile,
              targetVersion
            );
            const page = targetVersion ? getPrimaryVersionPage(targetVersion) : null;
            const appliedPage = page?.template?.slug === template.slug ? page : null;
            const useAction = useCanonicalTemplateAction.bind(null, template.slug);
            const editDisabled = !targetVersion || !eligibility.eligible;

            return (
              <article
                key={template.slug}
                className="group overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-neutral-100">
                  {template.coverUrl ? (
                    <img
                      src={template.coverUrl}
                      alt={template.name}
                      className="h-full w-full object-contain object-center transition duration-500 group-hover:scale-[1.02]"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-[#FBF8CC]">
                      <span className="text-sm font-semibold text-neutral-500">
                        {template.name}
                      </span>
                    </div>
                  )}
                </div>

                <div className="space-y-4 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="truncate text-base font-semibold text-neutral-950">
                        {template.name}
                      </h2>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        <Badge variant="default">{template.category}</Badge>
                        {appliedPage ? <Badge variant="success">aplicado</Badge> : null}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {appliedPage ? (
                      <Button asChild>
                        <Link href={`/pages/${appliedPage.id}/editor`}>
                          Editar portfolio
                        </Link>
                      </Button>
                    ) : (
                      <form action={useAction}>
                        <input
                          type="hidden"
                          name="versionId"
                          value={targetVersion?.id ?? ""}
                        />
                        <Button
                          type="submit"
                          disabled={editDisabled}
                          className="w-full"
                        >
                          Usar modelo
                        </Button>
                      </form>
                    )}

                    <Button asChild variant="outline">
                      <Link
                        href={`/template-examples/${template.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="h-4 w-4" aria-hidden="true" />
                        Abrir exemplo
                      </Link>
                    </Button>
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      )}
    </div>
  );
}
