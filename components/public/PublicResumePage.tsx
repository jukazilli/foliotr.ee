import Link from "next/link";
import ResumeView from "@/components/resume/ResumeView";
import PublicToolbar from "@/components/public/PublicToolbar";
import type { PublicPageRecord } from "@/lib/server/domain/public-pages";
import {
  getPublicResumeHref,
  getPublicTemplateHref,
} from "@/lib/server/domain/public-pages";
import type { PublishedResumeSnapshot } from "@/lib/server/domain/page-snapshots";
import { selectBehavioralAnalysis } from "@/lib/vocational-test/public-analysis";

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
  const effectivePageSlug = pageSlug ?? page.slug;
  const templateHref = getPublicTemplateHref(username, effectivePageSlug);
  const resumeHref = getPublicResumeHref(username, pageSlug);
  const behavioralAnalysis = selectBehavioralAnalysis(
    page.version.profile.user.vocationalTests,
    "resume"
  );

  return (
    <div className="min-h-screen overflow-x-hidden bg-neutral-100 print:overflow-visible print:bg-white">
      <PublicToolbar
        templateHref={templateHref}
        resumeHref={resumeHref}
        activeMode="resume"
      />

      <main className="w-full px-3 pb-10 pt-24 print:max-w-none print:p-0 sm:px-6 lg:px-8">
        <div className="mx-auto grid w-full max-w-4xl gap-4">
          <div className="rounded-lg border border-neutral-200 bg-white px-4 py-3 text-sm font-semibold leading-6 text-neutral-600 print:hidden">
            Curriculo rapido associado ao portfolio publico. Use esta versao para
            leitura objetiva, compartilhamento direto ou impressao.
          </div>
          <ResumeView
            templateSlug={page.template.slug}
            blocks={snapshot.blocks}
            profile={snapshot.profile}
            version={snapshot.version}
            config={snapshot.config as never}
            behavioralAnalysis={behavioralAnalysis}
          />
        </div>
      </main>

      <div className="border-t border-neutral-200 py-6 text-center print:hidden">
        <Link
          href="/"
          className="text-xs text-neutral-400 transition-colors hover:text-neutral-600"
        >
          Criado com <span className="font-semibold">FolioTree</span>
        </Link>
      </div>
    </div>
  );
}
