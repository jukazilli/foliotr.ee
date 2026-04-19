import type { BlockProps } from "./types";

interface SkillsConfig {
  title?: string;
  layout?: "tags" | "grid" | "list";
  showLevel?: boolean;
  showCategory?: boolean;
}

const LEVEL_LABELS: Record<string, string> = {
  beginner: "Iniciante",
  intermediate: "Intermediário",
  advanced: "Avançado",
  expert: "Especialista",
};

export default function SkillsBlock({ profile, config, version }: BlockProps) {
  const {
    title = "Habilidades",
    layout = "tags",
    showLevel = false,
    showCategory = true,
  } = config as SkillsConfig;

  let skills = profile.skills;

  // Filter by version selectedSkillIds if present
  if (version?.selectedSkillIds?.length) {
    skills = skills.filter((s) => version.selectedSkillIds.includes(s.id));
  }

  skills = [...skills].sort((a, b) => a.order - b.order);

  if (skills.length === 0) return null;

  // Group by category
  const grouped = skills.reduce<Record<string, typeof skills>>((acc, skill) => {
    const cat = skill.category ?? "Geral";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(skill);
    return acc;
  }, {});

  const categories = Object.entries(grouped);

  return (
    <section className="bg-white py-12">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <h2 className="font-display text-xl font-bold text-neutral-900">{title}</h2>
        <div className="mt-1 h-0.5 w-10 rounded-full bg-lime-500" />

        <div className="mt-6 flex flex-col gap-6">
          {categories.map(([category, items]) => (
            <div key={category}>
              {showCategory && categories.length > 1 && (
                <h3 className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-neutral-400">
                  {category}
                </h3>
              )}

              {layout === "tags" && (
                <div className="flex flex-wrap gap-2">
                  {items.map((skill) => (
                    <span
                      key={skill.id}
                      className="rounded-lg bg-neutral-100 px-3 py-1.5 text-sm font-medium text-neutral-700"
                    >
                      {skill.name}
                      {showLevel && skill.level && (
                        <span className="ml-1.5 text-xs text-neutral-400">
                          · {LEVEL_LABELS[skill.level] ?? skill.level}
                        </span>
                      )}
                    </span>
                  ))}
                </div>
              )}

              {layout === "grid" && (
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                  {items.map((skill) => (
                    <div
                      key={skill.id}
                      className="rounded-lg border border-neutral-100 bg-neutral-50 px-3 py-2"
                    >
                      <span className="text-sm font-medium text-neutral-800">
                        {skill.name}
                      </span>
                      {showLevel && skill.level && (
                        <p className="mt-0.5 text-xs text-neutral-400">
                          {LEVEL_LABELS[skill.level] ?? skill.level}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {layout === "list" && (
                <ul className="space-y-1.5">
                  {items.map((skill) => (
                    <li
                      key={skill.id}
                      className="flex items-center gap-2 text-sm text-neutral-700"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-lime-500 flex-shrink-0" />
                      <span className="font-medium">{skill.name}</span>
                      {showLevel && skill.level && (
                        <span className="text-xs text-neutral-400">
                          {LEVEL_LABELS[skill.level] ?? skill.level}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
