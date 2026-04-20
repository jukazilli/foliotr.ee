import Link from "next/link";
import { ArrowLeft, ExternalLink, FileText, Globe, LockKeyhole } from "lucide-react";
import { notFound } from "next/navigation";
import CanonicalPageEditor from "@/components/pages/CanonicalPageEditor";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
      <div className="space-y-4">
        <section className="overflow-hidden rounded-2xl border border-neutral-200 bg-white/95 shadow-sm">
          <div className="flex flex-col gap-3 border-b border-neutral-200 px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <Button asChild variant="ghost" size="sm">
                <Link href="/pages" aria-label="Voltar para paginas">
                  <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                  Voltar
                </Link>
              </Button>
              <div className="min-w-0 border-l border-neutral-200 pl-3">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="truncate font-display text-xl font-semibold tracking-tight text-neutral-950">
                    {page.title ?? page.version.name}
                  </h1>
                  <Badge variant="info">{page.template.name}</Badge>
                  <Badge variant={page.publishState === "PUBLISHED" ? "success" : "default"}>
                    {page.publishState === "PUBLISHED" ? "pagina publicada" : "pagina rascunho"}
                  </Badge>
                  <Badge
                    variant={
                      page.version.resumeConfig?.publishState === "PUBLISHED"
                        ? "success"
                        : "default"
                    }
                  >
                    {page.version.resumeConfig?.publishState === "PUBLISHED"
                      ? "curriculo publicado"
                      : "curriculo rascunho"}
                  </Badge>
                </div>
                <p className="mt-1 truncate text-xs text-neutral-500">
                  Edite blocos, texto, links e imagens mantendo o estilo fixo do template.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <form action={syncPageSnapshotAction.bind(null, page.id)}>
                <Button type="submit" variant="outline" size="sm">
                  <LockKeyhole className="h-4 w-4" aria-hidden="true" />
                  Sincronizar
                </Button>
              </form>
              <Button asChild variant="outline" size="sm">
                <Link href={`/pages/${page.id}/resume`}>
                  <FileText className="h-4 w-4" aria-hidden="true" />
                  Curriculo
                </Link>
              </Button>
              {publicTemplateHref ? (
                <Button asChild variant="ghost" size="sm">
                  <Link href={publicTemplateHref} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4" aria-hidden="true" />
                    Pagina
                  </Link>
                </Button>
              ) : null}
              {publicResumeHref ? (
                <Button asChild variant="ghost" size="sm">
                  <Link href={publicResumeHref} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4" aria-hidden="true" />
                    Publico
                  </Link>
                </Button>
              ) : null}
            </div>
          </div>

          <div className="grid gap-2 bg-neutral-50/75 px-4 py-3 lg:grid-cols-2">
            <div className="flex flex-col gap-3 rounded-xl border border-neutral-200 bg-white px-3 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-blue-700" aria-hidden="true" />
                <div>
                  <p className="text-sm font-semibold text-neutral-900">Pagina</p>
                  <p className="text-xs text-neutral-500">
                    {page.publishState === "PUBLISHED" ? "Visivel publicamente" : "Em rascunho"}
                  </p>
                </div>
              </div>
              <form
                action={
                  page.publishState === "PUBLISHED"
                    ? setPagePublishStateAction.bind(null, page.id, "DRAFT")
                    : setPagePublishStateAction.bind(null, page.id, "PUBLISHED")
                }
              >
                <Button
                  type="submit"
                  variant={page.publishState === "PUBLISHED" ? "outline" : "default"}
                >
                  {page.publishState === "PUBLISHED" ? "Despublicar" : "Publicar"}
                </Button>
              </form>
            </div>

            <div className="flex flex-col gap-3 rounded-xl border border-neutral-200 bg-white px-3 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-violet-700" aria-hidden="true" />
                <div>
                  <p className="text-sm font-semibold text-neutral-900">Curriculo</p>
                  <p className="text-xs text-neutral-500">
                    {page.version.resumeConfig?.publishState === "PUBLISHED"
                      ? "Visivel publicamente"
                      : "Em rascunho"}
                  </p>
                </div>
              </div>
              <form
                action={
                  page.version.resumeConfig?.publishState === "PUBLISHED"
                    ? setResumePublishStateAction.bind(null, page.id, "DRAFT")
                    : setResumePublishStateAction.bind(null, page.id, "PUBLISHED")
                }
              >
                <Button
                  type="submit"
                  variant={
                    page.version.resumeConfig?.publishState === "PUBLISHED" ? "outline" : "default"
                  }
                >
                  {page.version.resumeConfig?.publishState === "PUBLISHED"
                    ? "Despublicar"
                    : "Publicar"}
                </Button>
              </form>
            </div>
          </div>
        </section>

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
