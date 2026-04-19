import type { ReactNode } from "react";
import { safeParseBlockConfig } from "@/lib/templates/contracts";
import type {
  RenderablePageBlock,
  TemplateRendererProps,
} from "@/components/templates/types";

const COLORS = {
  background: "#FBF8CC",
  ink: "#03045E",
  softTitle: "#F7F197",
  accent: "#F5EE84",
  brown: "#474306",
};

type SafeRecord = Record<string, unknown>;

function asRecord(value: unknown): SafeRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as SafeRecord)
    : {};
}

function getConfig(block: RenderablePageBlock) {
  const result = safeParseBlockConfig(block.blockType, block.config);
  return result.success ? asRecord(result.data) : {};
}

function readString(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function readNumber(value: unknown, fallback: number) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function readImage(value: unknown) {
  const image = asRecord(value);
  const src = readString(image.src);

  if (!src) return null;

  return {
    src,
    alt: readString(image.alt),
  };
}

function formatYear(value: Date | string | null | undefined) {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return String(date.getFullYear());
}

function resolveResumeHref(value: unknown, username?: string | null) {
  const href = readString(value, "/resume");
  if (href === "/resume" && username) return `/${username}/resume`;
  return href;
}

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h2
      className="text-[56px] font-extrabold leading-none tracking-normal sm:text-[72px] lg:text-[100px]"
      style={{ color: COLORS.softTitle }}
    >
      {children}
    </h2>
  );
}

function PlusCluster() {
  return (
    <div className="hidden sm:block" aria-hidden="true">
      <div className="relative h-16 w-20">
        <span
          className="absolute left-8 top-2 h-6 w-1.5 rounded-md"
          style={{ background: COLORS.brown }}
        />
        <span
          className="absolute left-[27px] top-[17px] h-1.5 w-6 rounded-md"
          style={{ background: COLORS.brown }}
        />
        <span
          className="absolute left-14 top-8 h-6 w-1.5 rounded-md"
          style={{ background: COLORS.brown }}
        />
        <span
          className="absolute left-[51px] top-[41px] h-1.5 w-6 rounded-md"
          style={{ background: COLORS.brown }}
        />
      </div>
    </div>
  );
}

