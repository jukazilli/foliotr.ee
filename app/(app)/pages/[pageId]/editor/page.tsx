import { notFound } from "next/navigation";
import CanonicalPageEditor from "@/components/pages/CanonicalPageEditor";
import { prisma } from "@/lib/prisma";
import { ApiRouteError } from "@/lib/server/api";
import { getAppViewer } from "@/lib/server/app-viewer";
import { getOwnedPageEditorData } from "@/lib/server/domain/templates";
import { toLegacyVersionSelection } from "@/lib/server/domain/versions";
import { setPagePublishStateAction } from "./actions";

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
    const publishPageAction = setPagePublishStateAction.bind(
      null,
      page.id,
      "PUBLISHED"
    );

    return (
      <div>
        <CanonicalPageEditor
          pageId={page.id}
          versionId={page.version.id}
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
              defaultConfig: blockDef.defaultConfig,
              editableFields: Array.isArray(blockDef.editableFields)
                ? blockDef.editableFields
                : [],
            }))
          )}
          manifestBlocks={toSerializable(
            page.template.blockDefs.map((blockDef) => ({
              key: blockDef.key,
              blockType: blockDef.blockType,
              repeatable: blockDef.repeatable,
            }))
          )}
          initialProfile={toSerializable(viewer.profile)}
          initialVersion={toSerializable({
            name: page.version.name,
            customHeadline: page.version.customHeadline,
            customBio: page.version.customBio,
            presentationId: page.version.presentationId,
            presentation: page.version.presentation,
            ...toLegacyVersionSelection(page.version),
          })}
          initialResumeConfig={toSerializable(page.version.resumeConfig)}
          initialTemplateSourcePackage={toSerializable(page.template.sourcePackage)}
          publishPageAction={publishPageAction}
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
