import type { ReactNode } from "react";
import type { ResumeConfig } from "@/generated/prisma-client";
import type { ProfileForBlocks, VersionForBlocks } from "@/components/blocks/types";
import type { RenderablePageBlock } from "@/components/templates/types";
import type { ResumeProjectionSection } from "@/lib/templates/resume/types";
import { resolveTemplateResumeProjection } from "@/lib/templates/resume/resolver";

function getLinkKindLabel(kind: string) {
  switch (kind) {
    case "contact":
      return "Contato";
    case "proof":
      return "Prova";
    case "link":
      return "Link";
    default:
      return kind;
  }
}

function getSection(
  sections: ResumeProjectionSection[],
  key: ResumeProjectionSection["key"]
) {
  return sections.find((section) => section.key === key) ?? null;
}

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
  const summarySection = getSection(projection.sections, "summary");
  const experienceSection = getSection(projection.sections, "experience");
  const projectsSection = getSection(projection.sections, "projects");
  const highlightsSection = getSection(projection.sections, "highlights");
  const skillsSection = getSection(projection.sections, "skills");
  const educationSection = getSection(projection.sections, "education");
  const linksSection = getSection(projection.sections, "links");
  const contactItems = [
    projection.header.location,
    projection.header.publicEmail,
    projection.header.phone,
  ].filter(Boolean);

  return (
    <article
      className="mx-auto w-full max-w-5xl overflow-hidden rounded-lg border bg-white print:max-w-none print:overflow-visible print:rounded-none print:border-0"
      style={{
        borderColor: projection.theme.border,
        color: projection.theme.ink,
        fontFamily: projection.theme.fontFamily,
      }}
    >
      <header
        className="grid min-w-0 gap-6 border-b px-5 py-6 sm:px-8 lg:grid-cols-[minmax(0,1fr)_16rem] lg:px-10 print:px-0 print:py-0 print:pb-5"
        style={{
          borderColor: projection.theme.border,
          background: projection.theme.background,
        }}
      >
        <div className="min-w-0">
          <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center">
            {projection.showPhoto && projection.header.avatarUrl ? (
              <img
                src={projection.header.avatarUrl}
                alt=""
                className="h-20 w-20 shrink-0 rounded-full border object-cover print:h-16 print:w-16"
                style={{ borderColor: projection.theme.border }}
              />
            ) : null}
            <div className="min-w-0">
              {projection.header.displayName ? (
                <h1 className="overflow-wrap-anywhere font-display text-4xl font-extrabold leading-none text-current sm:text-5xl print:text-3xl">
                  {projection.header.displayName}
                </h1>
              ) : null}
              {projection.header.headline ? (
                <p
                  className="mt-3 max-w-3xl overflow-wrap-anywhere text-base font-semibold leading-7 sm:text-lg print:text-sm"
                  style={{ color: projection.theme.muted }}
                >
                  {projection.header.headline}
                </p>
              ) : null}
            </div>
          </div>

          {summarySection?.key === "summary" ? (
            <p className="mt-6 max-w-3xl overflow-wrap-anywhere whitespace-pre-line text-sm leading-7 sm:text-[15px] print:mt-4 print:text-sm">
              {summarySection.body}
            </p>
          ) : null}
        </div>

        <aside className="min-w-0 lg:border-l lg:pl-6 print:border-l-0 print:pl-0">
          {contactItems.length > 0 ? (
            <div className="grid gap-2 text-sm font-medium">
              {contactItems.map((item) => (
                <span
                  key={item}
                  className="overflow-wrap-anywhere"
                  style={{ color: projection.theme.muted }}
                >
                  {item}
                </span>
              ))}
            </div>
          ) : null}

          {projection.showLinks && projection.header.links.length > 0 ? (
            <div className="mt-4 grid gap-2">
              {projection.header.links.slice(0, 4).map((link) => (
                <a
                  key={`${link.kind}-${link.label}-${link.href}`}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="max-w-full overflow-wrap-anywhere text-sm font-semibold transition-opacity hover:opacity-80"
                  style={{ color: projection.theme.accent }}
                >
                  {link.label}
                </a>
              ))}
            </div>
          ) : null}
        </aside>
      </header>

      <div className="grid min-w-0 gap-8 px-5 py-7 sm:px-8 lg:grid-cols-[minmax(0,1fr)_16rem] lg:px-10 print:grid-cols-[minmax(0,1fr)_13rem] print:gap-6 print:px-0 print:py-5">
        <main className="min-w-0 space-y-8 print:space-y-6">
          {experienceSection?.key === "experience" ? (
            <SectionShell
              title={experienceSection.title}
              accent={projection.theme.accent}
            >
              <div className="space-y-5">
                {experienceSection.items.map((item) => (
                  <article
                    key={item.id}
                    className="relative min-w-0 border-l pl-5 print:break-inside-avoid"
                    style={{ borderColor: projection.theme.border }}
                  >
                    <span
                      className="absolute -left-[5px] top-1 h-2.5 w-2.5 rounded-full"
                      style={{ background: projection.theme.accent }}
                    />
                    <div className="grid min-w-0 gap-1 sm:grid-cols-[minmax(0,1fr)_auto] sm:gap-4">
                      <div className="min-w-0">
                        <h3 className="overflow-wrap-anywhere text-lg font-bold leading-6">
                          {item.role}
                        </h3>
                        <p
                          className="mt-1 overflow-wrap-anywhere text-sm font-semibold"
                          style={{ color: projection.theme.muted }}
                        >
                          {item.company}
                        </p>
                      </div>
                      <div
                        className="overflow-wrap-anywhere text-sm font-medium sm:text-right"
                        style={{ color: projection.theme.muted }}
                      >
                        <p>{item.period}</p>
                        {item.location ? <p>{item.location}</p> : null}
                      </div>
                    </div>
                    {item.description ? (
                      <p
                        className="mt-3 overflow-wrap-anywhere whitespace-pre-line text-sm leading-7"
                        style={{ color: projection.theme.muted }}
                      >
                        {item.description}
                      </p>
                    ) : null}
                  </article>
                ))}
              </div>
            </SectionShell>
          ) : null}

          {projectsSection?.key === "projects" ? (
            <SectionShell
              title={projectsSection.title}
              accent={projection.theme.accent}
            >
              <div className="grid gap-3">
                {projectsSection.items.map((item) => (
                  <article
                    key={item.id}
                    className="min-w-0 rounded-lg border px-4 py-3 print:break-inside-avoid"
                    style={{ borderColor: projection.theme.border }}
                  >
                    <div className="flex min-w-0 flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                      <h3 className="overflow-wrap-anywhere text-base font-bold">
                        {item.title}
                      </h3>
                      {item.href ? (
                        <a
                          href={item.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="break-all text-sm font-semibold transition-opacity hover:opacity-80 sm:max-w-[45%] sm:text-right"
                          style={{ color: projection.theme.accent }}
                        >
                          {item.href}
                        </a>
                      ) : null}
                    </div>
                    {item.description ? (
                      <p
                        className="mt-2 overflow-wrap-anywhere text-sm leading-6"
                        style={{ color: projection.theme.muted }}
                      >
                        {item.description}
                      </p>
                    ) : null}
                    {item.tags.length > 0 ? (
                      <p
                        className="mt-2 overflow-wrap-anywhere text-xs font-semibold"
                        style={{ color: projection.theme.muted }}
                      >
                        {item.tags.join(" / ")}
                      </p>
                    ) : null}
                  </article>
                ))}
              </div>
            </SectionShell>
          ) : null}

          {highlightsSection?.key === "highlights" ? (
            <SectionShell
              title={highlightsSection.title}
              accent={projection.theme.accent}
            >
              <div className="grid gap-3 sm:grid-cols-2">
                {highlightsSection.items.map((item) => (
                  <article
                    key={item.id}
                    className="min-w-0 rounded-lg border px-4 py-4 print:break-inside-avoid"
                    style={{ borderColor: projection.theme.border }}
                  >
                    {item.metric ? (
                      <p
                        className="overflow-wrap-anywhere text-xl font-extrabold"
                        style={{ color: projection.theme.accent }}
                      >
                        {item.metric}
                      </p>
                    ) : null}
                    <h3 className="mt-1 overflow-wrap-anywhere text-sm font-bold">
                      {item.title}
                    </h3>
                    {item.description ? (
                      <p
                        className="mt-2 overflow-wrap-anywhere text-sm leading-6"
                        style={{ color: projection.theme.muted }}
                      >
                        {item.description}
                      </p>
                    ) : null}
                  </article>
                ))}
              </div>
            </SectionShell>
          ) : null}
        </main>

        <aside className="min-w-0 space-y-7 print:space-y-5">
          {skillsSection?.key === "skills" ? (
            <SectionShell
              title={skillsSection.title}
              accent={projection.theme.accent}
              compact
            >
              <div className="space-y-4">
                {skillsSection.groups.map((group) => (
                  <div key={group.category} className="min-w-0">
                    <h3 className="overflow-wrap-anywhere text-sm font-bold">
                      {group.category}
                    </h3>
                    <p
                      className="mt-1 overflow-wrap-anywhere text-sm leading-6"
                      style={{ color: projection.theme.muted }}
                    >
                      {group.items.join(", ")}
                    </p>
                  </div>
                ))}
              </div>
            </SectionShell>
          ) : null}

          {educationSection?.key === "education" ? (
            <SectionShell
              title={educationSection.title}
              accent={projection.theme.accent}
              compact
            >
              <div className="space-y-4">
                {educationSection.items.map((item) => (
                  <article key={item.id} className="min-w-0 print:break-inside-avoid">
                    <h3 className="overflow-wrap-anywhere text-sm font-bold">
                      {[item.degree, item.field].filter(Boolean).join(" - ") ||
                        item.institution}
                    </h3>
                    <p
                      className="mt-1 overflow-wrap-anywhere text-sm font-semibold"
                      style={{ color: projection.theme.muted }}
                    >
                      {item.institution}
                    </p>
                    <p
                      className="mt-1 overflow-wrap-anywhere text-xs font-medium"
                      style={{ color: projection.theme.muted }}
                    >
                      {item.period}
                    </p>
                    {item.description ? (
                      <p
                        className="mt-2 overflow-wrap-anywhere text-sm leading-6"
                        style={{ color: projection.theme.muted }}
                      >
                        {item.description}
                      </p>
                    ) : null}
                  </article>
                ))}
              </div>
            </SectionShell>
          ) : null}

          {linksSection?.key === "links" ? (
            <SectionShell
              title={linksSection.title}
              accent={projection.theme.accent}
              compact
            >
              <div className="grid gap-2">
                {linksSection.items.map((item) => (
                  <a
                    key={`${item.kind}-${item.label}-${item.href}`}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="min-w-0 rounded-lg border px-3 py-2 text-sm font-semibold transition hover:bg-neutral-50"
                    style={{
                      borderColor: projection.theme.border,
                      color: projection.theme.accent,
                    }}
                  >
                    <span className="block overflow-wrap-anywhere">{item.label}</span>
                    <span
                      className="mt-1 block text-xs font-medium"
                      style={{ color: projection.theme.muted }}
                    >
                      {getLinkKindLabel(item.kind)}
                    </span>
                  </a>
                ))}
              </div>
            </SectionShell>
          ) : null}
        </aside>
      </div>
    </article>
  );
}

function SectionShell({
  title,
  accent,
  compact,
  children,
}: {
  title: string;
  accent: string;
  compact?: boolean;
  children: ReactNode;
}) {
  return (
    <section className="min-w-0">
      <h2
        className={`font-display font-extrabold leading-none ${compact ? "text-base" : "text-xl"}`}
        style={{ color: accent }}
      >
        {title}
      </h2>
      <div className={compact ? "mt-3" : "mt-4"}>{children}</div>
    </section>
  );
}
