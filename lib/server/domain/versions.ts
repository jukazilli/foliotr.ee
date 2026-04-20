import { Prisma, PrismaClient, PublishState } from "@/generated/prisma-client";
import { ApiRouteError } from "@/lib/server/api";
import {
  getVersionSelectionIds,
  profileAggregateInclude,
  versionAggregateInclude,
  type ProfileAggregate,
  type VersionAggregate,
} from "@/lib/server/domain/includes";
import {
  asInputJsonValue,
  buildEditorSnapshot,
  buildPublishedPageSnapshot,
  buildPublishedResumeSnapshot,
  readPageEditorSnapshot,
} from "@/lib/server/domain/page-snapshots";
import { seedPageBlocksFromTemplate } from "@/lib/server/domain/templates";
import type {
  PageOutputInput,
  ResumeOutputInput,
  VersionInput,
  VersionSelectionInput,
} from "@/lib/validations";

type DbClient = PrismaClient;
type ReadClient = PrismaClient | Prisma.TransactionClient;
type TxClient = Prisma.TransactionClient;
const LONG_TRANSACTION_OPTIONS = {
  maxWait: 10_000,
  timeout: 20_000,
} as const;

function sanitizeNullable(value: string | null | undefined) {
  if (value === undefined) return undefined;
  if (value === "") return null;
  return value;
}

function dedupeIds(ids: string[]) {
  return Array.from(new Set(ids));
}

function resolvePublishedAt(
  publishState: PublishState,
  currentPublishedAt?: Date | null
): Date | null {
  if (publishState === "PUBLISHED") {
    return currentPublishedAt ?? new Date();
  }

  return null;
}

function resolvePublishedSnapshotAt(
  publishState: PublishState,
  currentPublishedSnapshotAt?: Date | null
) {
  if (publishState === "PUBLISHED") {
    return new Date();
  }

  return currentPublishedSnapshotAt ?? null;
}

async function getOwnedProfileAggregateOrThrow(
  db: ReadClient,
  userId: string
): Promise<ProfileAggregate> {
  const profile = await db.profile.findUnique({
    where: { userId },
    include: profileAggregateInclude,
  });

  if (!profile) {
    throw new ApiRouteError("NOT_FOUND", 404);
  }

  return profile;
}

export async function listOwnedVersions(
  db: DbClient,
  userId: string
): Promise<VersionAggregate[]> {
  const profile = await getOwnedProfileAggregateOrThrow(db, userId);
  return profile.versions;
}

export async function getOwnedVersion(
  db: DbClient,
  userId: string,
  versionId: string
): Promise<VersionAggregate> {
  const version = await db.version.findFirst({
    where: {
      id: versionId,
      profile: {
        userId,
      },
    },
    include: versionAggregateInclude,
  });

  if (!version) {
    throw new ApiRouteError("NOT_FOUND", 404);
  }

  return version;
}

function resolveDefaultSelections(profile: ProfileAggregate): VersionSelectionInput {
  return {
    experienceIds: profile.experiences.map((item) => item.id),
    educationIds: profile.educations.map((item) => item.id),
    projectIds: profile.projects.map((item) => item.id),
    skillIds: profile.skills.map((item) => item.id),
    achievementIds: profile.achievements.map((item) => item.id),
    proofIds: profile.proofs.map((item) => item.id),
    highlightIds: profile.highlights.map((item) => item.id),
    linkIds: profile.links.map((item) => item.id),
  };
}

async function assertVersionSelectionsOwned(
  tx: TxClient,
  profile: ProfileAggregate,
  selections: VersionSelectionInput
) {
  const checks = [
    {
      ids: selections.experienceIds,
      finder: (ids: string[]) =>
        tx.experience.findMany({
          where: { profileId: profile.id, id: { in: ids } },
          select: { id: true },
        }),
      label: "experiencias",
    },
    {
      ids: selections.educationIds,
      finder: (ids: string[]) =>
        tx.education.findMany({
          where: { profileId: profile.id, id: { in: ids } },
          select: { id: true },
        }),
      label: "formacoes",
    },
    {
      ids: selections.projectIds,
      finder: (ids: string[]) =>
        tx.project.findMany({
          where: { profileId: profile.id, id: { in: ids } },
          select: { id: true },
        }),
      label: "projetos",
    },
    {
      ids: selections.skillIds,
      finder: (ids: string[]) =>
        tx.skill.findMany({
          where: { profileId: profile.id, id: { in: ids } },
          select: { id: true },
        }),
      label: "skills",
    },
    {
      ids: selections.achievementIds,
      finder: (ids: string[]) =>
        tx.achievement.findMany({
          where: { profileId: profile.id, id: { in: ids } },
          select: { id: true },
        }),
      label: "achievements",
    },
    {
      ids: selections.proofIds,
      finder: (ids: string[]) =>
        tx.proof.findMany({
          where: { profileId: profile.id, id: { in: ids } },
          select: { id: true },
        }),
      label: "proofs",
    },
    {
      ids: selections.highlightIds,
      finder: (ids: string[]) =>
        tx.highlight.findMany({
          where: { profileId: profile.id, id: { in: ids } },
          select: { id: true },
        }),
      label: "highlights",
    },
    {
      ids: selections.linkIds,
      finder: (ids: string[]) =>
        tx.profileLink.findMany({
          where: { profileId: profile.id, id: { in: ids } },
          select: { id: true },
        }),
      label: "links",
    },
  ];

  for (const check of checks) {
    const ids = dedupeIds(check.ids);

    if (ids.length === 0) continue;

    const owned = await check.finder(ids);

    if (owned.length !== ids.length) {
      throw new ApiRouteError("FORBIDDEN", 403, {
        message: `Selecao invalida de ${check.label}`,
      });
    }
  }
}

