import Link from "next/link";
import {
  ArrowUpRight,
  BriefcaseBusiness,
  FileText,
  Globe2,
  MapPin,
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

export default function PublicProfileHubPage({
  username,
  hub,
  reviewSummary,
}: PublicProfileHubPageProps) {
  const displayName = hub.displayName || username;
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
    <div className="min-h-screen bg-[#f6f3ec] text-neutral-950">
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-8 sm:px-6 sm:py-12">
        <section className="rounded-[28px] border-2 border-neutral-950 bg-white p-5 shadow-[8px_8px_0_#111827] sm:p-7">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border-2 border-neutral-950 bg-neutral-100">
              {hub.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={hub.avatarUrl}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <UserRound className="h-11 w-11 text-neutral-500" aria-hidden />
              )}
            </div>

            <p className="mt-5 text-sm font-extrabold uppercase tracking-[0.18em] text-neutral-500">
              @{username}
            </p>
            <h1 className="mt-2 text-4xl font-extrabold tracking-[-0.04em] sm:text-5xl">
              {displayName}
            </h1>
            {hub.headline ? (
              <p className="mt-3 max-w-xl text-base font-bold leading-7 text-neutral-700 sm:text-lg">
                {hub.headline}
              </p>
            ) : null}
            {hub.bio ? (
              <p className="mt-4 max-w-xl whitespace-pre-line text-sm font-medium leading-7 text-neutral-600">
                {hub.bio}
              </p>
            ) : null}

            <div className="mt-5 flex flex-wrap justify-center gap-2">
              {hub.location ? (
                <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-neutral-200 bg-neutral-50 px-3 py-1.5 text-sm font-bold text-neutral-700">
                  <MapPin className="h-4 w-4" aria-hidden />
                  {hub.location}
                </span>
              ) : null}
              {age !== null ? (
                <span className="rounded-full border-2 border-neutral-200 bg-neutral-50 px-3 py-1.5 text-sm font-bold text-neutral-700">
                  {age} anos
                </span>
              ) : null}
              <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-neutral-200 bg-neutral-50 px-3 py-1.5 text-sm font-bold text-neutral-700">
                <BriefcaseBusiness className="h-4 w-4" aria-hidden />
                {isWorking ? "Trabalhando no momento" : "Disponível no momento"}
              </span>
              <span
                className={`rounded-full border-2 px-3 py-1.5 text-sm font-extrabold ${
                  hub.openToOpportunities
                    ? "border-lime-600 bg-lime-200 text-lime-950"
                    : "border-neutral-200 bg-neutral-50 text-neutral-600"
                }`}
              >
                {hub.openToOpportunities ? "Aberto a oportunidades" : "Sem busca ativa"}
              </span>
            </div>

            {currentExperience ? (
              <p className="mt-4 text-sm font-semibold text-neutral-600">
                Atualmente: {currentExperience.role}
                {currentExperience.company ? ` em ${currentExperience.company}` : ""}
              </p>
            ) : null}

            {hub.showOpportunityMotivation && hub.opportunityMotivation ? (
              <div className="mt-5 w-full rounded-2xl border-2 border-neutral-200 bg-neutral-50 p-4 text-left">
                <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-neutral-500">
                  O que faria mudar de emprego
                </p>
                <p className="mt-2 whitespace-pre-line text-sm font-semibold leading-6 text-neutral-700">
                  {hub.opportunityMotivation}
                </p>
              </div>
            ) : null}
          </div>
        </section>

        <section className="grid gap-3" aria-labelledby="published-links-title">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-neutral-500">
                Portfólios e currículos
              </p>
              <h2
                id="published-links-title"
                className="mt-1 text-2xl font-extrabold tracking-[-0.03em]"
              >
                Algumas das minhas experiências
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
                className="rounded-2xl border-2 border-neutral-950 bg-white p-4 shadow-[5px_5px_0_#111827]"
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
                        <span className="rounded-full bg-lime-200 px-2 py-1 text-xs font-extrabold text-lime-950">
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
                      Portfólio web
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
                    className="mt-3 inline-flex items-center gap-2 rounded-xl border-2 border-neutral-200 bg-neutral-50 px-3 py-2 text-sm font-extrabold text-neutral-800 transition hover:border-neutral-950 hover:bg-white"
                  >
                    <FileText className="h-4 w-4" aria-hidden />
                    Ver currículo desta experiência
                  </Link>
                ) : null}
              </article>
            ))
          ) : (
            <div className="rounded-2xl border-2 border-dashed border-neutral-300 bg-white/70 p-6 text-center text-sm font-semibold text-neutral-500">
              Nenhum portfólio publicado ainda.
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

      <PublicReviewsSection
        username={username}
        returnPath={`/${username}`}
        summary={reviewSummary}
      />

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
