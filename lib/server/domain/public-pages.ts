import { Prisma } from "@/generated/prisma-client";
import { notFound } from "next/navigation";
import type { ProfileForBlocks, VersionForBlocks } from "@/components/blocks/types";
import type { RenderablePageBlock } from "@/components/templates/types";
import { prisma } from "@/lib/prisma";
import {
  readPublishedPageSnapshot,
  readPublishedResumeSnapshot,
} from "@/lib/server/domain/page-snapshots";

const publicPageInclude = Prisma.validator<Prisma.PageInclude>()({
  template: true,
  version: {
    select: {
      resumeConfig: {
        select: {
          publishState: true,
          publishedSnapshot: true,
        },
      },
      isDefault: true,
      name: true,
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

function requirePublishedPageSnapshot(page: PublicPageRecord) {
  const snapshot = readPublishedPageSnapshot(page.publishedSnapshot);
  if (!snapshot) {
    notFound();
  }

  return snapshot;
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
  return requirePublishedPageSnapshot(page).version;
}

export function requirePublishedResume(page: PublicPageRecord) {
  if (page.version.resumeConfig?.publishState !== "PUBLISHED") {
    notFound();
  }

  const snapshot = readPublishedResumeSnapshot(page.version.resumeConfig.publishedSnapshot);
  if (!snapshot) {
    notFound();
  }

  return {
    resumeConfig: page.version.resumeConfig,
    snapshot,
  };
}

export function getPublicTemplateHref(username: string, pageSlug?: string | null) {
  return pageSlug ? `/${username}/${pageSlug}` : `/${username}`;
}

export function getPublicResumeHref(username: string, pageSlug?: string | null) {
  return pageSlug ? `/${username}/${pageSlug}/resume` : `/${username}/resume`;
}

export function getPublicPageBlocks(page: PublicPageRecord): RenderablePageBlock[] {
  return requirePublishedPageSnapshot(page).blocks;
}

export function getPublicProfile(page: PublicPageRecord): ProfileForBlocks {
  return requirePublishedPageSnapshot(page).profile;
}