async function syncVersionSelections(
  tx: TxClient,
  versionId: string,
  selections: VersionSelectionInput
) {
  await tx.versionExperience.deleteMany({ where: { versionId } });
  await tx.versionEducation.deleteMany({ where: { versionId } });
  await tx.versionProject.deleteMany({ where: { versionId } });
  await tx.versionSkill.deleteMany({ where: { versionId } });
  await tx.versionAchievement.deleteMany({ where: { versionId } });
  await tx.versionProof.deleteMany({ where: { versionId } });
  await tx.versionHighlight.deleteMany({ where: { versionId } });
  await tx.versionLink.deleteMany({ where: { versionId } });

  if (selections.experienceIds.length > 0) {
    await tx.versionExperience.createMany({
      data: dedupeIds(selections.experienceIds).map((experienceId, order) => ({
        versionId,
        experienceId,
        order,
      })),
    });
  }

  if (selections.educationIds.length > 0) {
    await tx.versionEducation.createMany({
      data: dedupeIds(selections.educationIds).map((educationId, order) => ({
        versionId,
        educationId,
        order,
      })),
    });
  }

  if (selections.projectIds.length > 0) {
    await tx.versionProject.createMany({
      data: dedupeIds(selections.projectIds).map((projectId, order) => ({
        versionId,
        projectId,
        order,
      })),
    });
  }

  if (selections.skillIds.length > 0) {
    await tx.versionSkill.createMany({
      data: dedupeIds(selections.skillIds).map((skillId, order) => ({
        versionId,
        skillId,
        order,
      })),
    });
  }

  if (selections.achievementIds.length > 0) {
    await tx.versionAchievement.createMany({
      data: dedupeIds(selections.achievementIds).map((achievementId, order) => ({
        versionId,
        achievementId,
        order,
      })),
    });
  }

  if (selections.proofIds.length > 0) {
    await tx.versionProof.createMany({
      data: dedupeIds(selections.proofIds).map((proofId, order) => ({
        versionId,
        proofId,
        order,
      })),
    });
  }

  if (selections.highlightIds.length > 0) {
    await tx.versionHighlight.createMany({
      data: dedupeIds(selections.highlightIds).map((highlightId, order) => ({
        versionId,
        highlightId,
        order,
      })),
    });
  }

  if (selections.linkIds.length > 0) {
    await tx.versionLink.createMany({
      data: dedupeIds(selections.linkIds).map((linkId, order) => ({
        versionId,
        linkId,
        order,
      })),
    });
  }
}

function needsDefaultFlag(profile: ProfileAggregate, input: VersionInput) {
  if (typeof input.isDefault === "boolean") {
    return input.isDefault;
  }

  return profile.versions.length === 0;
}

export async function createOwnedVersion(
  db: DbClient,
  userId: string,
  input: VersionInput
): Promise<VersionAggregate> {
  return db.$transaction(async (tx) => {
    const profile = await getOwnedProfileAggregateOrThrow(tx, userId);
    const isDefault = needsDefaultFlag(profile, input);
    const selections = input.selections ?? resolveDefaultSelections(profile);

    await assertVersionSelectionsOwned(tx, profile, selections);

    if (isDefault) {
      await tx.version.updateMany({
        where: { profileId: profile.id, isDefault: true },
        data: { isDefault: false },
      });
    }

    const version = await tx.version.create({
      data: {
        profileId: profile.id,
        name: input.name,
        description: sanitizeNullable(input.description),
        context: sanitizeNullable(input.context),
        emoji: sanitizeNullable(input.emoji),
        customHeadline: sanitizeNullable(input.customHeadline),
        customBio: sanitizeNullable(input.customBio),
        isDefault,
      },
      include: versionAggregateInclude,
    });

    await syncVersionSelections(tx, version.id, selections);

    return tx.version.findUniqueOrThrow({
      where: { id: version.id },
      include: versionAggregateInclude,
    });
  });
}

