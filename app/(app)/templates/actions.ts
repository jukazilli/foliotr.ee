"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  evaluateTemplateEligibility,
  getCanonicalTemplateBySlug,
} from "@/lib/server/domain/canonical-templates";
import { getPrimaryVersionPage } from "@/lib/server/domain/includes";
import { getOwnedProfileBase } from "@/lib/server/domain/profile-base";
import {
  getOwnedVersion,
  upsertOwnedPageOutput,
  upsertOwnedResumeOutput,
} from "@/lib/server/domain/versions";

function createPageSlug(args: {
  username: string;
  versionId: string;
  isDefault: boolean;
  currentSlug?: string | null;
}) {
  if (args.currentSlug) {
    return args.currentSlug;
  }

  const base = args.username
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 20);

  if (args.isDefault) {
    return base || args.versionId.slice(-8).toLowerCase();
  }

  const suffix = args.versionId.slice(-4).toLowerCase();
  const prefix = (base || "folio").slice(0, Math.max(3, 20 - suffix.length - 1));
  return `${prefix.replace(/-+$/g, "")}-${suffix}`.slice(0, 20);
}

export async function useCanonicalTemplateAction(
  slug: string,
  formData: FormData
) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const versionId = String(formData.get("versionId") ?? "");

  if (!versionId) {
    redirect(`/templates/${slug}?error=missing-version`);
  }

  const template = await getCanonicalTemplateBySlug(prisma, slug);

  if (!template) {
    redirect("/templates?error=template-not-found");
  }

  const [profile, version] = await Promise.all([
    getOwnedProfileBase(prisma, session.user.id),
    getOwnedVersion(prisma, session.user.id, versionId),
  ]);

  const eligibility = evaluateTemplateEligibility(template, profile, version);

  if (!eligibility.eligible) {
    redirect(`/templates/${slug}?error=ineligible&version=${versionId}`);
  }

  const username = profile.user.username ?? session.user.username ?? null;

  if (!username) {
    redirect(`/templates/${slug}?error=missing-username`);
  }

  const currentPage = getPrimaryVersionPage(version);

  const versionWithPage = await upsertOwnedPageOutput(prisma, session.user.id, version.id, {
    title: currentPage?.title ?? `${version.name} page`,
    slug: createPageSlug({
      username,
      versionId: version.id,
      isDefault: version.isDefault,
      currentSlug: currentPage?.slug,
    }),
    templateId: template.id,
    publishState: currentPage?.publishState ?? "DRAFT",
  });
  const appliedPage = getPrimaryVersionPage(versionWithPage);

  await upsertOwnedResumeOutput(prisma, session.user.id, version.id, {
    sections:
      version.resumeConfig?.sections?.length && version.resumeConfig.sections.length > 0
        ? version.resumeConfig.sections
        : template.resumeDefaults.sections,
    layout: version.resumeConfig?.layout ?? template.resumeDefaults.layout,
    accentColor:
      version.resumeConfig?.accentColor ?? template.resumeDefaults.accentColor ?? "",
    showPhoto: version.resumeConfig?.showPhoto ?? template.resumeDefaults.showPhoto,
    showLinks: version.resumeConfig?.showLinks ?? template.resumeDefaults.showLinks,
    publishState: version.resumeConfig?.publishState ?? "DRAFT",
  });

  revalidatePath("/templates");
  revalidatePath(`/templates/${slug}`);
  revalidatePath("/pages");
  revalidatePath("/resumes");

  if (appliedPage) {
    redirect(`/pages/${appliedPage.id}/editor`);
  }

  redirect(`/templates/${slug}?applied=1&version=${versionId}`);
}
