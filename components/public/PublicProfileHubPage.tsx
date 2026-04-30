import Link from "next/link";
import { BriefcaseBusiness, Edit3, MapPin, Star, UserRound } from "lucide-react";
import { EditableProfileCover } from "@/components/public/EditableProfileCover";
import { PublicPortfolioCarousel } from "@/components/public/PublicPortfolioCarousel";
import { PublicReviewComposer } from "@/components/public/PublicReviewComposer";
import PublicReviewsSection from "@/components/public/PublicReviewsSection";
import { BehavioralAnalysisSection } from "@/components/vocation/BehavioralAnalysisSection";
import type { PublicReviewSummary } from "@/lib/server/domain/reviews";
import type { PublicProfileHub } from "@/lib/server/domain/public-pages";
import { readVersionProfileSnapshot } from "@/lib/server/domain/page-snapshots";
import { selectBehavioralAnalysis } from "@/lib/vocational-test/public-analysis";

const softSurfaceStyle = {
  borderColor: "#e5e7eb",
  boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
};

interface PublicProfileHubPageProps {
  username: string;
  hub: NonNullable<PublicProfileHub>;
  reviewSummary: PublicReviewSummary;
  isOwner?: boolean;
  embedded?: boolean;
}

type HubVersion = PublicProfileHubPageProps["hub"]["versions"][number];
type HubPage = HubVersion["pages"][number];

function getPortfolioTitle(version: HubVersion, page: HubPage) {
  return page.title || version.customHeadline || version.name;
}

function getPortfolioDescription(version: HubVersion) {
  return version.description || version.context || version.customBio || null;
}

function getPortfolioCover(version: HubVersion) {
  return readVersionProfileSnapshot(version.profileSnapshot)?.bannerUrl ?? null;
}

function getPortfolioExperience(version: HubVersion) {
  const snapshot = readVersionProfileSnapshot(version.profileSnapshot);
  return (
    snapshot?.experiences?.find((experience) => experience.current) ??
    snapshot?.experiences?.[0] ??
    null
  );
}

function getWorkLine(args: {
  currentExperience?: { role: string | null; company: string | null } | null;
  headline?: string | null;
}) {
  if (args.currentExperience?.role && args.currentExperience.company) {
    return `Trabalhando na ${args.currentExperience.company} como ${args.currentExperience.role}`;
  }

  if (args.currentExperience?.role) {
    return `Trabalhando como ${args.currentExperience.role}`;
  }

  return args.headline ?? null;
}

function getOpportunityLine(args: {
  openToOpportunities: boolean;
  showOpportunityMotivation: boolean;
  opportunityMotivation?: string | null;
}) {
  if (!args.openToOpportunities) return null;

  if (args.showOpportunityMotivation && args.opportunityMotivation) {
    const motivation = args.opportunityMotivation
      .trim()
      .replace(/^uma oportunidade\s+(na\s+[áa]rea\s+de\s+)/i, "$1");

    return `Aberto a oportunidades ${motivation}`;
  }

  return "Aberto a oportunidades";
}

