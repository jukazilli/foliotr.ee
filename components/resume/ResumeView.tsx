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
      className="mx-auto w-full max-w-4xl overflow-hidden rounded-[24px] border px-4 py-5 print:max-w-none print:overflow-visible print:rounded-none print:border-0 print:px-0 print:py-0 sm:rounded-[28px] sm:px-6 sm:py-6 md:px-8"
      style={{
        background: projection.theme.background,
        borderColor: projection.theme.border,
        color: projection.theme.ink,
        fontFamily: projection.theme.fontFamily,
      }}
    >
      <header className="min-w-0 border-b pb-6 print:pb-4" style={{ borderColor: projection.theme.border }}>
        <div className="flex min-w-0 flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            {projection.header.displayName ? (
              <h1 className="overflow-wrap-anywhere font-display text-3xl font-semibold tracking-tight sm:text-[2.55rem]">
                {projection.header.displayName}
              </h1>
            ) : null}
            {projection.header.headline ? (
              <p className="mt-2 overflow-wrap-anywhere text-base font-medium leading-7 sm:text-lg" style={{ color: projection.theme.muted }}>
                {projection.header.headline}
              </p>
            ) : null}
          </div>

          {projection.showPhoto && projection.header.avatarUrl ? (
            <img
              src={projection.header.avatarUrl}
              alt=""
              className="h-20 w-20 rounded-[28px] object-cover print:hidden"
            />
          ) : null}
        </div>

        <div className="mt-4 flex min-w-0 flex-wrap gap-x-4 gap-y-2 text-sm" style={{ color: projection.theme.muted }}>
          {projection.header.location ? <span className="overflow-wrap-anywhere">{projection.header.location}</span> : null}
          {projection.header.publicEmail ? <span className="overflow-wrap-anywhere">{projection.header.publicEmail}</span> : null}
          {projection.header.phone ? <span className="overflow-wrap-anywhere">{projection.header.phone}</span> : null}
          {projection.showLinks
            ? projection.header.links.slice(0, 4).map((link) => (
                <a
                  key={`${link.kind}-${link.label}-${link.href}`}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="max-w-full overflow-wrap-anywhere transition-opacity hover:opacity-80"
                  style={{ color: projection.theme.accent }}
                >
                  {link.label}
                </a>
              ))
            : null}
        </div>
      </header>

      <div className="mt-8 min-w-0 space-y-8 print:mt-6 print:space-y-6">
        {projection.sections.map((section) => {
          if (section.key === "summary") {
            return (
              <SectionShell key={section.key} title={section.title} accent={projection.theme.accent} border={projection.theme.border}>
                <p className="overflow-wrap-anywhere whitespace-pre-line text-sm leading-7 sm:text-[15px]" style={{ color: projection.theme.ink }}>
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
                    <article key={item.id} className="grid min-w-0 gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                          <h3 className="overflow-wrap-anywhere text-base font-semibold">{item.role}</h3>
                          <span className="overflow-wrap-anywhere text-sm" style={{ color: projection.theme.muted }}>
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
                          <p className="mt-2 overflow-wrap-anywhere whitespace-pre-line text-sm leading-6" style={{ color: projection.theme.muted }}>
                            {item.description}
                          </p>
                        ) : null}
                      </div>
                      <div className="overflow-wrap-anywhere text-sm sm:text-right" style={{ color: projection.theme.muted }}>
                        <p>{item.period}</p>
                        {item.location ? <p>{item.location}</p> : null}
                      </div>
                    </article>
                  ))}
                </div>
              </SectionShell>
            );
          }

          if (section.key === "education") {
            return (
              <SectionShell key={section.key} title={section.title} accent={projection.theme.accent} border={projection.theme.border}>
                <div className="space-y-5">
                  {section.items.map((item) => (
                    <article key={item.id} className="grid min-w-0 gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                          <h3 className="overflow-wrap-anywhere text-base font-semibold">
                            {[item.degree, item.field].filter(Boolean).join(" - ") ||
                              item.institution}
                          </h3>
                          <span className="overflow-wrap-anywhere text-sm" style={{ color: projection.theme.muted }}>
                            {item.institution}
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
                          <p className="mt-2 overflow-wrap-anywhere whitespace-pre-line text-sm leading-6" style={{ color: projection.theme.muted }}>
                            {item.description}
                          </p>
                        ) : null}
                      </div>
                      <div className="overflow-wrap-anywhere text-sm sm:text-right" style={{ color: projection.theme.muted }}>
                        <p>{item.period}</p>
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
                    <article key={item.id} className="min-w-0 space-y-1">
                      <div className="flex min-w-0 flex-col gap-1 sm:flex-row sm:flex-wrap sm:items-baseline sm:justify-between sm:gap-2">
                        <h3 className="overflow-wrap-anywhere text-base font-semibold">{item.title}</h3>
                        {item.href ? (
                          <a
                            href={item.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="max-w-full break-all text-sm transition-opacity hover:opacity-80 sm:max-w-[55%]"
                            style={{ color: projection.theme.accent }}
                          >
                            {item.href}
                          </a>
                        ) : null}
                      </div>
                      {item.description ? (
                        <p className="overflow-wrap-anywhere text-sm leading-6" style={{ color: projection.theme.muted }}>
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
                      className="min-w-0 rounded-[20px] border bg-white/72 px-4 py-4 print:bg-transparent"
                      style={{ borderColor: projection.theme.border }}
                    >
                      <h3 className="overflow-wrap-anywhere text-sm font-semibold">{item.title}</h3>
                      {item.metric ? (
                        <p className="mt-2 text-sm font-semibold" style={{ color: projection.theme.accent }}>
                          {item.metric}
                        </p>
                      ) : null}
                      {item.description ? (
                        <p className="mt-2 overflow-wrap-anywhere text-sm leading-6" style={{ color: projection.theme.muted }}>
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
                    <div key={group.category} className="grid min-w-0 gap-1 sm:grid-cols-[minmax(110px,140px)_minmax(0,1fr)]">
                      <p className="overflow-wrap-anywhere text-sm font-semibold">{group.category}</p>
                      <p className="overflow-wrap-anywhere text-sm leading-6" style={{ color: projection.theme.muted }}>
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
                    className="min-w-0 rounded-[20px] border bg-white/72 px-4 py-3 text-sm transition hover:bg-white print:bg-transparent"
                    style={{ borderColor: projection.theme.border }}
                  >
                    <p className="overflow-wrap-anywhere font-semibold">{item.label}</p>
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
    <section className="min-w-0">
      <div className="flex min-w-0 items-center gap-3">
        <h2
          className="shrink-0 font-display text-[11px] font-semibold uppercase tracking-[0.18em] sm:text-xs sm:tracking-[0.26em]"
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
