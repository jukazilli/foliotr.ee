"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { readTemplateResumeDefaults } from "@/lib/server/domain/canonical-templates";
import { getOwnedPageEditorData } from "@/lib/server/domain/templates";
import { syncOwnedPageSnapshot } from "@/lib/server/domain/versions";
import {
  upsertOwnedPageOutput,
  upsertOwnedResumeOutput,
} from "@/lib/server/domain/versions";

async function requireEditorContext(pageId: string) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const page = await getOwnedPageEditorData(prisma, session.user.id, pageId);

  return { session, page };
}

function revalidatePublicPaths(username: string | null | undefined, slug: string) {
  revalidatePath("/portfolios");
  revalidatePath("/pages");

  if (!username) return;

  revalidatePath(`/${username}`);
  revalidatePath(`/${username}/resume`);
  revalidatePath(`/${username}/${slug}`);
  revalidatePath(`/${username}/${slug}/resume`);
}

export async function setPagePublishStateAction(
  pageId: string,
  nextState: "DRAFT" | "PUBLISHED"
) {
  const { session, page } = await requireEditorContext(pageId);

  await upsertOwnedPageOutput(prisma, session.user.id, page.versionId, {
    title: page.title ?? page.version.name,
    slug: page.slug,
    templateId: page.templateId,
    publishState: nextState,
  });

  if (nextState === "PUBLISHED") {
    const resumeDefaults = readTemplateResumeDefaults(page.template.resumeDefaults);

    await upsertOwnedResumeOutput(prisma, session.user.id, page.versionId, {
      sections:
        page.version.resumeConfig?.sections?.length &&
        page.version.resumeConfig.sections.length > 0
          ? page.version.resumeConfig.sections
          : resumeDefaults.sections,
      layout: page.version.resumeConfig?.layout ?? resumeDefaults.layout,
      accentColor:
        page.version.resumeConfig?.accentColor ?? resumeDefaults.accentColor ?? "",
      showPhoto: page.version.resumeConfig?.showPhoto ?? resumeDefaults.showPhoto,
      showLinks: page.version.resumeConfig?.showLinks ?? resumeDefaults.showLinks,
      publishState: "PUBLISHED",
    });
  }

  revalidatePath(`/pages/${pageId}/editor`);
  revalidatePublicPaths(session.user.username, page.slug);
}

export async function syncPageSnapshotAction(pageId: string) {
  const { session, page } = await requireEditorContext(pageId);

  await syncOwnedPageSnapshot(prisma, session.user.id, pageId);

  revalidatePath(`/pages/${pageId}/editor`);
  revalidatePath(`/pages/${pageId}/resume`);
}

export async function setResumePublishStateAction(
  pageId: string,
  nextState: "DRAFT" | "PUBLISHED"
) {
  const { session, page } = await requireEditorContext(pageId);
  const resumeDefaults = readTemplateResumeDefaults(page.template.resumeDefaults);

  await upsertOwnedResumeOutput(prisma, session.user.id, page.versionId, {
    sections:
      page.version.resumeConfig?.sections?.length &&
      page.version.resumeConfig.sections.length > 0
        ? page.version.resumeConfig.sections
        : resumeDefaults.sections,
    layout: page.version.resumeConfig?.layout ?? resumeDefaults.layout,
    accentColor:
      page.version.resumeConfig?.accentColor ?? resumeDefaults.accentColor ?? "",
    showPhoto: page.version.resumeConfig?.showPhoto ?? resumeDefaults.showPhoto,
    showLinks: page.version.resumeConfig?.showLinks ?? resumeDefaults.showLinks,
    publishState: nextState,
  });

  revalidatePath(`/pages/${pageId}/editor`);
  revalidatePublicPaths(session.user.username, page.slug);
}
