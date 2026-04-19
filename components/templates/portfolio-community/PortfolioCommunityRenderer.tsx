import {
  buildPortfolioCommunityBlockStateFromBlocks,
  derivePortfolioCommunitySemantics,
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
      className="overflow-x-auto"
      style={{
        background: sourcePackage.canvas.background,
        color: "#03045E",
        fontFamily: `var(--font-template-portfolio), ${sourcePackage.canvas.fontFamily}, ui-sans-serif, system-ui, sans-serif`,
      }}
    >
      <div
        className="relative mx-auto"
        style={{
          width: `${sourcePackage.canvas.width}px`,
          minWidth: `${sourcePackage.canvas.width}px`,
          height: `${sourcePackage.canvas.height}px`,
        }}
      >
        {semantics.hero.visible ? (
          <>
            <p className="absolute left-[97px] top-[34px] text-[24px] font-semibold leading-none">
              {semantics.hero.displayName}
            </p>
            <p className="absolute left-[97px] top-[288px] text-[28px] font-medium leading-none">
              {semantics.hero.eyebrow} {semantics.hero.firstName},
            </p>
            <div className="absolute left-[97px] top-[561px] flex w-[616px] -translate-y-full flex-col justify-end">
              <p className="text-[100px] font-extrabold leading-[116px]">
                {semantics.hero.headline}
              </p>
            </div>
            <p className="absolute left-[97px] top-[571px] text-[28px] font-medium leading-none">
              {semantics.hero.locationLine}
            </p>

            <a
              href={semantics.hero.ctaHref}
              className="absolute left-[97px] top-[650px] block h-[68px] w-[164px] text-[#474306]"
            >
              <div className="absolute left-[6px] top-[7px] h-[61px] w-[158px] rounded-[6px] bg-[#F5EE84]" />
              <div className="absolute left-0 top-0 h-[61px] w-[158px] rounded-[6px] border border-[#474306]" />
              <p className="absolute left-[38px] top-[16px] text-[20px] font-normal leading-none">
                {semantics.hero.ctaLabel}
              </p>
            </a>

            <div className="absolute left-[582px] top-[37px] text-[18px] font-normal leading-none">
              <p className="absolute left-0 top-0 whitespace-nowrap">Home</p>
              <p className="absolute left-[115px] top-0 whitespace-nowrap">About</p>
              <p className="absolute left-[230px] top-0 whitespace-nowrap">Work</p>
            </div>

            <div className="absolute left-[1201px] top-[41px] flex items-center gap-[29px] text-[#03045E]">
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

            <div className="absolute left-[1246px] top-[174px]">
              {[
                { left: 9, top: 16 },
                { left: 35, top: 32 },
                { left: 35, top: 0 },
              ].map((position, index) => (
                <div
                  key={index}
                  className="absolute"
                  style={{ left: `${position.left}px`, top: `${position.top}px` }}
                >
                  <div className="absolute left-[9px] top-0 h-[24px] w-[6px] rounded-[6px] bg-[#474306]" />
                  <div className="absolute left-0 top-[9px] h-[6px] w-[24px] rounded-[6px] bg-[#474306]" />
                </div>
              ))}
            </div>

            <div className="absolute left-[831px] top-[191px] h-[509px] w-[506px]">
              <div className="absolute left-[13px] top-0 h-[493px] w-[493px] overflow-hidden">
                {semantics.hero.portrait ? (
                  <img
                    alt={semantics.hero.portrait.alt || semantics.hero.displayName}
                    className="absolute left-[13px] top-0 h-[532px] w-[493px] object-cover"
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
              <svg
                className="absolute left-0 top-[16px] h-[493px] w-[493px]"
                fill="none"
                preserveAspectRatio="none"
                viewBox="0 0 493 493"
              >
                {sourcePackage.svg.paths.p2786d00 ? (
                  <path d={sourcePackage.svg.paths.p2786d00} stroke="#474306" />
                ) : null}
              </svg>
            </div>

            {[823, 844.77, 866.54, 888.31, 910.08].map((leftValue, index) => (
              <div
                key={index}
                className="absolute top-[564px] h-[30px] w-[5px] rotate-[24deg] bg-[#474306]"
                style={{ left: `${leftValue}px` }}
              />
            ))}
          </>
        ) : null}

        {semantics.about.visible ? (
          <>
            <div className="absolute left-[97px] top-[1105px] flex -translate-y-full flex-col justify-end">
              <p className="text-[100px] font-extrabold leading-[116px] text-[#F7F197]">
                {semantics.about.title}
              </p>
            </div>
            <p className="absolute left-[97px] top-[1137px] w-[900px] whitespace-pre-line text-[24px] leading-[44px]">
              {semantics.about.body}
            </p>
          </>
        ) : null}

        {semantics.experience.visible
          ? [
              { dateTop: 1414, bodyTop: 1464, dotTop: 1427 },
              { dateTop: 1676, bodyTop: 1726, dotTop: 1689 },
              { dateTop: 1938, bodyTop: 1988, dotTop: 1951 },
            ]
              .map((slot, index) => {
                const experience = semantics.experience.items[index];
                if (!experience) return null;

                return (
                  <div key={experience.id}>
                    <div
                      className="absolute left-[353px] h-[13px] w-[13px] rounded-full bg-[#03045E]"
                      style={{ top: `${slot.dotTop}px` }}
                    />
                    <p
                      className="absolute left-[384px] text-[24px] font-semibold leading-[40px]"
                      style={{ top: `${slot.dateTop}px` }}
                    >
                      {experience.period}
                    </p>
                    <p
                      className="absolute left-[384px] w-[900px] whitespace-pre-line text-[24px] leading-[44px]"
                      style={{ top: `${slot.bodyTop}px` }}
                    >
                      {experience.description}
                    </p>
                  </div>
                );
              })
          : null}

        {semantics.work.visible ? (
          <>
            <div className="absolute left-[97px] top-[2419px] flex -translate-y-full flex-col justify-end">
              <p className="text-[100px] font-extrabold leading-[116px] text-[#F7F197]">
                {semantics.work.title}
              </p>
            </div>
            <p className="absolute left-[97px] top-[2451px] w-[900px] whitespace-pre-line text-[24px] leading-[44px]">
              {semantics.work.intro}
            </p>
            {[
              { left: 97, imageTop: 2707, dateTop: 3107, titleTop: 3151, bodyTop: 3195 },
              { left: 777, imageTop: 2707, dateTop: 3107, titleTop: 3151, bodyTop: 3195 },
            ].map((slot, index) => {
              const item = semantics.work.items[index];
              if (!item) return null;

              return (
                <div key={item.key}>
                  <div
                    className="absolute h-[400px] w-[560px] overflow-hidden bg-[#F5EE84]"
                    style={{ left: `${slot.left}px`, top: `${slot.imageTop}px` }}
                  >
                    {item.image ? (
                      <img alt={item.title} className="h-full w-full object-cover" src={item.image} />
                    ) : null}
                  </div>
                  <p
                    className="absolute text-[15px] italic leading-[44px]"
                    style={{ left: `${slot.left}px`, top: `${slot.dateTop}px` }}
                  >
                    {item.date}
                  </p>
                  <p
                    className="absolute text-[24px] font-semibold leading-[44px]"
                    style={{ left: `${slot.left}px`, top: `${slot.titleTop}px` }}
                  >
                    {item.title}
                  </p>
                  <p
                    className="absolute w-[560px] whitespace-pre-line text-[18px] leading-[32px]"
                    style={{ left: `${slot.left}px`, top: `${slot.bodyTop}px` }}
                  >
                    {item.description}
                  </p>
                </div>
              );
            })}
          </>
        ) : null}

        {semantics.contact.visible ? (
          <>
            <div className="absolute left-[97px] top-[3531px] flex -translate-y-full flex-col justify-end">
              <p className="text-[100px] font-extrabold leading-[116px] text-[#F7F197]">
                {semantics.contact.title}
              </p>
            </div>
            <div className="absolute left-[97px] top-[3580px] h-[314px] w-[440px] overflow-hidden bg-[#F5EE84]">
              {semantics.contact.supportImage ? (
                <img alt="" className="h-full w-full object-cover" src={semantics.contact.supportImage} />
              ) : null}
            </div>
            <p className="absolute left-[596px] top-[3572px] w-[640px] whitespace-pre-line text-[24px] leading-[44px]">
              {semantics.contact.body}
            </p>
            {semantics.contact.publicEmail ? (
              <p className="absolute left-[596px] top-[3769px] whitespace-nowrap text-[24px] leading-[44px]">
                {semantics.contact.publicEmail}
              </p>
            ) : null}
            {semantics.contact.displayLinks[0] ? (
              <p className="absolute left-[596px] top-[3813px] whitespace-nowrap text-[24px] leading-[44px]">
                {semantics.contact.displayLinks[0]}
              </p>
            ) : null}
            {semantics.contact.displayLinks[1] ? (
              <p className="absolute left-[596px] top-[3857px] whitespace-nowrap text-[24px] leading-[44px]">
                {semantics.contact.displayLinks[1]}
              </p>
            ) : null}
          </>
        ) : null}
      </div>
    </main>
  );
}