export default function PublicProfileHubPage({
  username,
  hub,
  reviewSummary,
  isOwner = false,
  embedded = false,
}: PublicProfileHubPageProps) {
  const displayName = hub.displayName || username;
  const currentExperience = hub.experiences.find((experience) => experience.current);
  const workLine = getWorkLine({
    currentExperience,
    headline: hub.headline,
  });
  const opportunityLine = getOpportunityLine({
    openToOpportunities: hub.openToOpportunities,
    showOpportunityMotivation: hub.showOpportunityMotivation,
    opportunityMotivation: hub.opportunityMotivation,
  });
  const hasBio = Boolean(hub.bio);
  const showBioInPersonalData = !isOwner && hasBio;
  const showOwnerBioCard = isOwner;
  const publishedItems = hub.versions.flatMap((version) =>
    version.pages.map((page) => {
      const portfolioExperience = getPortfolioExperience(version);

      return {
        id: page.id,
        href: `/${username}/${page.slug}`,
        resumeHref:
          version.resumeConfig?.publishState === "PUBLISHED"
            ? `/${username}/${page.slug}/resume`
            : null,
        title: getPortfolioTitle(version, page),
        description: getPortfolioDescription(version),
        coverUrl: getPortfolioCover(version),
        role: portfolioExperience?.role ?? version.customHeadline ?? page.title,
        company: portfolioExperience?.company ?? null,
        isDefault: version.isDefault,
      };
    })
  );
  const behavioralAnalysis = selectBehavioralAnalysis(
    hub.user.vocationalTests,
    "profile"
  );

  return (
    <div
      className={
        embedded ? "text-neutral-950" : "min-h-screen bg-[#f2f4f7] text-neutral-950"
      }
    >
      <main
        className={
          embedded
            ? "mx-auto grid w-full max-w-[1680px] gap-x-5 gap-y-6 sm:gap-y-7 lg:grid-cols-[repeat(24,minmax(0,1fr))]"
            : "mx-auto grid w-full max-w-[1680px] gap-x-5 gap-y-6 px-4 py-5 sm:gap-y-7 sm:px-6 lg:grid-cols-[repeat(24,minmax(0,1fr))] lg:px-8"
        }
      >
        <section
          className="overflow-hidden rounded-b-2xl border bg-white lg:col-span-full"
          style={softSurfaceStyle}
        >
          <div className="relative">
            <EditableProfileCover
              bannerUrl={hub.bannerUrl}
              bannerPositionX={hub.bannerPositionX}
              bannerPositionY={hub.bannerPositionY}
              bannerScale={hub.bannerScale}
              isOwner={isOwner}
            />
            <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full border bg-white/90 px-3 py-2 text-xs font-bold text-neutral-900 backdrop-blur">
              <span className="font-extrabold">
                {reviewSummary.averageRating?.toFixed(1) ?? "-"}
              </span>
              <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-500" aria-hidden />
              <span className="hidden text-neutral-600 sm:inline">
                {reviewSummary.count
                  ? `${reviewSummary.count} publicada${
                      reviewSummary.count === 1 ? "" : "s"
                    }`
                  : "sem reviews"}
              </span>
            </div>
            {isOwner ? (
              <Link
                href="/profile"
                className="absolute right-4 top-4 inline-flex h-10 items-center gap-0 rounded-full border bg-white px-3 text-sm font-bold text-neutral-900 transition hover:border-neutral-950 sm:gap-2 sm:px-4"
                style={{
                  borderColor: "#d4d4d4",
                  boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
                }}
                aria-label="Editar perfil"
              >
                <Edit3 className="h-4 w-4" aria-hidden />
                <span className="hidden sm:inline">Editar perfil</span>
              </Link>
            ) : null}
          </div>

          <div className="relative z-10 -mt-24 bg-transparent px-5 pb-5 pt-0 sm:-mt-28 sm:px-8 sm:pb-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
              <div
                className="relative z-20 flex h-36 w-36 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-neutral-100 sm:h-40 sm:w-40"
                style={{ boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)" }}
              >
                {hub.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={hub.avatarUrl}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <UserRound className="h-12 w-12 text-neutral-500" aria-hidden />
                )}
              </div>

              <div className="pb-2 sm:pb-3">
                <p className="text-sm font-bold text-neutral-500">@{username}</p>
                <h1 className="mt-1 text-3xl font-extrabold tracking-[-0.03em] sm:text-4xl">
                  {displayName}
                </h1>
                {hub.headline ? (
                  <p className="mt-2 max-w-2xl text-base font-semibold leading-7 text-neutral-700">
                    {hub.headline}
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        </section>

        <section
          className="rounded-xl border border-[#dddfe2] bg-white p-3 shadow-[0_1px_2px_rgb(0_0_0/0.16)] sm:p-4 lg:col-span-full"
          aria-label="Meus Portfólios"
        >
          <div className="mb-3 flex items-center justify-between gap-4">
            <h2 className="text-xl font-bold tracking-[-0.02em] text-[#050505] sm:text-2xl">
              Meus Portfólios
            </h2>
            {behavioralAnalysis ? (
              <span className="rounded-full bg-[#f0f2f5] px-3 py-1 text-xs font-bold text-[#65676b]">
                teste público
              </span>
            ) : null}
          </div>
          <PublicPortfolioCarousel items={publishedItems} />
        </section>

        <section
          className="mt-3 grid gap-5 lg:col-span-full lg:mt-4 lg:grid-cols-[minmax(320px,0.82fr)_minmax(360px,1.18fr)] lg:gap-6"
          aria-label="Resumo e review"
        >
          <section className="rounded-xl border border-[#dddfe2] bg-white p-5 shadow-[0_1px_2px_rgb(0_0_0/0.16)]">
            <div className="flex items-start justify-between gap-4">
              <h2 className="text-2xl font-bold tracking-[-0.02em] text-[#050505]">
                Dados pessoais
              </h2>
              {isOwner ? (
                <Link
                  href="/profile"
                  className="grid h-9 w-9 place-items-center rounded-full text-[#65676b] transition hover:bg-[#f0f2f5]"
                  aria-label="Editar dados pessoais"
                >
                  <Edit3 className="h-5 w-5" aria-hidden />
                </Link>
              ) : null}
            </div>

            <div className="mt-5 grid gap-4 text-[15px] font-normal leading-6 text-[#050505]">
              {showBioInPersonalData ? (
                <p className="whitespace-pre-line">{hub.bio}</p>
              ) : null}
              {hub.location ? (
                <span className="inline-flex items-center gap-3">
                  <MapPin className="h-6 w-6 text-[#65676b]" aria-hidden />
                  {hub.location}
                </span>
              ) : null}
              {workLine ? (
                <span className="inline-flex items-center gap-3">
                  <BriefcaseBusiness
                    className="h-6 w-6 text-[#65676b]"
                    aria-hidden
                  />
                  {workLine}
                </span>
              ) : null}
              {opportunityLine ? (
                <div className="rounded-lg bg-[#f0f2f5] px-4 py-3">
                  {opportunityLine}
                </div>
              ) : null}
            </div>
          </section>

          {showOwnerBioCard ? (
            <section className="rounded-xl border border-[#dddfe2] bg-white p-5 shadow-[0_1px_2px_rgb(0_0_0/0.16)]">
              <div className="flex items-start justify-between gap-4">
                <h2 className="text-2xl font-bold tracking-[-0.02em] text-[#050505]">
                  Bio
                </h2>
                <Link
                  href="/profile"
                  className="grid h-9 w-9 place-items-center rounded-full text-[#65676b] transition hover:bg-[#f0f2f5]"
                  aria-label="Editar bio"
                >
                  <Edit3 className="h-5 w-5" aria-hidden />
                </Link>
              </div>
              <p className="mt-5 whitespace-pre-line text-[15px] font-normal leading-6 text-[#050505]">
                {hub.bio || "Adicione uma bio curta em Dados pessoais."}
              </p>
            </section>
          ) : isOwner ? null : (
            <PublicReviewComposer
              username={username}
              returnPath={`/${username}`}
              avatarUrl={hub.avatarUrl}
              displayName={displayName}
            />
          )}
        </section>

        {behavioralAnalysis ? (
          <section className="grid gap-3 lg:col-span-full">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-neutral-500">
                Teste comportamental
              </p>
              <h2 className="mt-1 text-2xl font-extrabold tracking-[-0.03em]">
                Como costumo trabalhar
              </h2>
            </div>
            <BehavioralAnalysisSection analysis={behavioralAnalysis} compact />
          </section>
        ) : null}

        <div id="reviews" className="mt-3 lg:col-span-full lg:mt-4">
          <PublicReviewsSection summary={reviewSummary} />
        </div>
      </main>

      {embedded ? null : (
        <footer className="border-t border-black/10 py-6 text-center">
          <Link
            href="/"
            className="text-xs text-neutral-500 transition-colors hover:text-neutral-800"
          >
            Criado com <span className="font-semibold">LINKFOLIO</span>
          </Link>
        </footer>
      )}
    </div>
  );
}
