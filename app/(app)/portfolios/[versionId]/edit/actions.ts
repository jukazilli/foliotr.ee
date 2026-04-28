"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getPrimaryVersionPage } from "@/lib/server/domain/includes";
import {
  asInputJsonValue,
  buildVersionProfileSnapshot,
  readVersionProfileSnapshot,
} from "@/lib/server/domain/page-snapshots";
import { getOwnedProfileBase } from "@/lib/server/domain/profile-base";
import {
  getOwnedVersion,
  upsertOwnedPageOutput,
  upsertOwnedResumeOutput,
} from "@/lib/server/domain/versions";
import { readTemplateResumeDefaults } from "@/lib/server/domain/canonical-templates";

function readText(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function nullableText(value: string) {
  return value.length > 0 ? value : null;
}

function normalizeSlug(value: string, fallback: string) {
  const normalized = value
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 20);

  return normalized || fallback;
}

function createFallbackSlug(args: { username?: string | null; versionId: string }) {
  const base = normalizeSlug(args.username ?? "portfolio", "portfolio").slice(0, 14);
  const suffix = args.versionId.slice(-5).toLowerCase();
  return normalizeSlug(`${base}-${suffix}`, suffix);
}

function revalidatePortfolioEditPaths(args: {
  username?: string | null;
  versionId: string;
  slug?: string | null;
}) {
  revalidatePath("/portfolios");
  revalidatePath(`/portfolios/${args.versionId}/edit`);
  revalidatePath("/templates");
  revalidatePath("/resumes");

  if (!args.username) return;

  revalidatePath(`/${args.username}`);
  revalidatePath(`/${args.username}/resume`);

  if (args.slug) {
    revalidatePath(`/${args.username}/${args.slug}`);
    revalidatePath(`/${args.username}/${args.slug}/resume`);
  }
}

export async function savePortfolioVariationAction(
  versionId: string,
  formData: FormData
) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const intent = readText(formData, "intent") === "publish" ? "publish" : "draft";
  const [profile, version] = await Promise.all([
    getOwnedProfileBase(prisma, session.user.id),
    getOwnedVersion(prisma, session.user.id, versionId),
  ]);

  const currentPage = getPrimaryVersionPage(version);
  const templateId = readText(formData, "templateId") || currentPage?.templateId;

  if (!templateId) {
    redirect(`/portfolios/${versionId}/edit?error=missing-template`);
  }

  const template = await prisma.template.findFirst({
    where: { id: templateId, isActive: true },
    select: { id: true, resumeDefaults: true },
  });

  if (!template) {
    redirect(`/portfolios/${versionId}/edit?error=template-not-found`);
  }

  const snapshot =
    readVersionProfileSnapshot(version.profileSnapshot) ??
    buildVersionProfileSnapshot(profile);
  const nextDisplayName = nullableText(readText(formData, "displayName"));
  const nextHeadline = nullableText(readText(formData, "headline"));
  const nextBio = nullableText(readText(formData, "bio"));
  const nextSnapshot = {
    ...snapshot,
    displayName: nextDisplayName,
    headline: nextHeadline,
    bio: nextBio,
    avatarUrl: nullableText(readText(formData, "avatarUrl")),
    bannerUrl: nullableText(readText(formData, "bannerUrl")),
    location: nullableText(readText(formData, "location")),
    updatedAt: new Date().toISOString(),
  };
  const nextName =
    nullableText(readText(formData, "versionName")) ??
    nextHeadline ??
    nextDisplayName ??
    version.name;
  const pageSlug = normalizeSlug(
    readText(formData, "slug") || currentPage?.slug || "",
    createFallbackSlug({
      username: profile.user.username ?? session.user.username,
      versionId,
    })
  );

  await prisma.version.update({
    where: { id: version.id },
    data: {
      name: nextName,
      customHeadline: nextHeadline,
      customBio: nextBio,
      profileSnapshot: asInputJsonValue(nextSnapshot),
    },
  });

  const nextPublishState = intent === "publish" ? "PUBLISHED" : "DRAFT";
  const versionWithPage = await upsertOwnedPageOutput(
    prisma,
    session.user.id,
    version.id,
    {
      title: nextName,
      slug: pageSlug,
      templateId: template.id,
      publishState: nextPublishState,
    }
  );

  const resumeDefaults = readTemplateResumeDefaults(template.resumeDefaults);
  await upsertOwnedResumeOutput(prisma, session.user.id, version.id, {
    sections:
      version.resumeConfig?.sections.length && version.resumeConfig.sections.length > 0
        ? version.resumeConfig.sections
        : resumeDefaults.sections,
    layout: version.resumeConfig?.layout ?? resumeDefaults.layout,
    accentColor: version.resumeConfig?.accentColor ?? resumeDefaults.accentColor ?? "",
    showPhoto: version.resumeConfig?.showPhoto ?? resumeDefaults.showPhoto,
    showLinks: version.resumeConfig?.showLinks ?? resumeDefaults.showLinks,
    publishState: nextPublishState,
  });

  const nextPage = getPrimaryVersionPage(versionWithPage);
  revalidatePortfolioEditPaths({
    username: profile.user.username ?? session.user.username,
    versionId,
    slug: nextPage?.slug ?? pageSlug,
  });

  redirect(
    `/portfolios/${versionId}/edit?${intent === "publish" ? "published=1" : "saved=1"}`
  );
}
