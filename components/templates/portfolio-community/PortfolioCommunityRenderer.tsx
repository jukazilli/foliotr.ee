import {
  buildPortfolioCommunityBlockStateFromBlocks,
  derivePortfolioCommunitySemantics,
  type PortfolioCommunitySemantics,
} from "@/lib/templates/portfolio-community-semantics";
import {
  readPortfolioCommunitySourcePackage,
  type PortfolioCommunitySourcePackage,
} from "@/lib/templates/source-package";
import type { TemplateRendererProps } from "@/components/templates/types";
import type { RenderablePageBlock } from "@/components/templates/types";

const FALLBACK_SOURCE_PACKAGE: PortfolioCommunitySourcePackage = {
  variant: "template1",
  codeDir: "template-code/template1",
  rendererEntry: "src/imports/Home/Home.tsx",
  appEntry: "src/app/App.tsx",
  styles: [],
  canvas: {
    width: 1440,
    height: 4037,
    background: "#FBF8CC",
    fontFamily: "Poppins",
  },
  sectionOrder: ["hero", "about", "experience", "work", "contact"],
  imports: {
    default: {},
    named: {},
  },
  svg: {
    paths: {},
    named: {},
  },
  sourceFiles: {
    app: "",
    home: "",
    imageWithFallback: "",
    fontsCss: "",
    indexCss: "",
    themeCss: "",
  },
};

const inkColor = "#03045E";
const accentInkColor = "#474306";
const accentSurfaceColor = "#F5EE84";
const ghostTitleColor = "#F7F197";
const iceBackgroundColor = "#F7F7F2";

function readSourcePackage(value: unknown): PortfolioCommunitySourcePackage {
  try {
    return readPortfolioCommunitySourcePackage(value);
  } catch {
    return FALLBACK_SOURCE_PACKAGE;
  }
}

function SourceIcon({
  pathValue,
  viewBox,
  className,
}: {
  pathValue?: string;
  viewBox: string;
  className: string;
}) {
  if (!pathValue) return null;

  return (
    <svg className={className} fill="none" preserveAspectRatio="none" viewBox={viewBox}>
      <path d={pathValue} fill="currentColor" />
    </svg>
  );
}

function SlashMarks({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden="true" className={`flex items-center gap-4 ${className}`}>
      {[0, 1, 2, 3, 4].map((item) => (
        <span
          key={item}
          className="block h-9 w-1.5 rotate-[24deg] rounded-full"
          style={{ backgroundColor: accentInkColor }}
        />
      ))}
    </div>
  );
}

function PlusCluster({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden="true" className={`relative h-16 w-16 text-[#474306] ${className}`}>
      {[
        "left-1 top-5",
        "left-8 top-1",
        "left-8 top-9",
      ].map((position) => (
        <span key={position} className={`absolute ${position} block h-6 w-6`}>
          <span className="absolute left-1/2 top-0 h-6 w-1.5 -translate-x-1/2 rounded-full bg-current" />
          <span className="absolute left-0 top-1/2 h-1.5 w-6 -translate-y-1/2 rounded-full bg-current" />
        </span>
      ))}
    </div>
  );
}

function SectionTitle({ children }: { children: string }) {
  return (
    <h2
      className="font-extrabold leading-none tracking-[-0.08em]"
      style={{
        color: ghostTitleColor,
        fontSize: "clamp(3.25rem, 10vw, 6.75rem)",
      }}
    >
      {children}
    </h2>
  );
}

function SectionShell({
  id,
  children,
  className = "",
  editorBlockId,
  editorSlot,
}: {
  id: string;
  children: React.ReactNode;
  className?: string;
  editorBlockId?: string;
  editorSlot?: string;
}) {
  return (
    <section
      id={id}
      className={`mx-auto w-full max-w-[1180px] px-5 sm:px-8 lg:px-10 ${className}`}
      data-ft-block-id={editorBlockId}
      data-ft-slot={editorSlot}
      data-ft-kind={editorBlockId ? "block" : undefined}
      data-ft-editable={editorBlockId ? "true" : undefined}
    >
      {children}
    </section>
  );
}

function getRenderableBlockByType(
  blocks: RenderablePageBlock[],
  blockType: RenderablePageBlock["blockType"]
) {
  return blocks.find((block) => block.blockType === blockType) ?? null;
}

