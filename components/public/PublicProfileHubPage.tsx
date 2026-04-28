import Link from "next/link";
import {
  ArrowUpRight,
  BriefcaseBusiness,
  Edit3,
  FileText,
  Globe2,
  MapPin,
  MessageSquareText,
  Star,
  UserRound,
} from "lucide-react";
import PublicReviewsSection from "@/components/public/PublicReviewsSection";
import type { PublicReviewSummary } from "@/lib/server/domain/reviews";
import type { PublicProfileHub } from "@/lib/server/domain/public-pages";
import { selectBehavioralAnalysis } from "@/lib/vocational-test/public-analysis";
import { BehavioralAnalysisSection } from "@/components/vocation/BehavioralAnalysisSection";

interface PublicProfileHubPageProps {
  username: string;
  hub: NonNullable<PublicProfileHub>;
  reviewSummary: PublicReviewSummary;
  isOwner?: boolean;
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
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
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
  const behavioralAnalysis = selectBehavioralAnalysis(
    hub.user.vocationalTests,
    "portfolio"
  );

  return (
    <div className="min-h-screen bg-[#f2f4f7] text-neutral-950">
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-4 py-5 sm:px-6 lg:px-8">
        <section className="overflow-hidden rounded-b-2xl border border-neutral-200 bg-white shadow-sm">
          <div className="relative h-48 bg-lime sm:h-64">
            {hub.bannerUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={hub.bannerUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-end bg-lime p-5">
                <span className="text-sm font-extrabold uppercase tracking-[0.18em] text-neutral-800/70">
                  FolioTree
                </span>
              </div>
            )}
            {isOwner ? (
              <Link
                href="/profile"
                className="absolute right-4 top-4 inline-flex h-10 items-center gap-2 rounded-full border border-neutral-300 bg-white px-4 text-sm font-bold text-neutral-900 shadow-sm transition hover:border-neutral-950"
              >
                <Edit3 className="h-4 w-4" aria-hidden />
                Editar perfil
              </Link>
            ) : null}
          </div>

          <div className="px-5 pb-5 sm:px-8 sm:pb-7">
            <div className="-mt-16 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-neutral-100 shadow-sm">
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

                <div className="pb-1">
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
                  Gerenciar portfolios
                  <ArrowUpRight className="h-4 w-4" aria-hidden />
                </Link>
              ) : null}
            </div>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-3" aria-label="Resumo do perfil">
          <ProfileCard title="Sobre">
            <div className="space-y-3 text-sm font-semibold leading-6 text-neutral-700">
              {defaultPresentation?.body || hub.bio ? (
                <p className="whitespace-pre-line">
                  {defaultPresentation?.body ?? hub.bio}
                </p>
              ) : (
                <p>Perfil em construcao.</p>
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
                  {isWorking ? "Trabalhando no momento" : "Disponivel no momento"}
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

          <ProfileCard title="Portfolio">
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-semibold text-neutral-600">
                  {publishedItems.length} ativo
                  {publishedItems.length === 1 ? "" : "s"}
                </span>
                {behavioralAnalysis ? (
                  <span className="rounded-full bg-lime-100 px-3 py-1 text-xs font-extrabold text-lime-900">
                    teste publico
                  </span>
                ) : null}
              </div>
              {publishedItems.slice(0, 2).map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  className="flex items-center justify-between gap-3 rounded-xl border border-neutral-200 p-3 transition hover:border-neutral-950"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-extrabold">
                      {item.title}
                    </span>
                    <span className="mt-1 inline-flex items-center gap-1 text-xs font-bold uppercase tracking-[0.12em] text-neutral-500">
                      <Globe2 className="h-3.5 w-3.5" aria-hidden />
                      portfolio web
                    </span>
                  </span>
                  <ArrowUpRight className="h-4 w-4 shrink-0" aria-hidden />
                </Link>
              ))}
              {publishedItems.length === 0 ? (
                <p className="text-sm font-semibold text-neutral-500">
                  Nenhum portfolio publicado ainda.
                </p>
              ) : null}
            </div>
          </ProfileCard>

          <ProfileCard title="Reviews">
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
                  media das avaliacoes
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

        <section className="grid gap-3" aria-labelledby="published-links-title">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-neutral-500">
                Portfolios e curriculos
              </p>
              <h2
                id="published-links-title"
                className="mt-1 text-2xl font-extrabold tracking-[-0.03em]"
              >
                Experiencias publicadas
              </h2>
            </div>
            <span className="text-sm font-bold text-neutral-500">
              {publishedItems.length} ativo{publishedItems.length === 1 ? "" : "s"}
            </span>
          </div>

          {publishedItems.length > 0 ? (
            publishedItems.map((item) => (
              <article
                key={item.id}
                className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm"
              >
                <Link
                  href={item.href}
                  className="group flex items-center justify-between gap-4"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="overflow-wrap-anywhere text-lg font-extrabold">
                        {item.title}
                      </h3>
                      {item.isDefault ? (
                        <span className="rounded-full bg-lime-100 px-2 py-1 text-xs font-extrabold text-lime-950">
                          principal
                        </span>
                      ) : null}
                    </div>
                    {item.description ? (
                      <p className="mt-1 overflow-wrap-anywhere text-sm font-semibold leading-6 text-neutral-600">
                        {item.description}
                      </p>
                    ) : null}
                    <p className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.12em] text-neutral-500">
                      <Globe2 className="h-3.5 w-3.5" aria-hidden />
                      Portfolio web
                    </p>
                  </div>
                  <ArrowUpRight
                    className="h-5 w-5 shrink-0 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    aria-hidden
                  />
                </Link>

                {item.resumeHref ? (
                  <Link
                    href={item.resumeHref}
                    className="mt-3 inline-flex items-center gap-2 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm font-extrabold text-neutral-800 transition hover:border-neutral-950 hover:bg-white"
                  >
                    <FileText className="h-4 w-4" aria-hidden />
                    Ver curriculo rapido deste portfolio
                  </Link>
                ) : null}
              </article>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-neutral-300 bg-white/70 p-6 text-center text-sm font-semibold text-neutral-500">
              Nenhum portfolio publicado ainda.
            </div>
          )}
        </section>

        {behavioralAnalysis ? (
          <section className="grid gap-3">
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
        />
      </div>

      <footer className="border-t border-black/10 py-6 text-center">
        <Link
          href="/"
          className="text-xs text-neutral-500 transition-colors hover:text-neutral-800"
        >
          Criado com <span className="font-semibold">FolioTree</span>
        </Link>
      </footer>
    </div>
  );
}
