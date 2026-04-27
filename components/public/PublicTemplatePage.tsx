import PublicPortfolioTabsPage from "@/components/public/PublicPortfolioTabsPage";
import type { PublicPageRecord } from "@/lib/server/domain/public-pages";
import {
  getPublicPageBlocks,
  getPublicProfile,
  toPublicVersionSelection,
} from "@/lib/server/domain/public-pages";
import { getPublicReviewSummary } from "@/lib/server/domain/reviews";
import { selectBehavioralAnalysis } from "@/lib/vocational-test/public-analysis";

interface PublicTemplatePageProps {
  page: PublicPageRecord;
  username: string;
  pageSlug?: string | null;
}

export default async function PublicTemplatePage({
  page,
  username,
  pageSlug,
}: PublicTemplatePageProps) {
  const profile = getPublicProfile(page);
  const version = toPublicVersionSelection(page);
  const behavioralAnalysis = selectBehavioralAnalysis(
    page.version.profile.user.vocationalTests,
    "portfolio"
  );
  const reviewSummary = await getPublicReviewSummary(username);

  return (
    <PublicPortfolioTabsPage
      username={username}
      pageSlug={pageSlug ?? page.slug}
      blocks={getPublicPageBlocks(page)}
      profile={profile}
      version={version}
      templateSourcePackage={page.template.sourcePackage}
      reviewSummary={reviewSummary}
      behavioralAnalysis={behavioralAnalysis}
    />
  );
}
