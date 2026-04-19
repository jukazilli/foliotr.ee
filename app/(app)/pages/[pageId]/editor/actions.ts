"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getOwnedPageEditorData } from "@/lib/server/domain/templates";
import {
  upsertOwnedPageOutput,
  upsertOwnedResumeOutput,
} from "@/lib/server/domain/versions";
import { getCanonicalTemplateManifest } from "@/lib/templates/registry";

async function requireEditorContext(pageId: string) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const page = await getOwnedPageEditorData(prisma, session.user.id, pageId);
  const manifest = getCanonicalTemplateManifest(page.template.slug);

  if (!manifest) {
    throw new Error(`Manifest nao encontrado para template ${page.template.slug}`);
  }

  return { session, page, manifest };
}

function revalidatePublicPaths(username: string | null | undefined, slug: string) {
  revalidatePath("/pages");

  if (!username) return;

  revalidatePath(`/${username}`);
  revalidatePath(`/${username}/resume`);
  revalidatePath(`/${username}/${slug}`);
  revalidatePath(`/${username}/${slug}/resume`);
}

export async function setPagePublishStateAction(pageId: string, nextState: "DRAFT" | "PUBLISHED") {
  const { session, page } = await requireEditorContext(pageId);

  await upsertOwnedPageOutput(prisma, session.user.id, page.versionId, {
    title: page.title ?? page.version.name,
    slug: page.slug,
    templateId: page.templateId,
    publishState: nextState,
  });

  revalidatePath(`/pages/${pageId}/editor`);
  revalidatePublicPaths(session.user.username, page.slug);
}

export async function setResumePublishStateAction(
  pageId: string,
  nextState: "DRAFT" | "PUBLISHED"
) {
  const { session, page, manifest } = await requireEditorContext(pageId);

  await upsertOwnedResumeOutput(prisma, session.user.id, page.versionId, {
    sections:
      page.version.resumeConfig?.sections?.length && page.version.resumeConfig.sections.length > 0
        ? page.version.resumeConfig.sections
        : manifest.resumeDefaults.sections,
    layout: page.version.resumeConfig?.layout ?? manifest.resumeDefaults.layout,
    accentColor:
      page.version.resumeConfig?.accentColor ?? manifest.resumeDefaults.accentColor ?? "",
    showPhoto: page.version.resumeConfig?.showPhoto ?? manifest.resumeDefaults.showPhoto,
    showLinks: page.version.resumeConfig?.showLinks ?? manifest.resumeDefaults.showLinks,
    publishState: nextState,
  });

  revalidatePath(`/pages/${pageId}/editor`);
  revalidatePublicPaths(session.user.username, page.slug);
}