function HeroBlock({
  block,
  profile,
}: TemplateRendererProps & { block: RenderablePageBlock }) {
  const config = getConfig(block);
  const username = profile.user?.username;
  const displayName =
    readString(config.name) || profile.displayName || profile.user?.name || "John Doe";
  const headline =
    readString(config.headline) || profile.headline || "Product Designer";
  const eyebrow = readString(config.eyebrow, "Hello, I'm");
  const locationLine =
    readString(config.locationLine) ||
    (profile.location ? `based in ${profile.location}.` : "based in Netherland.");
  const portrait =
    readImage(config.portrait) ??
    (profile.avatarUrl ? { src: profile.avatarUrl, alt: displayName } : null);
  const ctaLabel = readString(config.ctaLabel, "Resume");
  const ctaHref = resolveResumeHref(config.ctaHref, username);

  return (
    <section id="home" className="relative pt-8 sm:pt-10">
      <nav className="flex items-center justify-between gap-8 text-[13px] font-medium">
        <p className="text-[18px] font-semibold">{displayName}</p>
        <div className="hidden items-center gap-16 sm:flex">
          <a href="#home" className="transition-opacity hover:opacity-70">
            Home
          </a>
          <a href="#about" className="transition-opacity hover:opacity-70">
            About
          </a>
          <a href="#work" className="transition-opacity hover:opacity-70">
            Work
          </a>
        </div>
        <div className="hidden items-center gap-5 sm:flex" aria-label="Social links">
          <span className="text-[11px] font-extrabold">Mh</span>
          <span className="text-[11px] font-extrabold">Be</span>
          <span className="text-[11px] font-extrabold">Tw</span>
        </div>
      </nav>

      <div className="grid min-h-[650px] items-center gap-10 py-20 lg:grid-cols-[1fr_520px] lg:py-28">
        <div className="max-w-[640px]">
          <p className="text-[22px] font-medium leading-normal sm:text-[28px]">
            {eyebrow} {displayName.split(" ")[0]},
          </p>
          <h1 className="mt-2 text-[58px] font-extrabold leading-[0.96] tracking-normal sm:text-[82px] lg:text-[100px]">
            {headline}
          </h1>
          <p className="mt-5 text-[22px] font-medium sm:text-[28px]">{locationLine}</p>
          <a
            href={ctaHref}
            className="mt-7 inline-flex h-[58px] min-w-[142px] items-center justify-center rounded-md border px-7 text-[17px] transition-transform hover:-translate-y-0.5"
            style={{
              borderColor: COLORS.brown,
              background: COLORS.accent,
              color: COLORS.brown,
              boxShadow: "6px 7px 0 rgba(245, 238, 132, 0.55)",
            }}
          >
            {ctaLabel}
          </a>
        </div>

        <div className="relative mx-auto min-h-[420px] w-full max-w-[520px]">
          <div className="absolute right-0 top-0">
            <PlusCluster />
          </div>
          <div className="relative mx-auto mt-4 h-[360px] w-[360px] sm:h-[493px] sm:w-[493px]">
            <div
              className="absolute inset-0 rounded-[48%] border"
              style={{ borderColor: "rgba(71,67,6,0.28)" }}
            />
            {portrait ? (
              <img
                src={portrait.src}
                alt={portrait.alt || displayName}
                className="absolute inset-[6%] h-[88%] w-[88%] rounded-[48%] object-cover"
              />
            ) : null}
            <img
              src="/templates/portfolio-community/profile-shape.svg"
              alt=""
              aria-hidden="true"
              className="absolute inset-[3%] h-[94%] w-[94%]"
            />
          </div>
          <div className="absolute bottom-10 left-4 hidden gap-3 sm:flex" aria-hidden="true">
            {Array.from({ length: 5 }).map((_, index) => (
              <span
                key={index}
                className="block h-[30px] w-[5px] rotate-[24deg]"
                style={{ background: COLORS.brown }}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function AboutBlock({
  block,
  profile,
  version,
}: TemplateRendererProps & { block: RenderablePageBlock }) {
  const config = getConfig(block);
  const body = readString(config.body) || version?.customBio || profile.bio || "";
  if (!body) return null;

  return (
    <section id="about" className="py-16 sm:py-24">
      <SectionTitle>{readString(config.title, "about.")}</SectionTitle>
      <p className="mt-10 max-w-[900px] whitespace-pre-line text-[20px] leading-[1.8] sm:text-[24px] sm:leading-[44px]">
        {body}
      </p>
    </section>
  );
}

function ExperienceBlock({
  block,
  profile,
  version,
}: TemplateRendererProps & { block: RenderablePageBlock }) {
  const config = getConfig(block);
  const maxItems = readNumber(config.maxItems, 3);
  let experiences = profile.experiences;

  if (version?.selectedExperienceIds?.length) {
    experiences = experiences.filter((item) =>
      version.selectedExperienceIds.includes(item.id)
    );
  }

  experiences = [...experiences]
    .sort((a, b) => a.order - b.order)
    .slice(0, maxItems);

  if (experiences.length === 0) return null;

  return (
    <section className="grid gap-8 py-10 sm:grid-cols-[240px_1fr] sm:gap-16">
      <h2 className="text-2xl font-semibold leading-10">{readString(config.title, "experience")}</h2>
      <div className="space-y-16">
        {experiences.map((experience) => {
          const start = formatYear(experience.startDate);
          const end = experience.current ? "Present" : formatYear(experience.endDate);
          return (
            <article key={experience.id} className="relative pl-8">
              <span className="absolute left-0 top-3 h-[13px] w-[13px] rounded-full bg-current" />
              <p className="text-[20px] font-semibold leading-10 sm:text-[24px]">
                {start}
                {end ? ` - ${end}` : ""}
              </p>
              <p className="max-w-[900px] whitespace-pre-line text-[20px] leading-[1.8] sm:text-[24px] sm:leading-[44px]">
                {experience.description ||
                  `${experience.role} at ${experience.company}.`}
              </p>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function WorkBlock({
  block,
  profile,
  version,
}: TemplateRendererProps & { block: RenderablePageBlock }) {
  const config = getConfig(block);
  const maxItems = readNumber(config.maxItems, 2);
  let projects = profile.projects;

  if (version?.selectedProjectIds?.length) {
    projects = projects.filter((item) => version.selectedProjectIds.includes(item.id));
  }

  projects = [...projects].sort((a, b) => a.order - b.order).slice(0, maxItems);
  const fallbackProjects = Array.isArray(config.fallbackProjects)
    ? config.fallbackProjects.map(asRecord)
    : [];
  const items =
    projects.length > 0
      ? projects.map((project) => ({
          key: project.id,
          title: project.title,
          description: project.description ?? "",
          date: "Featured work",
          image: project.imageUrl ? { src: project.imageUrl, alt: project.title } : null,
          href: project.url,
        }))
      : fallbackProjects.map((project, index) => ({
          key: `fallback-${index}`,
          title: readString(project.title, "Some Case Study"),
          description: readString(project.description),
          date: readString(project.date, "November 24, 2019"),
          image: readImage(project.image),
          href: readString(project.href),
        }));

  return (
    <section id="work" className="py-16 sm:py-24">
      <SectionTitle>{readString(config.title, "work.")}</SectionTitle>
      <p className="mt-10 max-w-[900px] whitespace-pre-line text-[20px] leading-[1.8] sm:text-[24px] sm:leading-[44px]">
        {readString(config.intro)}
      </p>

      <div className="mt-24 grid gap-14 lg:grid-cols-2 lg:gap-20">
        {items.map((project) => (
          <article key={project.key}>
            {project.image ? (
              <img
                src={project.image.src}
                alt={project.image.alt || project.title}
                className="h-[260px] w-full object-cover sm:h-[400px]"
              />
            ) : null}
            <p className="mt-5 text-[15px] italic leading-[44px]">{project.date}</p>
            <h3 className="text-[24px] font-semibold leading-[44px]">{project.title}</h3>
            <p className="max-w-[560px] text-[18px] leading-8">{project.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function ContactBlock({
  block,
  profile,
  version,
}: TemplateRendererProps & { block: RenderablePageBlock }) {
  const config = getConfig(block);
  const image = readImage(config.image);
  const configuredLinks = Array.isArray(config.links) ? config.links.map(asRecord) : [];
  const selectedLinks =
    version?.selectedLinkIds?.length
      ? profile.links.filter((link) => version.selectedLinkIds?.includes(link.id))
      : profile.links;
  const selectedProofs =
    version?.selectedProofIds?.length
      ? (profile.proofs ?? []).filter((proof) =>
          version.selectedProofIds?.includes(proof.id)
        )
      : (profile.proofs ?? []);
  const links =
    selectedLinks.length > 0 || selectedProofs.length > 0
      ? [
          ...selectedLinks.map((link) => ({
            label: link.label ?? link.platform,
            href: link.url,
          })),
          ...selectedProofs
            .filter((proof) => proof.url)
            .map((proof) => ({
              label: proof.metric ? `${proof.title} - ${proof.metric}` : proof.title,
              href: proof.url,
            })),
        ]
      : configuredLinks.map((link) => ({
          label: readString(link.label),
          href: readString(link.href),
        }));

  return (
    <section className="py-16 sm:py-24">
      <SectionTitle>{readString(config.title, "contact.")}</SectionTitle>
      <div className="mt-12 grid gap-12 lg:grid-cols-[440px_1fr] lg:gap-16">
        {image ? (
          <img
            src={image.src}
            alt={image.alt || ""}
            className="h-[314px] w-full max-w-[440px] object-cover"
          />
        ) : null}
        <div>
          <p className="max-w-[640px] whitespace-pre-line text-[20px] leading-[1.8] sm:text-[24px] sm:leading-[44px]">
            {readString(config.body) || profile.bio}
          </p>
          <div className="mt-8 flex flex-col text-[20px] leading-[44px] sm:text-[24px]">
            {profile.publicEmail ? <a href={`mailto:${profile.publicEmail}`}>{profile.publicEmail}</a> : null}
            {links.map((link) =>
              link.href ? (
                <a key={`${link.label}-${link.href}`} href={link.href} rel="noopener noreferrer">
                  {link.label}
                </a>
              ) : null
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function PortfolioCommunityRenderer(props: TemplateRendererProps) {
  const blocks = props.blocks
    .filter((block) => block.visible && !block.parentId)
    .sort((a, b) => a.order - b.order);

  return (
    <main
      className="min-h-screen"
      style={{
        background: COLORS.background,
        color: COLORS.ink,
        fontFamily:
          "var(--font-template-portfolio), Poppins, ui-sans-serif, system-ui, sans-serif",
      }}
    >
      <div className="mx-auto w-full max-w-[1440px] px-6 sm:px-[97px]">
        {blocks.map((block) => {
          if (block.blockType === "portfolio.hero") {
            return <HeroBlock key={block.id} {...props} block={block} />;
          }

          if (block.blockType === "portfolio.about") {
            return <AboutBlock key={block.id} {...props} block={block} />;
          }

          if (block.blockType === "portfolio.experience") {
            return <ExperienceBlock key={block.id} {...props} block={block} />;
          }

          if (block.blockType === "portfolio.work") {
            return <WorkBlock key={block.id} {...props} block={block} />;
          }

          if (block.blockType === "portfolio.contact") {
            return <ContactBlock key={block.id} {...props} block={block} />;
          }

          return null;
        })}
      </div>
    </main>
  );
}
