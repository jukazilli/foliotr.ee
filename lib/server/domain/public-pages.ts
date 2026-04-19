import { Prisma } from "@prisma/client";
import { notFound } from "next/navigation";
import type { ProfileForBlocks, VersionForBlocks } from "@/components/blocks/types";
import type { RenderablePageBlock } from "@/components/templates/types";
import { prisma } from "@/lib/prisma";

const publicPageInclude = Prisma.validator<Prisma.PageInclude>()({
  template: true,
  blocks: {
    where: { parentId: null },
    orderBy: { order: "asc" },
    include: {
      templateBlockDef: true,
      children: {
        orderBy: { order: "asc" },
        include: {
          templateBlockDef: true,
        },
      },
    },
  },
  version: {
    include: {
      resumeConfig: true,
      profile: {
        include: {
          user: {
            select: {
              name: true,
              email: true,
              username: true,
            },
          },
          experiences: { orderBy: [{ order: "asc" }, { startDate: "desc" }] },
          educations: { orderBy: [{ order: "asc" }, { startDate: "desc" }] },
          skills: { orderBy: { order: "asc" } },
          projects: { orderBy: [{ order: "asc" }] },
          achievements: { orderBy: { order: "asc" } },
          links: { orderBy: { order: "asc" } },
          proofs: { orderBy: { order: "asc" } },
        },
      },
      experiences: {
        orderBy: { order: "asc" },
        select: { experienceId: true },
      },
      projects: {
        orderBy: { order: "asc" },
        select: { projectId: true },
      },
      skills: {
        orderBy: { order: "asc" },
        select: { skillId: true },
      },
      achievements: {
        orderBy: { order: "asc" },
        select: { achievementId: true },
      },
      proofs: {
        orderBy: { order: "asc" },
        select: { proofId: true },
      },
      highlights: {
        orderBy: { order: "asc" },
        select: { highlightId: true },
      },
      links: {
        orderBy: { order: "asc" },
        select: { linkId: true },
      },
    },
  },
});

export type PublicPageRecord = Prisma.PageGetPayload<{
  include: typeof publicPageInclude;
}>;

function orderPublishedPages(pages: PublicPageRecord[]) {
  return [...pages].sort((left, right) => {
    if (left.version.isDefault !== right.version.isDefault) {
      return left.version.isDefault ? -1 : 1;
    }

    const leftTime = left.publishedAt ? new Date(left.publishedAt).getTime() : 0;
    const rightTime = right.publishedAt ? new Date(right.publishedAt).getTime() : 0;
    return rightTime - leftTime;
  });
}

export async function getPrimaryPublishedPage(username: string) {
  const pages = await prisma.page.findMany({
    where: {
      publishState: "PUBLISHED",
      version: {
        profile: {
          user: {
            username,
          },
        },
      },
    },
    include: publicPageInclude,
  });

  return orderPublishedPages(pages)[0] ?? null;
}

export async function getPublishedPageByUsernameAndSlug(username: string, slug: string) {
  return prisma.page.findFirst({
    where: {
      slug,
      publishState: "PUBLISHED",
      version: {
        profile: {
          user: {
            username,
          },
        },
      },
    },
    include: publicPageInclude,
  });
}

export function toPublicVersionSelection(page: PublicPageRecord): VersionForBlocks {
  return {
    customHeadline: page.version.customHeadline,
    customBio: page.version.customBio,
    selectedExperienceIds: page.version.experiences.map((item) => item.experienceId),
    selectedProjectIds: page.version.projects.map((item) => item.projectId),
    selectedSkillIds: page.version.skills.map((item) => item.skillId),
    selectedAchievementIds: page.version.achievements.map((item) => item.achievementId),
    selectedProofIds: page.version.proofs.map((item) => item.proofId),
    selectedHighlightIds: page.version.highlights.map((item) => item.highlightId),
    selectedLinkIds: page.version.links.map((item) => item.linkId),
  };
}

export function requirePublishedResume(page: PublicPageRecord) {
  if (page.version.resumeConfig?.publishState !== "PUBLISHED") {
    notFound();
  }

  return page.version.resumeConfig;
}

export function getPublicTemplateHref(username: string, pageSlug?: string | null) {
  return pageSlug ? `/${username}/${pageSlug}` : `/${username}`;
}

export function getPublicResumeHref(username: string, pageSlug?: string | null) {
  return pageSlug ? `/${username}/${pageSlug}/resume` : `/${username}/resume`;
}

export function getPublicPageBlocks(page: PublicPageRecord): RenderablePageBlock[] {
  return page.blocks;
}

export function getPublicProfile(page: PublicPageRecord): ProfileForBlocks {
  return page.version.profile;
}
