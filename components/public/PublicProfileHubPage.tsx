import Link from "next/link";
import {
  ArrowUpRight,
  BriefcaseBusiness,
  Edit3,
  MapPin,
  MessageSquareText,
  Star,
  UserRound,
} from "lucide-react";
import { EditableProfileCover } from "@/components/public/EditableProfileCover";
import { PublicPortfolioCarousel } from "@/components/public/PublicPortfolioCarousel";
import PublicReviewsSection from "@/components/public/PublicReviewsSection";
import type { PublicReviewSummary } from "@/lib/server/domain/reviews";
import type { PublicProfileHub } from "@/lib/server/domain/public-pages";
import { selectBehavioralAnalysis } from "@/lib/vocational-test/public-analysis";
import { BehavioralAnalysisSection } from "@/components/vocation/BehavioralAnalysisSection";

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

function calculateAge(value: Date | string | null) {
  if (!value) return null;
  const birthDate = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(birthDate.getTime())) return null;

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age -= 1;
  }

  return age >= 0 ? age : null;
}

function getPortfolioTitle(
  version: PublicProfileHubPageProps["hub"]["versions"][number],
  page: PublicProfileHubPageProps["hub"]["versions"][number]["pages"][number]
) {
  return page.title || version.customHeadline || version.name;
}

function getPortfolioDescription(
  version: PublicProfileHubPageProps["hub"]["versions"][number]
) {
  return version.description || version.context || version.customBio || null;
}