function getRenderableBlocksByType(
  blocks: RenderablePageBlock[],
  blockType: RenderablePageBlock["blockType"]
) {
  return blocks.filter((block) => block.blockType === blockType);
}

function HeroPortrait({
  semantics,
  sourcePackage,
  block,
}: {
  semantics: PortfolioCommunitySemantics;
  sourcePackage: PortfolioCommunitySourcePackage;
  block: RenderablePageBlock | null;
}) {
  const portraitStyle =
    semantics.hero.portrait?.fitMode === "fit"
      ? {
          objectFit: "contain" as const,
          objectPosition: `${semantics.hero.portrait.positionX}% ${semantics.hero.portrait.positionY}%`,
        }
      : {
          objectFit: "cover" as const,
          objectPosition: `${semantics.hero.portrait?.positionX ?? 50}% ${semantics.hero.portrait?.positionY ?? 50}%`,
        };

  return (
    <div
      className="relative mx-auto aspect-square w-full max-w-[34rem] lg:mx-0"
      data-ft-block-id={block?.id}
      data-ft-slot="hero.portrait"
      data-ft-config-path="portrait"
      data-ft-kind="image"
      data-ft-editable="true"
    >
      <div className="absolute inset-[5%] rounded-[48%] border border-[#474306]/80" />
      <div className="absolute inset-[1%] translate-x-[2%] overflow-hidden rounded-[48%] bg-[#F5EE84]">
        {semantics.hero.portrait ? (
          <img
            alt=""
            className="h-full w-full object-cover"
            src={semantics.hero.portrait.src}
            style={
              sourcePackage.imports.named.imgUnsplashD1UPkiFd04A
                ? {
                    ...portraitStyle,
                    maskImage: `url('${sourcePackage.imports.named.imgUnsplashD1UPkiFd04A}')`,
                    maskSize: "cover",
                    maskRepeat: "no-repeat",
                  }
                : portraitStyle
            }
          />
        ) : null}
      </div>
      {semantics.hero.showPlusCluster ? (
        <div
          data-ft-block-id={block?.id}
          data-ft-slot="hero.showPlusCluster"
          data-ft-config-path="showPlusCluster"
          data-ft-kind="icon"
          data-ft-editable="true"
        >
          <PlusCluster className="absolute -right-4 top-8 hidden sm:block" />
        </div>
      ) : (
        <div
          className="absolute -right-4 top-8 hidden h-16 w-16 rounded-2xl border border-dashed border-[#474306]/35 bg-[#F5EE84]/30 sm:block"
          data-ft-block-id={block?.id}
          data-ft-slot="hero.showPlusCluster"
          data-ft-config-path="showPlusCluster"
          data-ft-kind="icon"
          data-ft-editable="true"
        />
      )}
      {semantics.hero.showSlashMarks ? (
        <div
          data-ft-block-id={block?.id}
          data-ft-slot="hero.showSlashMarks"
          data-ft-config-path="showSlashMarks"
          data-ft-kind="icon"
          data-ft-editable="true"
        >
          <SlashMarks className="absolute -bottom-5 left-8" />
        </div>
      ) : (
        <div
          className="absolute -bottom-3 left-8 h-5 w-24 rounded-full border border-dashed border-[#474306]/35 bg-[#F5EE84]/30"
          data-ft-block-id={block?.id}
          data-ft-slot="hero.showSlashMarks"
          data-ft-config-path="showSlashMarks"
          data-ft-kind="icon"
          data-ft-editable="true"
        />
      )}
    </div>
  );
}

