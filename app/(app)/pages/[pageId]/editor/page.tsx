import Link from "next/link";
import { ArrowLeft, ExternalLink, FileText, Globe, LockKeyhole } from "lucide-react";
import { notFound } from "next/navigation";
import { PageIntro } from "@/components/app/primitives";
import CanonicalPageEditor from "@/components/pages/CanonicalPageEditor";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { ApiRouteError } from "@/lib/server/api";
import { getAppViewer } from "@/lib/server/app-viewer";
import { readPageEditorSnapshot } from "@/lib/server/domain/page-snapshots";
import { getOwnedPageEditorData } from "@/lib/server/domain/templates";
import { toLegacyVersionSelection } from "@/lib/server/domain/versions";
import {
  setPagePublishStateAction,
  setResumePublishStateAction,
  syncPageSnapshotAction,
} from "./actions";

interface PageEditorRouteProps {
  params: Promise<{ pageId: string }>;
}

function toSerializable<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export default async function PageEditorRoute({ params }: PageEditorRouteProps) {
  const [{ pageId }, viewer] = await Promise.all([params, getAppViewer()]);

  try {
    const page = await getOwnedPageEditorData(prisma, viewer.user.id, pageId);
    const editorSnapshot =
      readPageEditorSnapshot(page.editorSnapshot) ??
      {
        profile: viewer.profile,
        version: {
          customHeadline: page.version.customHeadline,
          customBio: page.version.customBio,
          ...toLegacyVersionSelection(page.version),
        },
      };

    const publicUsername = viewer.user.username;
    const publicTemplateHref = publicUsername ? `/${publicUsername}/${page.slug}` : null;
    const publicResumeHref = publicUsername ? `/${publicUsername}/${page.slug}/resume` : null;

    return (
      <div className="space-y-8">
        <PageIntro
          eyebrow="Editor"
          title={page.title ?? page.version.name}
          description="Edite sua pagina."
          meta={
            <>
              <Badge variant="info">{page.template.name}</Badge>
              <Badge variant="default">{page.publishState.toLowerCase()}</Badge>
            </>
          }
          actions={
            <div className="flex flex-wrap gap-2">
              <Button asChild variant="outline">
                <Link href="/pages">
                  <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                  Voltar
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href={`/pages/${page.id}/resume`}>
                  <FileText className="h-4 w-4" aria-hidden="true" />
                  Curriculo
                </Link>
              </Button>
              <form action={syncPageSnapshotAction.bind(null, page.id)}>
                <Button type="submit" variant="outline">
                  Sincronizar com perfil
                </Button>
              </form>
              {publicTemplateHref ? (
                <Button asChild variant="ghost">
                  <Link href={publicTemplateHref} target="_blank" rel="noopener noreferrer">
                    Abrir
                    <ExternalLink className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </Button>
              ) : null}
            </div>
          }
        />

        <Card className="rounded-[28px] border-lime-100 bg-lime-50/75">
          <CardContent className="flex flex-col gap-3 px-6 py-5 text-sm leading-7 text-neutral-700 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-3">
              <LockKeyhole className="mt-0.5 h-4 w-4 text-lime-800" aria-hidden="true" />
              <div>
                <p className="font-semibold text-neutral-900">Estilo fixo</p>
                <p>Edite texto, links, imagens e blocos.</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {publicTemplateHref ? (
                <Button asChild variant="outline" size="sm">
                  <Link href={publicTemplateHref} target="_blank" rel="noopener noreferrer">
                    Ver pagina
                  </Link>
                </Button>
              ) : null}
              {publicResumeHref ? (
                <Button asChild variant="outline" size="sm">
                  <Link href={publicResumeHref} target="_blank" rel="noopener noreferrer">
                    Ver curriculo
                  </Link>
                </Button>
              ) : null}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[28px] border-neutral-200 bg-white/90">
          <CardContent className="grid gap-4 px-6 py-5 lg:grid-cols-2">
            <div className="rounded-[22px] border border-neutral-200 bg-neutral-50 p-4">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-neutral-700" aria-hidden="true" />
                <p className="text-sm font-semibold text-neutral-900">Pagina</p>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <Badge variant={page.publishState === "PUBLISHED" ? "success" : "default"}>
                  {page.publishState === "PUBLISHED" ? "publicada" : "rascunho"}
                </Badge>
                {publicTemplateHref && page.publishState === "PUBLISHED" ? (
                  <Button asChild variant="ghost" size="sm">
                    <Link href={publicTemplateHref} target="_blank" rel="noopener noreferrer">
                      Abrir
                    </Link>
                  </Button>
                ) : null}
              </div>
              <form
                action={
                  page.publishState === "PUBLISHED"
                    ? setPagePublishStateAction.bind(null, page.id, "DRAFT")
                    : setPagePublishStateAction.bind(null, page.id, "PUBLISHED")
                }
                className="mt-4"
              >
                <Button type="submit" variant={page.publishState === "PUBLISHED" ? "outline" : "default"}>
                  {page.publishState === "PUBLISHED" ? "Despublicar pagina" : "Publicar pagina"}
                </Button>
              </form>
            </div>

            <div className="rounded-[22px] border border-neutral-200 bg-neutral-50 p-4">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-neutral-700" aria-hidden="true" />
                <p className="text-sm font-semibold text-neutral-900">Curriculo</p>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <Badge
                  variant={
                    page.version.resumeConfig?.publishState === "PUBLISHED" ? "success" : "default"
                  }
                >
                  {page.version.resumeConfig?.publishState === "PUBLISHED" ? "publicado" : "rascunho"}
                </Badge>
                {publicResumeHref && page.version.resumeConfig?.publishState === "PUBLISHED" ? (
                  <Button asChild variant="ghost" size="sm">
                    <Link href={publicResumeHref} target="_blank" rel="noopener noreferrer">
                      Abrir
                    </Link>
                  </Button>
                ) : null}
              </div>
              <form
                action={
                  page.version.resumeConfig?.publishState === "PUBLISHED"
                    ? setResumePublishStateAction.bind(null, page.id, "DRAFT")
                    : setResumePublishStateAction.bind(null, page.id, "PUBLISHED")
                }
                className="mt-4"
              >
                <Button
                  type="submit"
                  variant={
                    page.version.resumeConfig?.publishState === "PUBLISHED" ? "outline" : "default"
                  }
                >
                  {page.version.resumeConfig?.publishState === "PUBLISHED"
                    ? "Despublicar curriculo"
                    : "Publicar curriculo"}
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>

        <CanonicalPageEditor
          pageId={page.id}
          templateSlug={page.template.slug}
          templateName={page.template.name}
          pageTitle={page.title ?? page.version.name}
          initialBlocks={toSerializable(page.blocks)}
          templateBlockDefs={toSerializable(
            page.template.blockDefs.map((blockDef) => ({
              id: blockDef.id,
              key: blockDef.key,
              label: blockDef.label,
              blockType: blockDef.blockType,
              required: blockDef.required,
              editableFields: Array.isArray(blockDef.editableFields) ? blockDef.editableFields : [],
            }))
          )}
          manifestBlocks={toSerializable(
            page.template.blockDefs.map((blockDef) => ({
              key: blockDef.key,
              blockType: blockDef.blockType,
              repeatable: blockDef.repeatable,
            }))
          )}
          initialProfile={toSerializable(editorSnapshot.profile)}
          initialVersion={toSerializable(editorSnapshot.version)}
          initialTemplateSourcePackage={toSerializable(page.template.sourcePackage)}
        />
      </div>
    );
  } catch (error) {
    if (error instanceof ApiRouteError && error.status === 404) {
      notFound();
    }

    throw error;
  }
}
