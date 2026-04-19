import type { ResumeConfig } from "@/generated/prisma-client";
import type { ProfileForBlocks, VersionForBlocks } from "@/components/blocks/types";
import type { RenderablePageBlock } from "@/components/templates/types";
import { resolveTemplateResumeProjection } from "@/lib/templates/resume/resolver";

interface ResumeViewProps {
  templateSlug: string;
  blocks: RenderablePageBlock[];
  profile: ProfileForBlocks;
  version?: VersionForBlocks | null;
  config?: ResumeConfig | null;
}

export default function ResumeView({
  templateSlug,
  blocks,
  profile,
  version,
  config,
}: ResumeViewProps) {
  const projection = resolveTemplateResumeProjection({
    templateSlug,
    blocks,
    profile,
    version,
    config,
  });

  return (
    <div
      className="rounded-[28px] border px-6 py-6 print:rounded-none print:border-0 print:px-0 print:py-0 sm:px-8"
      style={{
        background: projection.theme.background,
        borderColor: projection.theme.border,
        color: projection.theme.ink,
        fontFamily: projection.theme.fontFamily,
      }}
    >
      <header className="border-b pb-6 print:pb-4" style={{ borderColor: projection.theme.border }}>
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p
              className="text-[11px] font-semibold uppercase tracking-[0.24em]"
              style={{ color: projection.theme.accent }}
            >
              Curriculo derivado do template
            </p>
            <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-[2.55rem]">
              {projection.header.displayName}
            </h1>
            {projection.header.headline ? (
              <p className="mt-2 text-base font-medium sm:text-lg" style={{ color: projection.theme.muted }}>
                {projection.header.headline}
              </p>
            ) : null}
          </div>

          {projection.showPhoto && projection.header.avatarUrl ? (
            <img
              src={projection.header.avatarUrl}
              alt={projection.header.displayName}
              className="h-20 w-20 rounded-[28px] object-cover print:hidden"
            />
          ) : null}
        </div>

        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm" style={{ color: projection.theme.muted }}>
          {projection.header.location ? <span>{projection.header.location}</span> : null}
          {projection.header.publicEmail ? <span>{projection.header.publicEmail}</span> : null}
          {projection.header.phone ? <span>{projection.header.phone}</span> : null}
          {projection.showLinks
            ? projection.header.links.slice(0, 4).map((link) => (
                <a
                  key={`${link.kind}-${link.label}-${link.href}`}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-opacity hover:opacity-80"
                  style={{ color: projection.theme.accent }}
                >
                  {link.label}
                </a>
              ))
            : null}
        </div>
      </header>

      <div className="mt-8 space-y-8 print:mt-6 print:space-y-6">
        {projection.sections.map((section) => {
          if (section.key === "summary") {
            return (
              <SectionShell key={section.key} title={section.title} accent={projection.theme.accent} border={projection.theme.border}>
                <p className="whitespace-pre-line text-sm leading-7 sm:text-[15px]" style={{ color: projection.theme.ink }}>
                  {section.body}
                </p>
              </SectionShell>
            );
          }

          if (section.key === "experience") {
            return (
              <SectionShell key={section.key} title={section.title} accent={projection.theme.accent} border={projection.theme.border}>
                <div className="space-y-5">
                  {section.items.map((item) => (
                    <article key={item.id} className="grid gap-2 sm:grid-cols-[1fr_auto] sm:gap-3">
                      <div>
                        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                          <h3 className="text-base font-semibold">{item.role}</h3>
                          <span className="text-sm" style={{ color: projection.theme.muted }}>
                            {item.company}
                          </span>
                          {item.current ? (
                            <span
                              className="rounded-full px-2 py-0.5 text-[11px] font-semibold"
                              style={{
                                background: `${projection.theme.accent}18`,
                                color: projection.theme.accent,
                              }}
                            >
                              Atual
                            </span>
                          ) : null}
                        </div>
                        {item.description ? (
                          <p className="mt-2 whitespace-pre-line text-sm leading-6" style={{ color: projection.theme.muted }}>
                            {item.description}
                          </p>
                        ) : null}
                      </div>
                      <div className="text-sm sm:text-right" style={{ color: projection.theme.muted }}>
                        <p>{item.period}</p>
                        {item.location ? <p>{item.location}</p> : null}
                      </div>
                    </article>
                  ))}
                </div>
              </SectionShell>
            );
          }

          if (section.key === "projects") {
            return (
              <SectionShell key={section.key} title={section.title} accent={projection.theme.accent} border={projection.theme.border}>
                <div className="space-y-4">
                  {section.items.map((item) => (
                    <article key={item.id} className="space-y-1">
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <h3 className="text-base font-semibold">{item.title}</h3>
                        {item.href ? (
                          <a
                            href={item.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm transition-opacity hover:opacity-80"
                            style={{ color: projection.theme.accent }}
                          >
                            {item.href}
                          </a>
                        ) : null}
                      </div>
                      {item.description ? (
                        <p className="text-sm leading-6" style={{ color: projection.theme.muted }}>
                          {item.description}
                        </p>
                      ) : null}
                      {item.tags.length > 0 ? (
                        <p className="text-xs uppercase tracking-[0.16em]" style={{ color: projection.theme.muted }}>
                          {item.tags.join(" · ")}
                        </p>
                      ) : null}
                    </article>
                  ))}
                </div>
              </SectionShell>
            );
          }

          if (section.key === "highlights") {
            return (
              <SectionShell key={section.key} title={section.title} accent={projection.theme.accent} border={projection.theme.border}>
                <div className="grid gap-3 sm:grid-cols-2">
                  {section.items.map((item) => (
                    <article
                      key={item.id}
                      className="rounded-[20px] border bg-white/72 px-4 py-4 print:bg-transparent"
                      style={{ borderColor: projection.theme.border }}
                    >
                      <h3 className="text-sm font-semibold">{item.title}</h3>
                      {item.metric ? (
                        <p className="mt-2 text-sm font-semibold" style={{ color: projection.theme.accent }}>
                          {item.metric}
                        </p>
                      ) : null}
                      {item.description ? (
                        <p className="mt-2 text-sm leading-6" style={{ color: projection.theme.muted }}>
                          {item.description}
                        </p>
                      ) : null}
                    </article>
                  ))}
                </div>
              </SectionShell>
            );
          }

          if (section.key === "skills") {
            return (
              <SectionShell key={section.key} title={section.title} accent={projection.theme.accent} border={projection.theme.border}>
                <div className="space-y-3">
                  {section.groups.map((group) => (
                    <div key={group.category} className="grid gap-1 sm:grid-cols-[140px_1fr]">
                      <p className="text-sm font-semibold">{group.category}</p>
                      <p className="text-sm leading-6" style={{ color: projection.theme.muted }}>
                        {group.items.join(", ")}
                      </p>
                    </div>
                  ))}
                </div>
              </SectionShell>
            );
          }

          return (
            <SectionShell key={section.key} title={section.title} accent={projection.theme.accent} border={projection.theme.border}>
              <div className="grid gap-3 sm:grid-cols-2">
                {section.items.map((item) => (
                  <a
                    key={`${item.kind}-${item.label}-${item.href}`}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-[20px] border bg-white/72 px-4 py-3 text-sm transition hover:bg-white print:bg-transparent"
                    style={{ borderColor: projection.theme.border }}
                  >
                    <p className="font-semibold">{item.label}</p>
                    <p className="mt-1 break-all text-xs uppercase tracking-[0.12em]" style={{ color: projection.theme.muted }}>
                      {item.kind}
                    </p>
                  </a>
                ))}
              </div>
            </SectionShell>
          );
        })}
      </div>
    </div>
  );
}

function SectionShell({
  title,
  accent,
  border,
  children,
}: {
  title: string;
  accent: string;
  border: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="flex items-center gap-3">
        <h2
          className="font-display text-xs font-semibold uppercase tracking-[0.26em]"
          style={{ color: accent }}
        >
          {title}
        </h2>
        <div className="h-px flex-1" style={{ background: border }} />
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}