function HeaderNav({
  semantics,
  sourcePackage,
}: {
  semantics: PortfolioCommunitySemantics;
  sourcePackage: PortfolioCommunitySourcePackage;
}) {
  return (
    <header className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
      <div aria-hidden="true" />

      <div className="flex flex-wrap items-center gap-x-8 gap-y-3 text-lg md:justify-end">
        <a href="#top" className="transition hover:opacity-70">
          Inicio
        </a>
        {semantics.about.visible ? (
          <a href="#about" className="transition hover:opacity-70">
            Sobre
          </a>
        ) : null}
        {semantics.work.visible ? (
          <a href="#work" className="transition hover:opacity-70">
            Projetos
          </a>
        ) : null}
        {semantics.contact.visible ? (
          <a href="#contact" className="transition hover:opacity-70">
            Contato
          </a>
        ) : null}
        {semantics.hero.showSocialIcons ? (
          <div
            className="flex items-center gap-6 text-[#03045E]"
            data-ft-slot="hero.showSocialIcons"
            data-ft-config-path="showSocialIcons"
            data-ft-kind="icon"
            data-ft-editable="true"
          >
            <SourceIcon
              pathValue={sourcePackage.svg.paths.p3ec48180}
              viewBox="0 0 26 15"
              className="h-[15px] w-[26px]"
            />
            <SourceIcon
              pathValue={sourcePackage.svg.paths.p338fd700}
              viewBox="0 0 26 17"
              className="h-[16px] w-[26px]"
            />
            <SourceIcon
              pathValue={sourcePackage.svg.paths.p2b5eac80}
              viewBox="0 0 20 16"
              className="h-[18px] w-[20px]"
            />
          </div>
        ) : (
          <div
            className="flex h-10 items-center rounded-full border border-dashed border-[#03045E]/30 px-4 text-xs font-semibold uppercase tracking-[0.18em] text-[#03045E]/45"
            data-ft-slot="hero.showSocialIcons"
            data-ft-config-path="showSocialIcons"
            data-ft-kind="icon"
            data-ft-editable="true"
          >
            icones
          </div>
        )}
      </div>
    </header>
  );
}

function HeroCta({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      className="group relative inline-flex min-h-[3.8rem] items-center justify-center px-10 text-xl text-[#474306]"
    >
      <span
        aria-hidden="true"
        className="absolute inset-x-1 bottom-0 top-1 rounded-md transition-transform group-hover:translate-x-1 group-hover:translate-y-1"
        style={{ backgroundColor: accentSurfaceColor }}
      />
      <span
        aria-hidden="true"
        className="absolute inset-x-0 bottom-1 top-0 rounded-md border border-[#474306]"
      />
      <span className="relative">{label}</span>
    </a>
  );
}

function HeroSection({
  semantics,
  sourcePackage,
  block,
  renderHidden,
}: {
  semantics: PortfolioCommunitySemantics;
  sourcePackage: PortfolioCommunitySourcePackage;
  block: RenderablePageBlock | null;
  renderHidden: boolean;
}) {
  if (!renderHidden && !semantics.hero.visible) return null;

  return (
    <div
      data-ft-block-id={block?.id}
      data-ft-block-type={block?.blockType}
      data-ft-kind={block ? "block" : undefined}
      data-ft-editable={block ? "true" : undefined}
      className={!semantics.hero.visible ? "grayscale opacity-45" : undefined}
    >
      <div style={{ background: sourcePackage.canvas.background }}>
        <SectionShell id="top" className="pb-0 pt-28 sm:pt-32">
          <HeaderNav semantics={semantics} sourcePackage={sourcePackage} />

          <div className="grid items-end gap-12 pt-16 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,32rem)] lg:gap-16 lg:pt-24">
            <div className="min-w-0 pb-14 lg:pb-20">
              <p
                className="mb-5 break-words font-medium leading-tight"
                style={{ fontSize: "clamp(1.35rem, 3.2vw, 2rem)" }}
                data-ft-slot="hero.eyebrow"
                data-ft-config-path="eyebrow"
                data-ft-kind="text"
                data-ft-editable="true"
              >
                {semantics.hero.eyebrow}
                {semantics.hero.displayName ? ` ${semantics.hero.displayName},` : ""}
              </p>
              <h1
                className="max-w-[13ch] break-words font-extrabold leading-[0.98] tracking-[-0.08em]"
                style={{ fontSize: "clamp(3.6rem, 8vw, 6.75rem)" }}
                data-ft-slot="hero.headline"
                data-ft-config-path="headline"
                data-ft-kind="text"
                data-ft-editable="true"
              >
                {semantics.hero.headline}
              </h1>
              {semantics.hero.locationLine ? (
                <p
                  className="mt-6 break-words font-medium leading-tight"
                  style={{ fontSize: "clamp(1.25rem, 3vw, 2rem)" }}
                  data-ft-slot="hero.locationLine"
                  data-ft-config-path="locationLine"
                  data-ft-kind="text"
                  data-ft-editable="true"
                >
                  {semantics.hero.locationLine}
                </p>
              ) : null}
            </div>

          <div className="relative z-10 -mb-16 sm:-mb-20 lg:-mb-24">
              <HeroPortrait semantics={semantics} sourcePackage={sourcePackage} block={block} />
            </div>
          </div>
        </SectionShell>
      </div>

      <div style={{ background: iceBackgroundColor }}>
        <SectionShell id="hero-action" className="pb-16 pt-24 sm:pt-28 lg:pb-24 lg:pt-32">
          <div className="min-w-0">
            <HeroCta href={semantics.hero.ctaHref} label={semantics.hero.ctaLabel} />
          </div>
        </SectionShell>
      </div>
    </div>
  );
}

