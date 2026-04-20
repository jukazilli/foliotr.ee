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
}: {
  id: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={`mx-auto w-full max-w-[1180px] px-5 sm:px-8 lg:px-10 ${className}`}>
      {children}
    </section>
  );
}

function HeroPortrait({
  semantics,
  sourcePackage,
}: {
  semantics: PortfolioCommunitySemantics;
  sourcePackage: PortfolioCommunitySourcePackage;
}) {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[34rem] lg:mx-0">
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
                    maskImage: `url('${sourcePackage.imports.named.imgUnsplashD1UPkiFd04A}')`,
                    maskSize: "cover",
                    maskRepeat: "no-repeat",
                  }
                : undefined
            }
          />
        ) : null}
      </div>
      <PlusCluster className="absolute -right-4 top-8 hidden sm:block" />
      <SlashMarks className="absolute -bottom-5 left-8" />
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
      <p className="max-w-full break-words text-2xl font-semibold leading-tight tracking-wide md:text-[1.7rem]">
        {semantics.hero.displayName}
      </p>

      <div className="flex flex-wrap items-center gap-x-8 gap-y-3 text-lg md:justify-end">
        <a href="#top" className="transition hover:opacity-70">
          Home
        </a>
        {semantics.about.visible ? (
          <a href="#about" className="transition hover:opacity-70">
            About
          </a>
        ) : null}
        {semantics.work.visible ? (
          <a href="#work" className="transition hover:opacity-70">
            Work
          </a>
        ) : null}
        <div className="flex items-center gap-6 text-[#03045E]">
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
}: {
  semantics: PortfolioCommunitySemantics;
  sourcePackage: PortfolioCommunitySourcePackage;
}) {
  if (!semantics.hero.visible) return null;

  return (
    <>
      <div style={{ background: sourcePackage.canvas.background }}>
        <SectionShell id="top" className="pb-0 pt-28 sm:pt-32">
          <HeaderNav semantics={semantics} sourcePackage={sourcePackage} />

          <div className="grid items-end gap-12 pt-16 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,32rem)] lg:gap-16 lg:pt-24">
            <div className="min-w-0 pb-14 lg:pb-20">
              <p
                className="mb-5 break-words font-medium leading-tight"
                style={{ fontSize: "clamp(1.35rem, 3.2vw, 2rem)" }}
              >
                {semantics.hero.eyebrow} {semantics.hero.firstName},
              </p>
              <h1
                className="max-w-[13ch] break-words font-extrabold leading-[0.98] tracking-[-0.08em]"
                style={{ fontSize: "clamp(3.6rem, 8vw, 6.75rem)" }}
              >
                {semantics.hero.headline}
              </h1>
              {semantics.hero.locationLine ? (
                <p
                  className="mt-6 break-words font-medium leading-tight"
                  style={{ fontSize: "clamp(1.25rem, 3vw, 2rem)" }}
                >
                  {semantics.hero.locationLine}
                </p>
              ) : null}
            </div>

            <div className="relative z-10 -mb-16 sm:-mb-20 lg:-mb-24">
              <HeroPortrait semantics={semantics} sourcePackage={sourcePackage} />
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
    </>
  );
}

function AboutSection({ semantics }: { semantics: PortfolioCommunitySemantics }) {
  if (!semantics.about.visible) return null;

  return (
    <SectionShell id="about" className="py-16 lg:py-24">
      <SectionTitle>{semantics.about.title}</SectionTitle>
      <p className="mt-8 max-w-[58rem] whitespace-pre-line break-words text-xl leading-[1.8] md:text-2xl">
        {semantics.about.body}
      </p>
    </SectionShell>
  );
}

function ExperienceSection({ semantics }: { semantics: PortfolioCommunitySemantics }) {
  if (!semantics.experience.visible || semantics.experience.items.length === 0) return null;

  return (
    <SectionShell id="experience" className="py-16 lg:py-24">
      <h2 className="sr-only">{semantics.experience.title}</h2>
      <div className="mx-auto max-w-[58rem] space-y-12">
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

function WorkSection({ semantics }: { semantics: PortfolioCommunitySemantics }) {
  if (!semantics.work.visible) return null;

  return (
    <SectionShell id="work" className="py-16 lg:py-24">
      <SectionTitle>{semantics.work.title}</SectionTitle>
      {semantics.work.intro ? (
        <p className="mt-8 max-w-[58rem] whitespace-pre-line break-words text-xl leading-[1.8] md:text-2xl">
          {semantics.work.intro}
        </p>
      ) : null}

      <div className="mt-16 grid gap-12 lg:grid-cols-2 lg:gap-20">
        {semantics.work.items.slice(0, semantics.work.maxItems).map((item) => {
          const content = (
            <>
              <div className="aspect-[7/5] w-full overflow-hidden bg-[#F5EE84]">
                {item.image ? (
                  <img alt={item.title} className="h-full w-full object-cover" src={item.image} />
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

function ContactSection({ semantics }: { semantics: PortfolioCommunitySemantics }) {
  if (!semantics.contact.visible) return null;

  return (
    <SectionShell id="contact" className="py-16 lg:py-28">
      <SectionTitle>{semantics.contact.title}</SectionTitle>
      <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(18rem,27rem)_minmax(0,1fr)] lg:gap-16">
        <div className="aspect-[7/5] w-full overflow-hidden bg-[#F5EE84]">
          {semantics.contact.supportImage ? (
            <img alt="" className="h-full w-full object-cover" src={semantics.contact.supportImage} />
          ) : null}
        </div>
        <div className="min-w-0">
          <p className="whitespace-pre-line break-words text-xl leading-[1.8] md:text-2xl">
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

export default function PortfolioCommunityRenderer(props: TemplateRendererProps) {
  const sourcePackage = readSourcePackage(props.templateSourcePackage);
  const blockState = buildPortfolioCommunityBlockStateFromBlocks(props.blocks);
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
      <HeroSection semantics={semantics} sourcePackage={sourcePackage} />
      <AboutSection semantics={semantics} />
      <ExperienceSection semantics={semantics} />
      <WorkSection semantics={semantics} />
      <ContactSection semantics={semantics} />
    </main>
  );
}
