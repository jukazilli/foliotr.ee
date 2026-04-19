import Link from "next/link";
import ResumeView from "@/components/resume/ResumeView";
import PublicToolbar from "@/components/public/PublicToolbar";
import type { PublicPageRecord } from "@/lib/server/domain/public-pages";
import {
  getPublicResumeHref,
  getPublicTemplateHref,
} from "@/lib/server/domain/public-pages";
import type { PublishedResumeSnapshot } from "@/lib/server/domain/page-snapshots";

interface PublicResumePageProps {
  page: PublicPageRecord;
  username: string;
  pageSlug?: string | null;
  snapshot: PublishedResumeSnapshot;
}

export default function PublicResumePage({
  page,
  username,
  pageSlug,
  snapshot,
}: PublicResumePageProps) {
  const templateHref = getPublicTemplateHref(username, pageSlug);
  const resumeHref = getPublicResumeHref(username, pageSlug);

  return (
    <div className="min-h-screen bg-neutral-100 print:bg-white">
      <PublicToolbar
        templateHref={templateHref}
        resumeHref={resumeHref}
        activeMode="resume"
      />

      <main className="w-full px-4 pb-10 pt-24 print:max-w-none print:p-0 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
        <ResumeView
          templateSlug={page.template.slug}
          blocks={snapshot.blocks}
          profile={snapshot.profile}
          version={snapshot.version}
          config={snapshot.config as never}
        />
      </main>

      <div className="border-t border-neutral-200 py-6 text-center print:hidden">
        <Link href="/" className="text-xs text-neutral-400 transition-colors hover:text-neutral-600">
          Criado com <span className="font-semibold">FolioTree</span>
        </Link>
      </div>
    </div>
  );
}