export async function updateOwnedVersion(
  db: DbClient,
  userId: string,
  versionId: string,
  input: VersionInput
): Promise<VersionAggregate> {
  return db.$transaction(async (tx) => {
    const profile = await getOwnedProfileAggregateOrThrow(tx, userId);
    const existing = await tx.version.findFirst({
      where: { id: versionId, profileId: profile.id },
      include: versionAggregateInclude,
    });

    if (!existing) {
      throw new ApiRouteError("NOT_FOUND", 404);
    }

    const shouldBeDefault =
      typeof input.isDefault === "boolean" ? input.isDefault : existing.isDefault;

    if (shouldBeDefault) {
      await tx.version.updateMany({
        where: { profileId: profile.id, isDefault: true, id: { not: versionId } },
        data: { isDefault: false },
      });
    }

    await tx.version.update({
      where: { id: versionId },
      data: {
        name: input.name,
        description: sanitizeNullable(input.description),
        context: sanitizeNullable(input.context),
        emoji: sanitizeNullable(input.emoji),
        customHeadline: sanitizeNullable(input.customHeadline),
        customBio: sanitizeNullable(input.customBio),
        isDefault: shouldBeDefault,
      },
    });

    if (input.selections) {
      await assertVersionSelectionsOwned(tx, profile, input.selections);
      await syncVersionSelections(tx, versionId, input.selections);
    }

    return tx.version.findUniqueOrThrow({
      where: { id: versionId },
      include: versionAggregateInclude,
    });
  });
}

async function getOwnedVersionRecordOrThrow(
  tx: TxClient,
  userId: string,
  versionId: string
) {
  const version = await tx.version.findFirst({
    where: {
      id: versionId,
      profile: {
        userId,
      },
    },
    select: {
      id: true,
      profileId: true,
    },
  });

  if (!version) {
    throw new ApiRouteError("NOT_FOUND", 404);
  }

  return version;
}

export async function upsertOwnedPageOutput(
  db: DbClient,
  userId: string,
  versionId: string,
  input: PageOutputInput
): Promise<VersionAggregate> {
  return db.$transaction(
    async (tx) => {
      const version = await getOwnedVersionRecordOrThrow(tx, userId, versionId);
      const profile = await getOwnedProfileAggregateOrThrow(tx, userId);
      const versionAggregate = await tx.version.findUniqueOrThrow({
        where: { id: version.id },
        include: versionAggregateInclude,
      });

      const template = await tx.template.findUnique({
        where: { id: input.templateId },
        select: { id: true, isActive: true },
      });

      if (!template?.isActive) {
        throw new ApiRouteError("BAD_REQUEST", 400, {
          message: "Template invalido ou inativo",
        });
      }

      const existingSlug = await tx.page.findFirst({
        where: {
          slug: input.slug,
          NOT: {
            versionId: version.id,
            templateId: input.templateId,
          },
        },
        select: { id: true },
      });

      if (existingSlug) {
        throw new ApiRouteError("CONFLICT", 409, {
          message: "Slug ja utilizada por outra pagina",
        });
      }

      const current = await tx.page.findFirst({
        where: {
          versionId: version.id,
          templateId: input.templateId,
        },
        select: {
          id: true,
          publishedAt: true,
          templateId: true,
          editorSnapshot: true,
          publishedSnapshotAt: true,
        },
      });
      const nextEditorSnapshot =
        current?.templateId === input.templateId
          ? readPageEditorSnapshot(current?.editorSnapshot) ??
            buildEditorSnapshot(profile, versionAggregate)
          : buildEditorSnapshot(profile, versionAggregate);

      const page = current
        ? await tx.page.update({
            where: { id: current.id },
            data: {
              title: sanitizeNullable(input.title),
              slug: input.slug,
              templateId: input.templateId,
              publishState: input.publishState,
              publishedAt: resolvePublishedAt(input.publishState, current.publishedAt),
              editorSnapshot: asInputJsonValue(nextEditorSnapshot),
              snapshotUpdatedAt: new Date(),
            },
          })
        : await tx.page.create({
            data: {
              versionId: version.id,
              title: sanitizeNullable(input.title),
              slug: input.slug,
              templateId: input.templateId,
              publishState: input.publishState,
              publishedAt: resolvePublishedAt(input.publishState, null),
              editorSnapshot: asInputJsonValue(nextEditorSnapshot),
              snapshotUpdatedAt: new Date(),
            },
          });

      await seedPageBlocksFromTemplate(tx, page.id, input.templateId, {
        profile,
        version: versionAggregate,
        replaceExisting: current?.templateId ? current.templateId !== input.templateId : false,
      });

      if (input.publishState === "PUBLISHED") {
        const blocks = await tx.pageBlock.findMany({
          where: {
            pageId: page.id,
            parentId: null,
          },
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
        });

        await tx.page.update({
          where: { id: page.id },
          data: {
            publishedSnapshot: asInputJsonValue(
              buildPublishedPageSnapshot({
                editorSnapshot: nextEditorSnapshot,
                blocks,
              })
            ),
            publishedSnapshotAt: resolvePublishedSnapshotAt(
              input.publishState,
              current?.publishedSnapshotAt
            ),
          },
        });
      }

      return tx.version.findUniqueOrThrow({
        where: { id: version.id },
        include: versionAggregateInclude,
      });
    },
    LONG_TRANSACTION_OPTIONS
  );
}