function AboutSection({
  semantics,
  block,
  renderHidden,
}: {
  semantics: PortfolioCommunitySemantics;
  block: RenderablePageBlock | null;
  renderHidden: boolean;
}) {
  if (!renderHidden && !semantics.about.visible) return null;

  return (
    <SectionShell
      id="about"
      className={`py-16 lg:py-24 ${!semantics.about.visible ? "grayscale opacity-45" : ""}`}
      editorBlockId={block?.id}
    >
      <div
        data-ft-slot="about.title"
        data-ft-config-path="title"
        data-ft-kind="text"
        data-ft-editable="true"
      >
        <SectionTitle>{semantics.about.title}</SectionTitle>
      </div>
      <p
        className="mt-8 max-w-[58rem] whitespace-pre-line break-words text-xl leading-[1.8] md:text-2xl"
        data-ft-slot="about.body"
        data-ft-config-path="body"
        data-ft-kind="text"
        data-ft-editable="true"
      >
        {semantics.about.body}
      </p>
    </SectionShell>
  );
}

function ExperienceSection({
  semantics,
  block,
  renderHidden,
}: {
  semantics: PortfolioCommunitySemantics;
  block: RenderablePageBlock | null;
  renderHidden: boolean;
}) {
  if ((!renderHidden && !semantics.experience.visible) || semantics.experience.items.length === 0) return null;

  return (
    <SectionShell
      id="experience"
      className={`py-16 lg:py-24 ${!semantics.experience.visible ? "grayscale opacity-45" : ""}`}
      editorBlockId={block?.id}
    >
      <div
        data-ft-slot="experience.title"
        data-ft-config-path="title"
        data-ft-kind="text"
        data-ft-editable="true"
      >
        <SectionTitle>{semantics.experience.title}</SectionTitle>
      </div>
      <div className="mt-10 mx-auto max-w-[58rem] space-y-12">
        {semantics.experience.items.map((experience) => (
          <article
            key={experience.id}
            className="grid gap-4 border-l border-[#03045E]/30 pl-6 md:grid-cols-[12rem_minmax(0,1fr)] md:border-l-0 md:pl-0"
          >
            <div className="flex items-start gap-4">
              <span className="mt-3 hidden h-3 w-3 shrink-0 rounded-full bg-[#03045E] md:block" />
              <p className="break-words text-lg font-semibold leading-relaxed md:text-xl">
                {experience.period}
              </p>
            </div>
            <div className="min-w-0">
              <h3 className="break-words text-xl font-semibold leading-snug md:text-2xl">
                {[experience.role, experience.company].filter(Boolean).join(" | ")}
              </h3>
              <p className="mt-3 whitespace-pre-line break-words text-lg leading-[1.8] md:text-xl">
                {experience.description}
              </p>
            </div>
          </article>
        ))}
      </div>
    </SectionShell>
  );
}

