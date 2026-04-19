import { Prisma, PublishState } from "@/generated/prisma-client";
import { cache } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  versionAggregateInclude,
  type ProfileAggregateWithBirthDate,
} from "@/lib/server/domain/includes";
import { getOwnedProfileBase } from "@/lib/server/domain/profile-base";

export type AppProfile = ProfileAggregateWithBirthDate;

export interface AppViewer {
  profile: AppProfile;
  user: AppProfile["user"];
}

export interface AppShellViewer {
  profile: {
    displayName: string | null;
    avatarUrl: string | null;
    onboardingDone: boolean;
  };
  user: {
    id: string;
    name: string | null;
    username: string | null;
  };
}

export const requireSessionUser = cache(async () => {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  return session.user as typeof session.user & {
    id: string;
    username?: string | null;
  };
});

export const getAppViewer = cache(async (): Promise<AppViewer> => {
  const sessionUser = await requireSessionUser();
  const profile = await getOwnedProfileBase(prisma, sessionUser.id);

  if (!profile?.onboardingDone) {
    redirect("/onboarding");
  }

  return {
    profile,
    user: profile.user,
  };
});

export const getAppShellViewer = cache(async (): Promise<AppShellViewer> => {
  const sessionUser = await requireSessionUser();
  const profile = await prisma.profile.findUnique({
    where: { userId: sessionUser.id },
    select: {
      displayName: true,
      avatarUrl: true,
      onboardingDone: true,
      user: {
        select: {
          id: true,
          name: true,
          username: true,
        },
      },
    },
  });

  if (!profile) {
    redirect("/login");
  }

  if (!profile.onboardingDone) {
    redirect("/onboarding");
  }

  return {
    profile: {
      displayName: profile.displayName,
      avatarUrl: profile.avatarUrl,
      onboardingDone: profile.onboardingDone,
    },
    user: profile.user,
  };
});

export const getDashboardViewer = cache(async () => {
  const sessionUser = await requireSessionUser();
  const profile = await prisma.profile.findUnique({
    where: { userId: sessionUser.id },
    select: {
      displayName: true,
      headline: true,
      bio: true,
      websiteUrl: true,
      onboardingDone: true,
      _count: {
        select: {
          experiences: true,
          projects: true,
          links: true,
          achievements: true,
          proofs: true,
        },
      },
      user: {
        select: {
          name: true,
        },
      },
      versions: {
        orderBy: [{ isDefault: "desc" }, { updatedAt: "desc" }],
        select: {
          id: true,
          name: true,
          isDefault: true,
          updatedAt: true,
          pages: {
            orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
            take: 1,
            select: {
              id: true,
              publishState: true,
            },
          },
          resumeConfig: {
            select: {
              id: true,
              publishState: true,
            },
          },
        },
      },
    },
  });

  if (!profile) {
    redirect("/login");
  }

  if (!profile.onboardingDone) {
    redirect("/onboarding");
  }

  return profile;
});

export const getProfileEditorViewer = cache(async () => {
  const sessionUser = await requireSessionUser();
  const profile = await prisma.profile.findUnique({
    where: { userId: sessionUser.id },
    select: {
      id: true,
      displayName: true,
      avatarUrl: true,
      headline: true,
      bio: true,
      location: true,
      pronouns: true,
      websiteUrl: true,
      publicEmail: true,
      phone: true,
      birthDate: true,
      onboardingDone: true,
      user: {
        select: {
          username: true,
          name: true,
          email: true,
        },
      },
      highlights: {
        orderBy: [{ order: "asc" }, { createdAt: "asc" }],
        select: {
          id: true,
          title: true,
          description: true,
          metric: true,
          assetId: true,
        },
      },
      experiences: {
        orderBy: [{ order: "asc" }, { startDate: "desc" }],
        select: {
          id: true,
          company: true,
          role: true,
          description: true,
          startDate: true,
          endDate: true,
          current: true,
          location: true,
          logoUrl: true,
          logoAssetId: true,
        },
      },
      skills: {
        orderBy: { order: "asc" },
        select: {
          id: true,
          name: true,
          category: true,
          level: true,
        },
      },
      projects: {
        orderBy: [{ order: "asc" }, { updatedAt: "desc" }],
        select: {
          id: true,
          title: true,
          description: true,
          imageUrl: true,
          url: true,
          repoUrl: true,
          tags: true,
          featured: true,
          coverAssetId: true,
          startDate: true,
          endDate: true,
        },
      },
      achievements: {
        orderBy: [{ order: "asc" }, { date: "desc" }],
        select: {
          id: true,
          title: true,
          description: true,
          date: true,
          metric: true,
          imageUrl: true,
          assetId: true,
        },
      },
      proofs: {
        orderBy: [{ order: "asc" }, { createdAt: "asc" }],
        select: {
          id: true,
          title: true,
          description: true,
          metric: true,
          url: true,
          imageUrl: true,
          tags: true,
          assetId: true,
        },
      },
      links: {
        orderBy: { order: "asc" },
        select: {
          id: true,
          platform: true,
          label: true,
          url: true,
        },
      },
      versions: {
        orderBy: [{ isDefault: "desc" }, { updatedAt: "desc" }],
        select: {
          id: true,
          name: true,
          isDefault: true,
          pages: {
            orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
            take: 1,
            select: {
              id: true,
            },
          },
          resumeConfig: {
            select: {
              id: true,
            },
          },
        },
      },
    },
  });

  if (!profile) {
    redirect("/login");
  }

  if (!profile.onboardingDone) {
    redirect("/onboarding");
  }

  return profile;
});

export function profileAccessWhere(userId: string): Prisma.ProfileWhereUniqueInput {
  return { userId };
}

export function versionAccessWhere(userId: string): Prisma.VersionWhereInput {
  return {
    profile: {
      userId,
    },
  };
}

export function pageAccessWhere(userId: string): Prisma.PageWhereInput {
  return {
    version: {
      profile: {
        userId,
      },
    },
  };
}

export function resumeAccessWhere(userId: string): Prisma.ResumeConfigWhereInput {
  return {
    version: {
      profile: {
        userId,
      },
    },
  };
}

export async function getOwnedVersions(userId: string) {
  return prisma.version.findMany({
    where: versionAccessWhere(userId),
    orderBy: [{ isDefault: "desc" }, { updatedAt: "desc" }],
    include: versionAggregateInclude,
  });
}

export async function getOwnedPages(userId: string) {
  return prisma.page.findMany({
    where: pageAccessWhere(userId),
    orderBy: [{ publishState: "desc" }, { updatedAt: "desc" }],
    include: {
      template: true,
      version: {
        select: {
          id: true,
          name: true,
          context: true,
          updatedAt: true,
        },
      },
    },
  });
}

export async function getOwnedResumeConfigs(userId: string) {
  return prisma.resumeConfig.findMany({
    where: resumeAccessWhere(userId),
    orderBy: [
      { publishState: "desc" },
      { updatedAt: "desc" },
    ],
    include: {
      version: {
        select: {
          id: true,
          name: true,
          context: true,
          updatedAt: true,
          pages: {
            orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
            take: 1,
            select: {
              id: true,
              slug: true,
            },
          },
        },
      },
    },
  });
}

export function isPublishedState(state: PublishState) {
  return state === "PUBLISHED";
}
