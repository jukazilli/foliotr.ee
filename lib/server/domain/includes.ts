import { Prisma } from "@prisma/client";

export const versionAggregateInclude = Prisma.validator<Prisma.VersionInclude>()({
  page: {
    include: {
      template: true,
      blocks: {
        orderBy: { order: "asc" },
        include: {
          templateBlockDef: true,
          children: {
            orderBy: { order: "asc" },
            include: { templateBlockDef: true },
          },
        },
      },
    },
  },
  resumeConfig: true,
  experiences: {
    orderBy: { order: "asc" },
    include: {
      experience: true,
    },
  },
  projects: {
    orderBy: { order: "asc" },
    include: {
      project: true,
    },
  },
  skills: {
    orderBy: { order: "asc" },
    include: {
      skill: true,
    },
  },
  achievements: {
    orderBy: { order: "asc" },
    include: {
      achievement: true,
    },
  },
  proofs: {
    orderBy: { order: "asc" },
    include: {
      proof: {
        include: {
          asset: true,
        },
      },
    },
  },
  highlights: {
    orderBy: { order: "asc" },
    include: {
      highlight: {
        include: {
          asset: true,
        },
      },
    },
  },
  links: {
    orderBy: { order: "asc" },
    include: {
      link: true,
    },
  },
});

export const profileAggregateInclude = Prisma.validator<Prisma.ProfileInclude>()({
  user: {
    select: {
      id: true,
      email: true,
      username: true,
      name: true,
      createdAt: true,
      updatedAt: true,
    },
  },
  assets: { orderBy: { createdAt: "desc" } },
  highlights: {
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    include: {
      asset: true,
    },
  },
  experiences: {
    orderBy: [{ order: "asc" }, { startDate: "desc" }],
    include: {
      logoAsset: true,
    },
  },
  educations: {
    orderBy: [{ order: "asc" }, { startDate: "desc" }],
  },
  skills: { orderBy: { order: "asc" } },
  projects: {
    orderBy: [{ order: "asc" }, { updatedAt: "desc" }],
    include: {
      coverAsset: true,
    },
  },
  achievements: {
    orderBy: [{ order: "asc" }, { date: "desc" }],
    include: {
      asset: true,
    },
  },
  links: { orderBy: { order: "asc" } },
  proofs: {
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    include: {
      asset: true,
    },
  },
  versions: {
    orderBy: [{ isDefault: "desc" }, { updatedAt: "desc" }],
    include: versionAggregateInclude,
  },
});

export type VersionAggregate = Prisma.VersionGetPayload<{
  include: typeof versionAggregateInclude;
}>;

export type ProfileAggregate = Prisma.ProfileGetPayload<{
  include: typeof profileAggregateInclude;
}>;

export type ProfileAggregateWithBirthDate = ProfileAggregate & {
  birthDate: Date | null;
};

export function getVersionSelectionIds(version: VersionAggregate) {
  return {
    selectedExperienceIds: version.experiences.map((item) => item.experienceId),
    selectedProjectIds: version.projects.map((item) => item.projectId),
    selectedSkillIds: version.skills.map((item) => item.skillId),
    selectedAchievementIds: version.achievements.map((item) => item.achievementId),
    selectedProofIds: version.proofs.map((item) => item.proofId),
    selectedHighlightIds: version.highlights.map((item) => item.highlightId),
    selectedLinkIds: version.links.map((item) => item.linkId),
  };
}