function EducationSection({
  semantics,
  block,
  renderHidden,
}: {
  semantics: PortfolioCommunitySemantics;
  block: RenderablePageBlock | null;
  renderHidden: boolean;
}) {
  if ((!renderHidden && !semantics.education.visible) || semantics.education.items.length === 0) return null;

  return (
    <SectionShell
      id="education"
      className={`py-16 lg:py-24 ${!semantics.education.visible ? "grayscale opacity-45" : ""}`}
      editorBlockId={block?.id}
    >
      <div
        data-ft-slot="education.title"
        data-ft-config-path="title"
        data-ft-kind="text"
        data-ft-editable="true"
      >
        <SectionTitle>{semantics.education.title}</SectionTitle>
      </div>
      <div className="mt-10 mx-auto max-w-[58rem] space-y-8">
        {semantics.education.items.map((education) => (
          <article
            key={education.id}
            className="grid gap-4 border-l border-[#03045E]/30 pl-6 md:grid-cols-[12rem_minmax(0,1fr)] md:border-l-0 md:pl-0"
          >
            <p className="break-words text-lg font-semibold leading-relaxed md:text-xl">
              {education.period}
            </p>
            <div className="min-w-0">
              <h3 className="break-words text-xl font-semibold leading-snug md:text-2xl">
                {[education.degree, education.field].filter(Boolean).join(" | ") ||
                  education.institution}
              </h3>
              <p className="mt-1 break-words text-lg leading-relaxed md:text-xl">
                {education.institution}
              </p>
              {education.description ? (
                <p className="mt-3 whitespace-pre-line break-words text-lg leading-[1.8] md:text-xl">
                  {education.description}
                </p>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </SectionShell>
  );
}

function WorkSection({
  semantics,
  block,
  renderHidden,
}: {
  semantics: PortfolioCommunitySemantics;
  block: RenderablePageBlock | null;
  renderHidden: boolean;
}) {
  if (!renderHidden && !semantics.work.visible) return null;

  return (
    <SectionShell
      id="work"
      className={`py-16 lg:py-24 ${!semantics.work.visible ? "grayscale opacity-45" : ""}`}
      editorBlockId={block?.id}
    >
      <div
        data-ft-slot="work.title"
        data-ft-config-path="title"
        data-ft-kind="text"
        data-ft-editable="true"
      >
        <SectionTitle>{semantics.work.title}</SectionTitle>
      </div>
      {semantics.work.intro ? (
        <p
          className="mt-8 max-w-[58rem] whitespace-pre-line break-words text-xl leading-[1.8] md:text-2xl"
          data-ft-slot="work.intro"
          data-ft-config-path="intro"
          data-ft-kind="text"
          data-ft-editable="true"
        >
          {semantics.work.intro}
        </p>
      ) : null}

      <div className="mt-16 grid gap-12 lg:grid-cols-2 lg:gap-20">
        {semantics.work.items.slice(0, semantics.work.maxItems).map((item) => {
          const content = (
            <>
              <div
                className="aspect-[7/5] w-full overflow-hidden bg-[#F5EE84]"
                data-ft-slot={item.imageConfigPath ? `work.${item.imageConfigPath}` : undefined}
                data-ft-config-path={item.imageConfigPath}
                data-ft-kind={item.imageConfigPath ? "image" : undefined}
                data-ft-editable={item.imageConfigPath ? "true" : undefined}
              >
                {item.image ? (
                  <img
                    alt={item.title}
                    className="h-full w-full"
                    src={item.image}
                    style={
                      item.imageValue
                        ? {
                            objectFit: item.imageValue.fitMode === "fit" ? "contain" : "cover",
                            objectPosition: `${item.imageValue.positionX}% ${item.imageValue.positionY}%`,
                          }
                        : { objectFit: "cover" }
                    }
                  />
                ) : null}
              </div>
              <p className="mt-5 break-words text-sm italic leading-relaxed">{item.date}</p>
              <h3 className="mt-1 break-words text-2xl font-semibold leading-snug">
                {item.title}
              </h3>
              <p className="mt-3 whitespace-pre-line break-words text-lg leading-[1.75]">
                {item.description}
              </p>
            </>
          );

          return item.href ? (
            <a key={item.key} href={item.href} className="group block min-w-0">
              <article className="transition duration-200 group-hover:-translate-y-1 group-hover:opacity-90">
                {content}
              </article>
            </a>
          ) : (
            <article key={item.key} className="min-w-0">
              {content}
            </article>
          );
        })}
      </div>
    </SectionShell>
  );
}

function ContactSection({
  semantics,
  block,
  renderHidden,
}: {
  semantics: PortfolioCommunitySemantics;
  block: RenderablePageBlock | null;
  renderHidden: boolean;
}) {
  if (!renderHidden && !semantics.contact.visible) return null;

  return (
    <SectionShell
      id="contact"
      className={`py-16 lg:py-28 ${!semantics.contact.visible ? "grayscale opacity-45" : ""}`}
      editorBlockId={block?.id}
    >
      <div
        data-ft-slot="contact.title"
        data-ft-config-path="title"
        data-ft-kind="text"
        data-ft-editable="true"
      >
        <SectionTitle>{semantics.contact.title}</SectionTitle>
      </div>
      <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(18rem,27rem)_minmax(0,1fr)] lg:gap-16">
        <div
          className="aspect-[7/5] w-full overflow-hidden bg-[#F5EE84]"
          data-ft-slot="contact.image"
          data-ft-config-path="image"
          data-ft-kind="image"
          data-ft-editable="true"
        >
          {semantics.contact.supportImage ? (
            <img
              alt=""
              className="h-full w-full"
              src={semantics.contact.supportImage.src}
              style={{
                objectFit:
                  semantics.contact.supportImage.fitMode === "fit" ? "contain" : "cover",
                objectPosition: `${semantics.contact.supportImage.positionX}% ${semantics.contact.supportImage.positionY}%`,
              }}
            />
          ) : null}
        </div>
        <div className="min-w-0">
          <p
            className="whitespace-pre-line break-words text-xl leading-[1.8] md:text-2xl"
            data-ft-slot="contact.body"
            data-ft-config-path="body"
            data-ft-kind="text"
            data-ft-editable="true"
          >
            {semantics.contact.body}
          </p>
          <div className="mt-8 flex flex-col items-start gap-2 text-xl leading-relaxed md:text-2xl">
            {semantics.contact.links.slice(0, 3).map((link) => (
              <a
                key={`${link.type}:${link.href}:${link.label}`}
                href={link.href}
                className="max-w-full break-all transition hover:opacity-70"
              >
                {link.label}
              </a>
            ))}
            {!semantics.contact.links.length && semantics.contact.publicEmail ? (
              <span className="max-w-full break-all">{semantics.contact.publicEmail}</span>
            ) : null}
          </div>
        </div>
      </div>
    </SectionShell>
  );
}

function CustomSections({
  blocks,
  renderHidden,
}: {
  blocks: RenderablePageBlock[];
  renderHidden: boolean;
}) {
  if (!blocks.length) return null;

  return (
    <>
      {blocks.map((block, index) => {
        if (!renderHidden && !block.visible) return null;

        const config =
          typeof block.config === "object" && block.config !== null && !Array.isArray(block.config)
            ? (block.config as Record<string, unknown>)
            : {};
        const image =
          typeof config.image === "object" && config.image !== null && !Array.isArray(config.image)
            ? (config.image as Record<string, unknown>)
            : null;
        const listItems = Array.isArray(config.listItems)
          ? config.listItems
              .map((item) =>
                typeof item === "object" && item !== null && !Array.isArray(item)
                  ? (item as Record<string, unknown>)
                  : {}
              )
              .flatMap((item) =>
                typeof item.text === "string" && item.text.trim() ? [item.text.trim()] : []
              )
          : [];
        const imageAlign =
          config.imageAlign === "left" || config.imageAlign === "right" || config.imageAlign === "center"
            ? config.imageAlign
            : "center";
        const sectionTitle =
          typeof config.title === "string" && config.title.trim() ? config.title.trim() : "nova secao";
        const body = typeof config.body === "string" ? config.body : "";
        const imageSrc = typeof image?.src === "string" ? image.src : "";
        const imageAlt = typeof image?.alt === "string" ? image.alt : "";
        const imageStyle = {
          objectFit: image?.fitMode === "fit" ? ("contain" as const) : ("cover" as const),
          objectPosition: `${typeof image?.positionX === "number" ? image.positionX : 50}% ${
            typeof image?.positionY === "number" ? image.positionY : 50
          }%`,
        };

        return (
          <SectionShell
            key={block.id}
            id={`custom-${index + 1}`}
            className={`py-16 lg:py-24 ${!block.visible ? "grayscale opacity-45" : ""}`}
            editorBlockId={block.id}
          >
            <div
              data-ft-slot={`custom.${index}.title`}
              data-ft-config-path="title"
              data-ft-kind="text"
              data-ft-editable="true"
            >
              <SectionTitle>{sectionTitle}</SectionTitle>
            </div>
            <div
              className={`mt-10 grid gap-8 ${
                imageSrc ? "lg:grid-cols-[minmax(16rem,26rem)_minmax(0,1fr)]" : ""
              } ${imageAlign === "right" ? "lg:[&>*:first-child]:order-2" : ""}`}
            >
              {imageSrc ? (
                <div
                  className={`aspect-[4/3] overflow-hidden bg-[#F5EE84] ${
                    imageAlign === "center" ? "mx-auto max-w-[32rem]" : "w-full"
                  }`}
                  data-ft-slot={`custom.${index}.image`}
                  data-ft-config-path="image"
                  data-ft-kind="image"
                  data-ft-editable="true"
                >
                  <img alt={imageAlt} className="h-full w-full" src={imageSrc} style={imageStyle} />
                </div>
              ) : null}
              <div className="min-w-0">
                {body ? (
                  <p
                    className="whitespace-pre-line break-words text-xl leading-[1.8] md:text-2xl"
                    data-ft-slot={`custom.${index}.body`}
                    data-ft-config-path="body"
                    data-ft-kind="text"
                    data-ft-editable="true"
                  >
                    {body}
                  </p>
                ) : null}
                {listItems.length ? (
                  <ul
                    className="mt-6 space-y-3 text-lg leading-[1.8] md:text-xl"
                    data-ft-slot={`custom.${index}.listItems`}
                    data-ft-config-path="listItems"
                    data-ft-kind="text"
                    data-ft-editable="true"
                  >
                    {listItems.map((item) => (
                      <li key={item} className="break-words">
                        {item}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </div>
          </SectionShell>
        );
      })}
    </>
  );
}

export default function PortfolioCommunityRenderer(props: TemplateRendererProps) {
  const sourcePackage = readSourcePackage(props.templateSourcePackage);
  const blockState = buildPortfolioCommunityBlockStateFromBlocks(props.blocks);
  const heroBlock = getRenderableBlockByType(props.blocks, "portfolio.hero");
  const aboutBlock = getRenderableBlockByType(props.blocks, "portfolio.about");
  const educationBlock = getRenderableBlockByType(props.blocks, "portfolio.education");
  const experienceBlock = getRenderableBlockByType(props.blocks, "portfolio.experience");
  const workBlock = getRenderableBlockByType(props.blocks, "portfolio.work");
  const contactBlock = getRenderableBlockByType(props.blocks, "portfolio.contact");
  const customBlocks = getRenderableBlocksByType(props.blocks, "portfolio.custom-section");
  const semantics = derivePortfolioCommunitySemantics({
    profile: props.profile,
    version: props.version,
    blockConfigs: blockState.configs,
    visibility: blockState.visibility,
    sourcePackage,
  });

  return (
    <main
      className="w-full overflow-x-hidden"
      style={{
        background: iceBackgroundColor,
        color: inkColor,
        fontFamily: `var(--font-template-portfolio), ${sourcePackage.canvas.fontFamily}, ui-sans-serif, system-ui, sans-serif`,
      }}
    >
      <HeroSection
        semantics={semantics}
        sourcePackage={sourcePackage}
        block={heroBlock}
        renderHidden={Boolean(props.renderHiddenBlocks)}
      />
      <AboutSection semantics={semantics} block={aboutBlock} renderHidden={Boolean(props.renderHiddenBlocks)} />
      <EducationSection semantics={semantics} block={educationBlock} renderHidden={Boolean(props.renderHiddenBlocks)} />
      <ExperienceSection semantics={semantics} block={experienceBlock} renderHidden={Boolean(props.renderHiddenBlocks)} />
      <WorkSection semantics={semantics} block={workBlock} renderHidden={Boolean(props.renderHiddenBlocks)} />
      <CustomSections blocks={customBlocks} renderHidden={Boolean(props.renderHiddenBlocks)} />
      <ContactSection semantics={semantics} block={contactBlock} renderHidden={Boolean(props.renderHiddenBlocks)} />
    </main>
  );
}
