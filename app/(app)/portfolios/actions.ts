"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { readTemplateResumeDefaults } from "@/lib/server/domain/canonical-templates";
import { getPrimaryVersionPage } from "@/lib/server/domain/includes";
import { getOwnedProfileBase } from "@/lib/server/domain/profile-base";
import {
  createOwnedVersion,
  upsertOwnedPageOutput,
  upsertOwnedResumeOutput,
} from "@/lib/server/domain/versions";

type PublishStateInput = "DRAFT" | "PUBLISHED";

async function requirePortfolioSession() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  return session.user as typeof session.user & {
    id: string;
    username?: string | null;
  };
}

async function getOwnedPageForAction(userId: string, pageId: string) {
  const page = await prisma.page.findFirst({
    where: {
      id: pageId,
      version: {
        profile: {
          userId,
        },
      },
    },
    include: {
      template: true,
      version: {
        include: {
          resumeConfig: true,
          profile: {
            select: {
              user: {
                select: {
                  username: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!page) {
    redirect("/portfolios?error=portfolio-not-found");
  }

  return page;
}

function revalidatePortfolioPaths(username: string | null | undefined, slug: string) {
  revalidatePath("/portfolios");
  revalidatePath("/dashboard");
  revalidatePath("/pages");
  revalidatePath("/resumes");
  revalidatePath("/versions");

  if (!username) return;

  revalidatePath(`/${username}`);
  revalidatePath(`/${username}/resume`);
  revalidatePath(`/${username}/${slug}`);
  revalidatePath(`/${username}/${slug}/resume`);
}

async function getNextVersionSlug(userId: string) {
  const pages = await prisma.page.findMany({
    where: {
      version: {
        profile: {
          userId,
        },
      },
    },
    select: {
      slug: true,
    },
  });

  const used = new Set(pages.map((page) => page.slug));
  const maxVersion = pages.reduce((max, page) => {
    const match = /^v(\d+)$/i.exec(page.slug);
    return match ? Math.max(max, Number(match[1])) : max;
  }, 0);

  for (let index = Math.max(1, maxVersion + 1); index < 1000; index += 1) {
    const slug = `v${index}`;
    if (!used.has(slug)) return slug;
  }

  return `v${Date.now().toString(36)}`;
}

export async function setPortfolioPublishStateAction(
  pageId: string,
  nextState: PublishStateInput
) {
  const user = await requirePortfolioSession();
  const page = await getOwnedPageForAction(user.id, pageId);

  await upsertOwnedPageOutput(prisma, user.id, page.versionId, {
    title: page.title ?? page.version.name,
    slug: page.slug,
    templateId: page.templateId,
    publishState: nextState,
  });

  revalidatePortfolioPaths(
    page.version.profile.user.username ?? user.username,
    page.slug
  );
}

export async function setPortfolioResumeModeAction(
  pageId: string,
  nextState: PublishStateInput
) {
  const user = await requirePortfolioSession();
  const page = await getOwnedPageForAction(user.id, pageId);
  const resumeDefaults = readTemplateResumeDefaults(page.template.resumeDefaults);

  await upsertOwnedResumeOutput(prisma, user.id, page.versionId, {
    sections:
      page.version.resumeConfig?.sections.length &&
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

  revalidatePortfolioPaths(
    page.version.profile.user.username ?? user.username,
    page.slug
  );
}

export async function versionPortfolioAction(pageId: string) {
  const user = await requirePortfolioSession();
  const [profile, sourcePage] = await Promise.all([
    getOwnedProfileBase(prisma, user.id),
    getOwnedPageForAction(user.id, pageId),
  ]);

  const slug = await getNextVersionSlug(user.id);
  const baseTitle = sourcePage.title ?? sourcePage.version.name;
  const version = await createOwnedVersion(prisma, user.id, {
    name: `${baseTitle} ${slug.toUpperCase()}`,
    description: sourcePage.version.description ?? undefined,
    context: sourcePage.version.context ?? undefined,
    emoji: sourcePage.version.emoji ?? undefined,
    customHeadline: sourcePage.version.customHeadline ?? undefined,
    customBio: sourcePage.version.customBio ?? undefined,
    presentationId: sourcePage.version.presentationId ?? undefined,
    isDefault: false,
    selections: {
      experienceIds: profile.experiences.map((item) => item.id),
      educationIds: profile.educations.map((item) => item.id),
      projectIds: profile.projects.map((item) => item.id),
      skillIds: profile.skills.map((item) => item.id),
      achievementIds: profile.achievements.map((item) => item.id),
      proofIds: profile.proofs.map((item) => item.id),
      highlightIds: profile.highlights.map((item) => item.id),
      linkIds: profile.links.map((item) => item.id),
    },
  });

  const versionWithPage = await upsertOwnedPageOutput(prisma, user.id, version.id, {
    title: baseTitle,
    slug,
    templateId: sourcePage.templateId,
    publishState: "DRAFT",
  });
  const newPage = getPrimaryVersionPage(versionWithPage);

  const resumeDefaults = readTemplateResumeDefaults(sourcePage.template.resumeDefaults);
  await upsertOwnedResumeOutput(prisma, user.id, version.id, {
    sections:
      sourcePage.version.resumeConfig?.sections.length &&
      sourcePage.version.resumeConfig.sections.length > 0
        ? sourcePage.version.resumeConfig.sections
        : resumeDefaults.sections,
    layout: sourcePage.version.resumeConfig?.layout ?? resumeDefaults.layout,
    accentColor:
      sourcePage.version.resumeConfig?.accentColor ?? resumeDefaults.accentColor ?? "",
    showPhoto: sourcePage.version.resumeConfig?.showPhoto ?? resumeDefaults.showPhoto,
    showLinks: sourcePage.version.resumeConfig?.showLinks ?? resumeDefaults.showLinks,
    publishState: "DRAFT",
  });

  revalidatePortfolioPaths(profile.user.username ?? user.username, slug);

  if (newPage) {
    redirect(`/pages/${newPage.id}/editor`);
  }

  redirect("/portfolios");
}
