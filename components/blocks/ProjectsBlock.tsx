import { ExternalLink, Github, ImageIcon } from "lucide-react";
import { truncate } from "@/lib/utils";
import type { BlockProps } from "./types";

interface ProjectsConfig {
  title?: string;
  layout?: "grid" | "list";
  maxItems?: number;
  showImages?: boolean;
}

export default function ProjectsBlock({ profile, config, version }: BlockProps) {
  const {
    title = "Projetos",
    layout = "grid",
    maxItems,
    showImages = true,
  } = config as ProjectsConfig;

  let projects = profile.projects;

  // Filter by version selectedProjectIds if present
  if (version?.selectedProjectIds?.length) {
    projects = projects.filter((p) => version.selectedProjectIds.includes(p.id));
  }

  projects = [...projects].sort((a, b) => {
    if (a.featured !== b.featured) return b.featured ? 1 : -1;
    return a.order - b.order;
  });

  if (maxItems) projects = projects.slice(0, maxItems);

  if (projects.length === 0) return null;

  return (
    <section className="bg-white py-12">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <h2 className="font-display text-xl font-bold text-neutral-900">{title}</h2>
        <div className="mt-1 h-0.5 w-10 rounded-full bg-lime-500" />

        {layout === "grid" ? (
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
            {projects.map((project) => (
              <div
                key={project.id}
                className="group rounded-2xl border border-neutral-100 bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Image / placeholder */}
                {showImages && (
                  <div className="relative h-40 w-full overflow-hidden bg-neutral-100">
                    {project.imageUrl ? (
                      <img
                        src={project.imageUrl}
                        alt={project.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-gradient-to-br from-neutral-100 to-neutral-200">
                        <ImageIcon size={32} className="text-neutral-300" />
                      </div>
                    )}
                  </div>
                )}

                <div className="p-5">
                  <h3 className="font-display text-base font-bold text-neutral-900">
                    {project.title}
                  </h3>

                  {project.description && (
                    <p className="mt-1.5 text-sm leading-6 text-neutral-500">
                      {truncate(project.description, 120)}
                    </p>
                  )}

                  {project.tags?.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {project.tags.map((tag: string) => (
                        <span
                          key={tag}
                          className="rounded-md bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-600"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="mt-4 flex items-center gap-3">
                    {project.url && (
                      <a
                        href={project.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors"
                      >
                        <ExternalLink size={12} />
                        Ver projeto
                      </a>
                    )}
                    {project.repoUrl && (
                      <a
                        href={project.repoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-medium text-neutral-500 hover:text-neutral-700 transition-colors"
                      >
                        <Github size={12} />
                        Repositório
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-6 flex flex-col divide-y divide-neutral-100">
            {projects.map((project) => (
              <div key={project.id} className="flex gap-4 py-5">
                {showImages && project.imageUrl && (
                  <img
                    src={project.imageUrl}
                    alt={project.title}
                    className="h-16 w-16 flex-shrink-0 rounded-lg object-cover border border-neutral-100"
                  />
                )}

                <div className="flex-1 min-w-0">
                  <h3 className="font-display text-base font-semibold text-neutral-900">
                    {project.title}
                  </h3>
                  {project.description && (
                    <p className="mt-1 text-sm text-neutral-500 leading-6">
                      {truncate(project.description, 180)}
                    </p>
                  )}
                  {project.tags?.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {project.tags.map((tag: string) => (
                        <span
                          key={tag}
                          className="rounded-md bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-600"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="mt-2 flex items-center gap-3">
                    {project.url && (
                      <a
                        href={project.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700"
                      >
                        <ExternalLink size={12} />
                        Ver projeto
                      </a>
                    )}
                    {project.repoUrl && (
                      <a
                        href={project.repoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-medium text-neutral-500 hover:text-neutral-700"
                      >
                        <Github size={12} />
                        Repositório
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
