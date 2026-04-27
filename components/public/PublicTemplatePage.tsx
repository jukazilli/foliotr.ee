import Link from "next/link";
import TemplateRenderer from "@/components/templates/TemplateRenderer";
import PublicReviewsSection from "@/components/public/PublicReviewsSection";
import PublicToolbar from "@/components/public/PublicToolbar";
import type { PublicPageRecord } from "@/lib/server/domain/public-pages";
import {
  getPublicPageBlocks,
  getPublicProfile,
  getPublicResumeHref,
  getPublicTemplateHref,
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
  const templateHref = getPublicTemplateHref(username, pageSlug);
  const resumeHref =
    page.version.resumeConfig?.publishState === "PUBLISHED"
      ? getPublicResumeHref(username, pageSlug)
      : null;
  const behavioralAnalysis = selectBehavioralAnalysis(
    page.version.profile.user.vocationalTests,
    "portfolio"
  );
  const reviewSummary = await getPublicReviewSummary(username);

  return (
    <div className="min-h-screen">
      <PublicToolbar
        templateHref={templateHref}
        resumeHref={resumeHref}
        activeMode="template"
      />

      <PublicReviewsSection
        username={username}
        returnPath={templateHref}
        summary={reviewSummary}
      />

      <TemplateRenderer
        templateSlug={page.template.slug}
        blocks={getPublicPageBlocks(page)}
        profile={profile}
        version={version}
        templateSourcePackage={page.template.sourcePackage}
        behavioralAnalysis={behavioralAnalysis}
      />

      <div className="border-t border-black/5 py-6 text-center print:hidden">
        <Link
          href="/"
          className="text-xs text-neutral-500 transition-colors hover:text-neutral-800"
        >
          Criado com <span className="font-semibold">FolioTree</span>
        </Link>
      </div>
    </div>
  );
}
