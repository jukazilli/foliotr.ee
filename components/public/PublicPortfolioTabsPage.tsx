import Link from "next/link";
import {
  ArrowLeft,
  BriefcaseBusiness,
  GraduationCap,
  Star,
  UserRound,
} from "lucide-react";
import { submitPublicReviewAction } from "@/app/[username]/review-actions";
import type {
  RenderablePageBlock,
  TemplateProfile,
} from "@/components/templates/types";
import {
  buildPortfolioCommunityBlockStateFromBlocks,
  derivePortfolioCommunitySemantics,
} from "@/lib/templates/portfolio-community-semantics";
import {
  readPortfolioCommunitySourcePackage,
  type PortfolioCommunitySourcePackage,
} from "@/lib/templates/source-package";
import type { VersionForBlocks } from "@/components/blocks/types";
import type { PublicReviewSummary } from "@/lib/server/domain/reviews";
import type { BehavioralAnalysisSnapshot } from "@/lib/vocational-test/public-analysis";

const fallbackSourcePackage: PortfolioCommunitySourcePackage = {
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
  imports: { default: {}, named: {} },
  svg: { paths: {}, named: {} },
  sourceFiles: {
    app: "",
    home: "",
    imageWithFallback: "",
    fontsCss: "",
    indexCss: "",
    themeCss: "",
  },
};

interface PublicPortfolioTabsPageProps {
  username: string;
  pageSlug?: string | null;
  blocks: RenderablePageBlock[];
  profile: TemplateProfile;
  version: VersionForBlocks;
  templateSourcePackage?: unknown;
  reviewSummary: PublicReviewSummary;
  behavioralAnalysis?: BehavioralAnalysisSnapshot | null;
}

function readSourcePackage(value: unknown): PortfolioCommunitySourcePackage {
  try {
    return readPortfolioCommunitySourcePackage(value);
  } catch {
    return fallbackSourcePackage;
  }
}

function Stars({ value }: { value: number }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, index) => (
        <Star
          key={index}
          className={`h-4 w-4 ${
            index < value ? "fill-yellow-400 text-yellow-500" : "text-[#03045E]/25"
          }`}
        />
      ))}
    </span>
  );
}