function ProfileCard({
  title,
  children,
  className = "",
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-2xl border bg-white p-5 ${className}`}
      style={softSurfaceStyle}
    >
      <h2 className="text-base font-extrabold text-neutral-950">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export default function PublicProfileHubPage({
  username,
  hub,
  reviewSummary,
  isOwner = false,
  embedded = false,
}: PublicProfileHubPageProps) {
  const displayName = hub.displayName || username;
  const defaultPresentation =
    hub.presentations.find((item) => item.id === hub.defaultPresentationId) ??
    hub.presentations[0] ??
    null;
  const age = calculateAge(hub.birthDate);
  const isWorking = hub.experiences.some((experience) => experience.current);
  const currentExperience = hub.experiences.find((experience) => experience.current);
  const publishedItems = hub.versions.flatMap((version) =>
    version.pages.map((page) => ({
      id: page.id,
      href: `/${username}/${page.slug}`,
      resumeHref:
        version.resumeConfig?.publishState === "PUBLISHED"
          ? `/${username}/${page.slug}/resume`
          : null,
      title: getPortfolioTitle(version, page),
      description: getPortfolioDescription(version),
      templateName: page.template.name,
      isDefault: version.isDefault,
    }))
  );
  const primaryPortfolioItem =
    publishedItems.find((item) => item.isDefault) ?? publishedItems[0] ?? null;
  const behavioralAnalysis = selectBehavioralAnalysis(
    hub.user.vocationalTests,
    "portfolio"
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
            ? "mx-auto grid w-full max-w-[1680px] gap-5 lg:grid-cols-[repeat(24,minmax(0,1fr))]"
            : "mx-auto grid w-full max-w-[1680px] gap-5 px-4 py-5 sm:px-6 lg:grid-cols-[repeat(24,minmax(0,1fr))] lg:px-8"
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
              isOwner={isOwner}
            />
            {isOwner ? (
              <Link
                href="/profile"
                className="absolute right-4 top-4 inline-flex h-10 items-center gap-2 rounded-full border bg-white px-4 text-sm font-bold text-neutral-900 transition hover:border-neutral-950"
                style={{
                  borderColor: "#d4d4d4",
                  boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
                }}
              >
                <Edit3 className="h-4 w-4" aria-hidden />
                Editar perfil
              </Link>
            ) : null}
          </div>

          <div className="relative z-10 bg-white px-5 pb-6 pt-6 sm:px-8 sm:pb-8 sm:pt-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div
                  className="relative z-20 -mt-8 flex h-36 w-36 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-neutral-100 sm:-mt-12 sm:h-40 sm:w-40"
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

                <div className="sm:pt-2">
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

              {isOwner ? (
                <Link
                  href="/portfolios"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-neutral-950 px-4 text-sm font-bold text-white transition hover:bg-neutral-800"
                >
                  Gerenciar portfólios
                  <ArrowUpRight className="h-4 w-4" aria-hidden />
                </Link>
              ) : null}
            </div>
          </div>
        </section>

        <section
          className="grid gap-4 lg:col-span-full lg:grid-cols-[repeat(24,minmax(0,1fr))]"
          aria-label="Resumo do perfil"
        >
          <ProfileCard title="Sobre" className="lg:col-span-8">
            <div className="space-y-3 text-sm font-semibold leading-6 text-neutral-700">
              {defaultPresentation?.body || hub.bio ? (
                <p className="whitespace-pre-line">
                  {defaultPresentation?.body ?? hub.bio}
                </p>
              ) : (
                <p>Perfil em construção.</p>
              )}

              <div className="grid gap-2 pt-2">
                {hub.location ? (
                  <span className="inline-flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-neutral-500" aria-hidden />
                    {hub.location}
                  </span>
                ) : null}
                {age !== null ? <span>{age} anos</span> : null}
                <span className="inline-flex items-center gap-2">
                  <BriefcaseBusiness className="h-4 w-4 text-neutral-500" aria-hidden />
                  {isWorking ? "Trabalhando no momento" : "Disponível no momento"}
                </span>
                {currentExperience ? (
                  <span>
                    Atualmente: {currentExperience.role}
                    {currentExperience.company
                      ? ` em ${currentExperience.company}`
                      : ""}
                  </span>
                ) : null}
              </div>

              <div className="rounded-xl bg-neutral-50 p-3">
                <p className="font-extrabold text-neutral-950">
                  {hub.openToOpportunities
                    ? "Aberto a oportunidades"
                    : "Sem busca ativa"}
                </p>
                {hub.showOpportunityMotivation && hub.opportunityMotivation ? (
                  <p className="mt-2 whitespace-pre-line">
                    {hub.opportunityMotivation}
                  </p>
                ) : null}
              </div>
            </div>
          </ProfileCard>

          <ProfileCard
            title={primaryPortfolioItem?.title ?? "Portfólio"}
            className="lg:col-span-8"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-semibold text-neutral-600">
                  {publishedItems.length} ativo
                  {publishedItems.length === 1 ? "" : "s"}
                </span>
                {behavioralAnalysis ? (
                  <span className="rounded-full bg-lime-100 px-3 py-1 text-xs font-extrabold text-lime-900">
                    teste público
                  </span>
                ) : null}
              </div>
              <PublicPortfolioCarousel items={publishedItems} />
            </div>
          </ProfileCard>

          <ProfileCard title="Reviews" className="lg:col-span-8">
            <div className="space-y-3">
              <div className="flex items-end gap-2">
                <span className="text-4xl font-extrabold">
                  {reviewSummary.averageRating?.toFixed(1) ?? "-"}
                </span>
                <span className="pb-1 text-sm font-semibold text-neutral-500">
                  {reviewSummary.count
                    ? `${reviewSummary.count} publicada${
                        reviewSummary.count === 1 ? "" : "s"
                      }`
                    : "sem reviews"}
                </span>
              </div>
              {reviewSummary.averageRating ? (
                <span className="inline-flex items-center gap-1 text-yellow-500">
                  <Star className="h-4 w-4 fill-yellow-400" aria-hidden />
                  média das avaliações
                </span>
              ) : null}
              <a
                href="#reviews"
                className="inline-flex items-center gap-2 text-sm font-extrabold text-neutral-950"
              >
                <MessageSquareText className="h-4 w-4" aria-hidden />
                Ver ou enviar review
              </a>
            </div>
          </ProfileCard>
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
      </main>

      <div id="reviews">
        <PublicReviewsSection
          username={username}
          returnPath={`/${username}`}
          summary={reviewSummary}
          canSubmit={!isOwner}
        />
      </div>

      {embedded ? null : (
        <footer className="border-t border-black/10 py-6 text-center">
          <Link
            href="/"
            className="text-xs text-neutral-500 transition-colors hover:text-neutral-800"
          >
            Criado com <span className="font-semibold">FolioTree</span>
          </Link>
        </footer>
      )}
    </div>
  );
}
