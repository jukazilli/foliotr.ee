import Link from "next/link";
import { ArrowLeft, ExternalLink, Globe } from "lucide-react";
import { notFound } from "next/navigation";
import { PageIntro } from "@/components/app/primitives";
import ResumeView from "@/components/resume/ResumeView";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { ApiRouteError } from "@/lib/server/api";
import { getAppViewer } from "@/lib/server/app-viewer";
import { getOwnedPageEditorData } from "@/lib/server/domain/templates";
import { toLegacyVersionSelection } from "@/lib/server/domain/versions";

interface AuthenticatedResumePageProps {
  params: Promise<{ pageId: string }>;
}

export default async function AuthenticatedResumePage({
  params,
}: AuthenticatedResumePageProps) {
  const [{ pageId }, viewer] = await Promise.all([params, getAppViewer()]);

  try {
    const page = await getOwnedPageEditorData(prisma, viewer.user.id, pageId);
    const publicTemplateHref = viewer.user.username
      ? `/${viewer.user.username}/${page.slug}`
      : null;
    const publicResumeHref = viewer.user.username
      ? `/${viewer.user.username}/${page.slug}/resume`
      : null;

    return (
      <div className="space-y-8">
        <PageIntro
          eyebrow="Curriculo rapido"
          title={page.version.name}
          description="Revise a leitura objetiva associada a este portfolio."
          meta={
            <>
              <Badge variant="info">{page.template.name}</Badge>
              <Badge
                variant={
                  page.version.resumeConfig?.publishState === "PUBLISHED"
                    ? "success"
                    : "default"
                }
              >
                {page.version.resumeConfig?.publishState === "PUBLISHED"
                  ? "publicado"
                  : "rascunho"}
              </Badge>
            </>
          }
          actions={
            <div className="flex flex-wrap gap-2">
              <Button asChild variant="outline">
                <Link href={`/pages/${page.id}/editor`}>
                  <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                  Voltar ao portfolio
                </Link>
              </Button>
              {publicResumeHref ? (
                <Button asChild variant="ghost">
                  <Link
                    href={publicResumeHref}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Abrir publico
                    <ExternalLink className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </Button>
              ) : null}
            </div>
          }
        />

        <Card className="rounded-[28px] border-neutral-200 bg-white/90">
          <CardContent className="flex flex-col gap-3 px-6 py-5 text-sm leading-7 text-neutral-700 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-neutral-50 px-3 py-2 font-semibold text-neutral-900">
                Curriculo rapido
              </span>
              <span className="text-neutral-500">
                Modo objetivo do portfolio, pronto para leitura rapida ou impressao.
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button asChild variant="outline" size="sm">
                <Link href={`/pages/${page.id}/editor`}>Editar portfolio</Link>
              </Button>
              {publicTemplateHref ? (
                <Button asChild variant="ghost" size="sm">
                  <Link
                    href={publicTemplateHref}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Globe className="h-4 w-4" aria-hidden="true" />
                    Abrir portfolio publico
                  </Link>
                </Button>
              ) : null}
            </div>
          </CardContent>
        </Card>

        <div className="mx-auto w-full max-w-4xl overflow-x-hidden">
          <ResumeView
            templateSlug={page.template.slug}
            blocks={page.blocks}
            profile={viewer.profile}
            version={{
              customHeadline: page.version.customHeadline,
              customBio: page.version.customBio,
              presentationId: page.version.presentationId,
              presentation: page.version.presentation,
              ...toLegacyVersionSelection(page.version),
            }}
            config={page.version.resumeConfig}
          />
        </div>
      </div>
    );
  } catch (error) {
    if (error instanceof ApiRouteError && error.status === 404) {
      notFound();
    }

    throw error;
  }
}