function ScoreList({
  title,
  items,
}: {
  title: string;
  items: Array<{ label: string; value: number }>;
}) {
  return (
    <div className="min-h-0 rounded-2xl border-2 border-[#03045E]/15 bg-white/70 p-4">
      <h3 className="text-sm font-extrabold uppercase tracking-[0.16em] text-[#03045E]/55">
        {title}
      </h3>
      <div className="mt-3 grid gap-2">
        {items.slice(0, 5).map((item) => (
          <div key={item.label} className="grid gap-1">
            <div className="flex items-center justify-between gap-3 text-sm font-bold">
              <span className="truncate">{item.label}</span>
              <span>{item.value}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-[#03045E]/10">
              <div
                className="h-full rounded-full bg-[#F5EE84]"
                style={{ width: `${Math.max(0, Math.min(100, item.value))}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function PublicPortfolioTabsPage({
  username,
  pageSlug,
  blocks,
  profile,
  version,
  templateSourcePackage,
  reviewSummary,
  behavioralAnalysis,
}: PublicPortfolioTabsPageProps) {
  const sourcePackage = readSourcePackage(templateSourcePackage);
  const blockState = buildPortfolioCommunityBlockStateFromBlocks(blocks);
  const semantics = derivePortfolioCommunitySemantics({
    profile,
    version,
    blockConfigs: blockState.configs,
    visibility: blockState.visibility,
    sourcePackage,
  });
  const returnPath = pageSlug ? `/${username}/${pageSlug}` : `/${username}`;
  const profileHref = `/${username}`;
  const hasPortfolio = semantics.work.items.length > 0;
  const hasResume =
    semantics.experience.items.length > 0 ||
    semantics.education.items.length > 0 ||
    profile.skills.length > 0;
  const tabs = [
    { id: "apresentacao", label: "Apresentação", visible: true },
    {
      id: "personalidade",
      label: "Personalidade",
      visible: Boolean(behavioralAnalysis),
    },
    { id: "portfolio", label: "Portfólio", visible: hasPortfolio },
    { id: "curriculo", label: "Currículo", visible: hasResume },
    { id: "reviews", label: "Reviews", visible: true },
  ].filter((tab) => tab.visible);
  const portrait = semantics.hero.portrait?.src;

  return (
    <main
      className="ft-tabs-shell h-screen overflow-hidden bg-[#F7F7F2] text-[#03045E]"
      style={{
        fontFamily: `var(--font-template-portfolio), ${sourcePackage.canvas.fontFamily}, ui-sans-serif, system-ui, sans-serif`,
      }}
    >
      <style>{`
        .ft-tab-panel { display: none; }
        .ft-tab-panel:target { display: block; }
        .ft-tab-panels:not(:has(.ft-tab-panel:target)) #apresentacao { display: block; }
      `}</style>

      <header className="flex h-[4.5rem] items-center gap-3 border-b-2 border-[#03045E]/10 bg-white/85 px-4 backdrop-blur sm:px-6">
        <Link
          href={profileHref}
          className="inline-flex h-10 shrink-0 items-center gap-2 rounded-full border-2 border-[#03045E] bg-[#F5EE84] px-3 text-sm font-extrabold text-[#03045E] shadow-[3px_3px_0_#03045E]"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Perfil
        </Link>
        <nav className="flex min-w-0 flex-1 gap-2 overflow-x-auto" aria-label="Seções">
          {tabs.map((tab) => (
            <a
              key={tab.id}
              href={`#${tab.id}`}
              className="inline-flex h-10 shrink-0 items-center rounded-full border-2 border-[#03045E]/15 bg-white px-4 text-sm font-extrabold text-[#03045E] transition hover:border-[#03045E] hover:bg-[#F5EE84]"
            >
              {tab.label}
            </a>
          ))}
        </nav>
      </header>

      <div className="ft-tab-panels h-[calc(100vh-4.5rem)] overflow-hidden">
        <section id="apresentacao" className="ft-tab-panel h-full">
          <div className="grid h-full min-h-0 gap-6 p-4 sm:p-6 lg:grid-cols-[0.92fr_1.08fr] lg:p-8">
            <div className="flex min-h-0 items-center justify-center">
              <div className="relative aspect-square w-full max-w-[24rem]">
                <div className="absolute inset-4 rounded-[42%] border-2 border-[#03045E]" />
                <div className="absolute inset-0 overflow-hidden rounded-[42%] bg-[#F5EE84] shadow-[10px_10px_0_#03045E]">
                  {portrait ? (
                    <img src={portrait} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <UserRound className="h-20 w-20 text-[#03045E]/35" />
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex min-h-0 flex-col justify-center overflow-hidden rounded-[2rem] border-2 border-[#03045E] bg-white p-6 shadow-[10px_10px_0_#F5EE84]">
              <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-[#03045E]/50">
                {semantics.hero.eyebrow}
              </p>
              <h1 className="mt-3 line-clamp-2 text-4xl font-extrabold leading-[0.95] tracking-[-0.06em] sm:text-5xl lg:text-6xl">
                {semantics.hero.displayName}
              </h1>
              <p className="mt-4 line-clamp-2 text-xl font-extrabold leading-tight text-[#474306] sm:text-2xl">
                {semantics.hero.headline}
              </p>
              {semantics.hero.locationLine ? (
                <p className="mt-3 text-sm font-bold text-[#03045E]/55">
                  {semantics.hero.locationLine}
                </p>
              ) : null}
              <p className="mt-6 line-clamp-[10] whitespace-pre-line text-base font-semibold leading-7 text-[#03045E]/72 lg:text-lg">
                {semantics.about.body}
              </p>
            </div>
          </div>
        </section>

        {behavioralAnalysis ? (
          <section id="personalidade" className="ft-tab-panel h-full">
            <div className="grid h-full min-h-0 gap-4 p-4 sm:p-6 lg:grid-cols-[1fr_1fr] lg:p-8">
              <div className="min-h-0 overflow-hidden rounded-[2rem] border-2 border-[#03045E] bg-white p-6 shadow-[8px_8px_0_#F5EE84]">
                <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-[#03045E]/50">
                  Personalidade
                </p>
                <h2 className="mt-3 text-4xl font-extrabold tracking-[-0.05em]">
                  {behavioralAnalysis.result.dominantArchetypeLabel}
                </h2>
                <p className="mt-4 line-clamp-[12] whitespace-pre-line text-sm font-semibold leading-6 text-[#03045E]/70 lg:text-base">
                  {behavioralAnalysis.aiReport || behavioralAnalysis.result.summary}
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  <span className="rounded-full border-2 border-[#03045E] bg-[#F5EE84] px-3 py-1 text-sm font-extrabold">
                    RIASEC {behavioralAnalysis.result.riasecCode}
                  </span>
                  <span className="rounded-full border-2 border-[#03045E]/15 bg-white px-3 py-1 text-sm font-extrabold">
                    Clareza {behavioralAnalysis.result.confidence}/100
                  </span>
                </div>
              </div>
              <div className="grid min-h-0 gap-4 overflow-hidden">
                <ScoreList
                  title="Big Five"
                  items={behavioralAnalysis.result.bigFive.ranking}
                />
                <ScoreList
                  title="RIASEC"
                  items={behavioralAnalysis.result.riasec.ranking}
                />
              </div>
            </div>
          </section>
        ) : null}

        {hasPortfolio ? (
          <section id="portfolio" className="ft-tab-panel h-full">
            <div className="grid h-full min-h-0 gap-4 p-4 sm:p-6 lg:grid-cols-3 lg:p-8">
              <div className="flex min-h-0 flex-col justify-center rounded-[2rem] border-2 border-[#03045E] bg-[#F5EE84] p-6 shadow-[8px_8px_0_#03045E]">
                <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-[#03045E]/60">
                  Portfólio
                </p>
                <h2 className="mt-3 text-4xl font-extrabold tracking-[-0.06em]">
                  {semantics.work.title}
                </h2>
                <p className="mt-4 line-clamp-6 text-sm font-bold leading-6 text-[#03045E]/70">
                  {semantics.work.intro}
                </p>
              </div>
              {semantics.work.items.slice(0, 5).map((item) => (
                <article
                  key={item.key}
                  className="min-h-0 overflow-hidden rounded-[2rem] border-2 border-[#03045E]/15 bg-white p-4 shadow-[6px_6px_0_#03045E]"
                >
                  {item.image ? (
                    <img
                      src={item.image}
                      alt=""
                      className="h-32 w-full rounded-2xl object-cover"
                    />
                  ) : null}
                  <h3 className="mt-4 line-clamp-2 text-xl font-extrabold tracking-[-0.03em]">
                    {item.title}
                  </h3>
                  <p className="mt-2 line-clamp-4 text-sm font-semibold leading-6 text-[#03045E]/65">
                    {item.description}
                  </p>
                  {item.href ? (
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex text-sm font-extrabold text-[#474306] underline"
                    >
                      Abrir projeto
                    </a>
                  ) : null}
                </article>
              ))}
            </div>
          </section>
        ) : null}

        {hasResume ? (
          <section id="curriculo" className="ft-tab-panel h-full">
            <div className="grid h-full min-h-0 gap-4 p-4 sm:p-6 lg:grid-cols-3 lg:p-8">
              <div className="min-h-0 overflow-hidden rounded-[2rem] border-2 border-[#03045E] bg-white p-5 shadow-[7px_7px_0_#F5EE84]">
                <div className="flex items-center gap-2">
                  <BriefcaseBusiness className="h-5 w-5" />
                  <h2 className="text-xl font-extrabold">Experiências</h2>
                </div>
                <div className="mt-4 grid gap-3">
                  {semantics.experience.items.slice(0, 4).map((item) => (
                    <article key={item.id} className="border-l-4 border-[#F5EE84] pl-3">
                      <h3 className="line-clamp-1 font-extrabold">{item.role}</h3>
                      <p className="line-clamp-1 text-sm font-bold text-[#03045E]/60">
                        {item.company} · {item.period}
                      </p>
                      <p className="mt-1 line-clamp-3 text-sm font-semibold leading-5 text-[#03045E]/65">
                        {item.description}
                      </p>
                    </article>
                  ))}
                </div>
              </div>
              <div className="min-h-0 overflow-hidden rounded-[2rem] border-2 border-[#03045E] bg-white p-5 shadow-[7px_7px_0_#F5EE84]">
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  <h2 className="text-xl font-extrabold">Formação</h2>
                </div>
                <div className="mt-4 grid gap-3">
                  {semantics.education.items.slice(0, 4).map((item) => (
                    <article key={item.id} className="border-l-4 border-[#F5EE84] pl-3">
                      <h3 className="line-clamp-1 font-extrabold">
                        {[item.degree, item.field].filter(Boolean).join(" · ") ||
                          item.institution}
                      </h3>
                      <p className="line-clamp-1 text-sm font-bold text-[#03045E]/60">
                        {item.institution} · {item.period}
                      </p>
                      <p className="mt-1 line-clamp-3 text-sm font-semibold leading-5 text-[#03045E]/65">
                        {item.description}
                      </p>
                    </article>
                  ))}
                </div>
              </div>
              <div className="min-h-0 overflow-hidden rounded-[2rem] border-2 border-[#03045E] bg-[#F5EE84] p-5 shadow-[7px_7px_0_#03045E]">
                <h2 className="text-xl font-extrabold">Habilidades</h2>
                <div className="mt-4 flex flex-wrap gap-2 overflow-hidden">
                  {profile.skills.slice(0, 24).map((skill) => (
                    <span
                      key={skill.id}
                      className="rounded-full border-2 border-[#03045E] bg-white px-3 py-1 text-sm font-extrabold"
                    >
                      {skill.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </section>
        ) : null}

        <section id="reviews" className="ft-tab-panel h-full">
          <div className="grid h-full min-h-0 gap-4 p-4 sm:p-6 lg:grid-cols-[0.9fr_1.1fr] lg:p-8">
            <div className="min-h-0 overflow-hidden rounded-[2rem] border-2 border-[#03045E] bg-white p-6 shadow-[8px_8px_0_#F5EE84]">
              <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-[#03045E]/50">
                Reviews
              </p>
              <div className="mt-4 flex items-end gap-3">
                <strong className="text-6xl font-extrabold tracking-[-0.06em]">
                  {reviewSummary.averageRating?.toFixed(1) ?? "-"}
                </strong>
                <span className="pb-2 text-sm font-bold text-[#03045E]/55">
                  {reviewSummary.count} publicada{reviewSummary.count === 1 ? "" : "s"}
                </span>
              </div>
              {reviewSummary.averageRating ? (
                <div className="mt-3">
                  <Stars value={Math.round(reviewSummary.averageRating)} />
                </div>
              ) : null}
              <div className="mt-5 grid gap-3">
                {reviewSummary.reviews.slice(0, 4).map((review) => (
                  <article
                    key={review.id}
                    className="rounded-2xl border-2 border-[#03045E]/10 bg-[#F7F7F2] p-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-extrabold">{review.reviewerName}</p>
                        {review.reviewerRole ? (
                          <p className="truncate text-xs font-bold text-[#03045E]/45">
                            {review.reviewerRole}
                          </p>
                        ) : null}
                      </div>
                      <Stars value={review.rating} />
                    </div>
                    <p className="mt-2 line-clamp-3 text-sm font-semibold leading-5 text-[#03045E]/65">
                      {review.description}
                    </p>
                  </article>
                ))}
              </div>
            </div>

            <form
              action={submitPublicReviewAction}
              className="grid min-h-0 gap-3 overflow-hidden rounded-[2rem] border-2 border-[#03045E] bg-[#F5EE84] p-5 shadow-[8px_8px_0_#03045E]"
            >
              <input type="hidden" name="username" value={username} />
              <input type="hidden" name="returnPath" value={returnPath} />
              <div className="hidden" aria-hidden="true">
                <label>
                  Site
                  <input name="website" tabIndex={-1} autoComplete="off" />
                </label>
              </div>
              <h2 className="text-2xl font-extrabold tracking-[-0.04em]">
                Deixe uma review
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  name="reviewerName"
                  required
                  minLength={2}
                  maxLength={120}
                  placeholder="Seu nome"
                  className="rounded-xl border-2 border-[#03045E] bg-white px-3 py-2 text-sm font-bold outline-none"
                />
                <input
                  name="reviewerRole"
                  maxLength={140}
                  placeholder="Cargo ou contexto"
                  className="rounded-xl border-2 border-[#03045E] bg-white px-3 py-2 text-sm font-bold outline-none"
                />
              </div>
              <input
                name="reviewerEmail"
                type="email"
                placeholder="Email opcional"
                className="rounded-xl border-2 border-[#03045E] bg-white px-3 py-2 text-sm font-bold outline-none"
              />
              <select
                name="rating"
                defaultValue="5"
                className="rounded-xl border-2 border-[#03045E] bg-white px-3 py-2 text-sm font-bold outline-none"
              >
                <option value="5">5 estrelas</option>
                <option value="4">4 estrelas</option>
                <option value="3">3 estrelas</option>
                <option value="2">2 estrelas</option>
                <option value="1">1 estrela</option>
              </select>
              <textarea
                name="description"
                required
                minLength={10}
                maxLength={500}
                placeholder="Como foi trabalhar com essa pessoa?"
                className="min-h-0 flex-1 rounded-xl border-2 border-[#03045E] bg-white px-3 py-2 text-sm font-bold leading-6 outline-none"
              />
              <button
                type="submit"
                className="h-11 rounded-full border-2 border-[#03045E] bg-white px-5 text-sm font-extrabold text-[#03045E] shadow-[4px_4px_0_#03045E]"
              >
                Enviar review
              </button>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}