export async function upsertOwnedResumeOutput(
  db: DbClient,
  userId: string,
  versionId: string,
  input: ResumeOutputInput
): Promise<VersionAggregate> {
  return db.$transaction(
    async (tx) => {
      const version = await getOwnedVersionRecordOrThrow(tx, userId, versionId);
      const profile = await getOwnedProfileAggregateOrThrow(tx, userId);
      const versionAggregate = await tx.version.findUniqueOrThrow({
        where: { id: version.id },
        include: versionAggregateInclude,
      });
      const current = await tx.resumeConfig.findUnique({
        where: { versionId: version.id },
        select: { publishedAt: true, publishedSnapshotAt: true },
      });

      const resumeConfig = await tx.resumeConfig.upsert({
        where: { versionId: version.id },
        update: {
          sections: input.sections,
          layout: input.layout,
          accentColor: sanitizeNullable(input.accentColor),
          showPhoto: input.showPhoto,
          showLinks: input.showLinks,
          publishState: input.publishState,
          publishedAt: resolvePublishedAt(input.publishState, current?.publishedAt),
        },
        create: {
          versionId: version.id,
          sections: input.sections,
          layout: input.layout,
          accentColor: sanitizeNullable(input.accentColor),
          showPhoto: input.showPhoto,
          showLinks: input.showLinks,
          publishState: input.publishState,
          publishedAt: resolvePublishedAt(input.publishState, null),
        },
      });

      if (input.publishState === "PUBLISHED") {
        const page = await tx.page.findFirst({
          where: { versionId: version.id },
          orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
          select: {
            id: true,
            editorSnapshot: true,
          },
        });

        if (!page) {
          throw new ApiRouteError("BAD_REQUEST", 400, {
            message: "Pagina obrigatoria antes de publicar curriculo",
          });
        }

        const editorSnapshot =
          readPageEditorSnapshot(page.editorSnapshot) ??
          buildEditorSnapshot(profile, versionAggregate);
        const blocks = await tx.pageBlock.findMany({
          where: {
            pageId: page.id,
            parentId: null,
          },
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
        });

        await tx.resumeConfig.update({
          where: { versionId: version.id },
          data: {
            publishedSnapshot: asInputJsonValue(
              buildPublishedResumeSnapshot({
                editorSnapshot,
                blocks,
                config: resumeConfig,
              })
            ),
            publishedSnapshotAt: resolvePublishedSnapshotAt(
              input.publishState,
              current?.publishedSnapshotAt
            ),
          },
        });
      }

      return tx.version.findUniqueOrThrow({
        where: { id: version.id },
        include: versionAggregateInclude,
      });
    },
    LONG_TRANSACTION_OPTIONS
  );
}

export async function syncOwnedPageSnapshot(
  db: DbClient,
  userId: string,
  pageId: string
): Promise<VersionAggregate> {
  return db.$transaction(async (tx) => {
    const page = await tx.page.findFirst({
      where: {
        id: pageId,
        version: {
          profile: {
            userId,
          },
        },
      },
      select: {
        id: true,
        versionId: true,
        templateId: true,
      },
    });

    if (!page) {
      throw new ApiRouteError("NOT_FOUND", 404);
    }

    const profile = await getOwnedProfileAggregateOrThrow(tx, userId);
    const versionAggregate = await tx.version.findUniqueOrThrow({
      where: { id: page.versionId },
      include: versionAggregateInclude,
    });
    const editorSnapshot = buildEditorSnapshot(profile, versionAggregate);

    await tx.page.update({
      where: { id: page.id },
      data: {
        editorSnapshot: asInputJsonValue(editorSnapshot),
        snapshotUpdatedAt: new Date(),
      },
    });

    await seedPageBlocksFromTemplate(tx, page.id, page.templateId, {
      profile,
      version: versionAggregate,
      replaceExisting: true,
    });

    return tx.version.findUniqueOrThrow({
      where: { id: page.versionId },
      include: versionAggregateInclude,
    });
  });
}

export function toLegacyVersionSelection(version: VersionAggregate) {
  return getVersionSelectionIds(version);
}
