import { Prisma, PrismaClient } from "@/generated/prisma-client";
import { ApiRouteError } from "@/lib/server/api";
import {
  profileAggregateInclude,
  type ProfileAggregateWithBirthDate,
} from "@/lib/server/domain/includes";
import type { ProfileBaseInput, ProfileInput } from "@/lib/validations";

type DbClient = PrismaClient;
type ReadClient = PrismaClient | Prisma.TransactionClient;
type TxClient = Prisma.TransactionClient;
export type ProfileCollectionKey =
  | "highlights"
  | "experiences"
  | "educations"
  | "skills"
  | "projects"
  | "achievements"
  | "proofs"
  | "links";

const profileBaseSelect = {
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
  openToOpportunities: true,
  opportunityMotivation: true,
  showOpportunityMotivation: true,
} satisfies Prisma.ProfileSelect;

async function withProfileBirthDate<TProfile extends { birthDate: Date | null }>(
  _db: ReadClient,
  profile: TProfile
): Promise<TProfile & { birthDate: Date | null }> {
  return profile;
}

function sanitizeNullable(value: string | null | undefined) {
  if (value === undefined) return undefined;
  if (value === "") return null;
  return value;
}

function dedupeIds(ids: string[]) {
  return Array.from(new Set(ids));
}

async function getOwnedProfileRecordOrThrow(db: ReadClient, userId: string) {
  const profile = await db.profile.findUnique({
    where: { userId },
    select: { id: true },
  });

  if (!profile) {
    throw new ApiRouteError("NOT_FOUND", 404);
  }

  return profile;
}

async function assertOwnedIds(
  expectedOwnerId: string,
  ids: string[],
  findMany: (ids: string[]) => Promise<Array<{ id: string }>>,
  label: string
) {
  if (ids.length === 0) return;

  const owned = await findMany(ids);

  if (owned.length !== ids.length) {
    throw new ApiRouteError("FORBIDDEN", 403, {
      message: `${label} fora do escopo da conta`,
    });
  }

  void expectedOwnerId;
}

function collectReferencedAssetIds(input: ProfileBaseInput) {
  return dedupeIds(
    [
      ...(input.highlights ?? []).flatMap((item) =>
        item.assetId ? [item.assetId] : []
      ),
      ...(input.experiences ?? []).flatMap((item) =>
        item.logoAssetId ? [item.logoAssetId] : []
      ),
      ...(input.projects ?? []).flatMap((item) =>
        item.coverAssetId ? [item.coverAssetId] : []
      ),
      ...(input.achievements ?? []).flatMap((item) =>
        item.assetId ? [item.assetId] : []
      ),
      ...(input.proofs ?? []).flatMap((item) => (item.assetId ? [item.assetId] : [])),
    ].filter(Boolean)
  );
}

async function upsertAssets(
  tx: TxClient,
  profileId: string,
  assets: NonNullable<ProfileBaseInput["assets"]>
) {
  const assetIds = dedupeIds(assets.flatMap((asset) => (asset.id ? [asset.id] : [])));

  await assertOwnedIds(
    profileId,
    assetIds,
    async (ids) =>
      tx.asset.findMany({
        where: { profileId, id: { in: ids } },
        select: { id: true },
      }),
    "Assets"
  );

  for (const asset of assets) {
    const data = {
      kind: asset.kind,
      status: asset.status,
      url: asset.url,
      storageKey: asset.storageKey,
      name: sanitizeNullable(asset.name),
      altText: sanitizeNullable(asset.altText),
      mimeType: asset.mimeType,
      size: asset.size,
      width: asset.width ?? null,
      height: asset.height ?? null,
      metadata: asset.metadata,
    };

    if (asset.id) {
      await tx.asset.update({
        where: { id: asset.id },
        data,
      });
    } else {
      await tx.asset.create({
        data: {
          profileId,
          ...data,
        },
      });
    }
  }
}

async function syncCollection<TItem extends { id?: string }>(args: {
  tx: TxClient;
  profileId: string;
  items: TItem[];
  findExistingIds: () => Promise<Array<{ id: string }>>;
  deleteMissing: (keepIds: string[]) => Promise<unknown>;
  updateItem: (id: string, item: TItem, index: number) => Promise<unknown>;
  createItem: (item: TItem, index: number) => Promise<unknown>;
  label: string;
}) {
  const existingIds = new Set((await args.findExistingIds()).map((item) => item.id));
  const keepIds = dedupeIds(args.items.flatMap((item) => (item.id ? [item.id] : [])));

  for (const id of keepIds) {
    if (!existingIds.has(id)) {
      throw new ApiRouteError("FORBIDDEN", 403, {
        message: `${args.label} fora do escopo da conta`,
      });
    }
  }

  await args.deleteMissing(keepIds);

  for (const [index, item] of args.items.entries()) {
    if (item.id) {
      await args.updateItem(item.id, item, index);
    } else {
      await args.createItem(item, index);
    }
  }
}

export async function getOwnedProfileBase(
  db: DbClient,
  userId: string
): Promise<ProfileAggregateWithBirthDate> {
  const profile = await db.profile.findUnique({
    where: { userId },
    include: profileAggregateInclude,
  });

  if (!profile) {
    throw new ApiRouteError("NOT_FOUND", 404);
  }

  return withProfileBirthDate(db, profile);
}

export async function updateOwnedProfileFields(
  db: DbClient,
  userId: string,
  input: ProfileInput
) {
  return db.$transaction(async (tx) => {
    const profile = await getOwnedProfileRecordOrThrow(tx, userId);

    return tx.profile.update({
      where: { id: profile.id },
      data: {
        displayName: sanitizeNullable(input.displayName),
        avatarUrl: sanitizeNullable(input.avatarUrl),
        headline: sanitizeNullable(input.headline),
        bio: sanitizeNullable(input.bio),
        location: sanitizeNullable(input.location),
        pronouns: sanitizeNullable(input.pronouns),
        websiteUrl: sanitizeNullable(input.websiteUrl),
        publicEmail: sanitizeNullable(input.publicEmail),
        phone: sanitizeNullable(input.phone),
        openToOpportunities: input.openToOpportunities,
        opportunityMotivation: sanitizeNullable(input.opportunityMotivation),
        showOpportunityMotivation: input.showOpportunityMotivation,
        birthDate: input.birthDate ?? null,
      },
      select: profileBaseSelect,
    });
  });
}

export async function updateOwnedProfileCollection(
  db: DbClient,
  userId: string,
  collection: ProfileCollectionKey,
  items: NonNullable<ProfileBaseInput[ProfileCollectionKey]>
) {
  return db.$transaction(async (tx) => {
    const profile = await getOwnedProfileRecordOrThrow(tx, userId);

    if (collection === "highlights") {
      const typedItems = items as NonNullable<ProfileBaseInput["highlights"]>;
      const referencedAssetIds = dedupeIds(
        typedItems.flatMap((item) => (item.assetId ? [item.assetId] : []))
      );

      await assertOwnedIds(
        profile.id,
        referencedAssetIds,
        async (ids) =>
          tx.asset.findMany({
            where: { profileId: profile.id, id: { in: ids } },
            select: { id: true },
          }),
        "Assets"
      );

      await syncCollection({
        tx,
        profileId: profile.id,
        items: typedItems,
        label: "Highlights",
        findExistingIds: () =>
          tx.highlight.findMany({
            where: { profileId: profile.id },
            select: { id: true },
          }),
        deleteMissing: (keepIds) =>
          tx.highlight.deleteMany({
            where: {
              profileId: profile.id,
              id: keepIds.length > 0 ? { notIn: keepIds } : undefined,
            },
          }),
        updateItem: (id, item, index) =>
          tx.highlight.update({
            where: { id },
            data: {
              title: item.title,
              description: sanitizeNullable(item.description),
              metric: sanitizeNullable(item.metric),
              assetId: item.assetId ?? null,
              order: index,
            },
          }),
        createItem: (item, index) =>
          tx.highlight.create({
            data: {
              profileId: profile.id,
              title: item.title,
              description: sanitizeNullable(item.description),
              metric: sanitizeNullable(item.metric),
              assetId: item.assetId ?? null,
              order: index,
            },
          }),
      });

      return tx.highlight.findMany({
        where: { profileId: profile.id },
        orderBy: [{ order: "asc" }, { createdAt: "asc" }],
        select: {
          id: true,
          title: true,
          description: true,
          metric: true,
          assetId: true,
        },
      });
    }

    if (collection === "experiences") {
      const typedItems = items as NonNullable<ProfileBaseInput["experiences"]>;
      const referencedAssetIds = dedupeIds(
        typedItems.flatMap((item) => (item.logoAssetId ? [item.logoAssetId] : []))
      );

      await assertOwnedIds(
        profile.id,
        referencedAssetIds,
        async (ids) =>
          tx.asset.findMany({
            where: { profileId: profile.id, id: { in: ids } },
            select: { id: true },
          }),
        "Assets"
      );

      await syncCollection({
        tx,
        profileId: profile.id,
        items: typedItems,
        label: "Experiencias",
        findExistingIds: () =>
          tx.experience.findMany({
            where: { profileId: profile.id },
            select: { id: true },
          }),
        deleteMissing: (keepIds) =>
          tx.experience.deleteMany({
            where: {
              profileId: profile.id,
              id: keepIds.length > 0 ? { notIn: keepIds } : undefined,
            },
          }),
        updateItem: (id, item, index) =>
          tx.experience.update({
            where: { id },
            data: {
              company: item.company,
              role: item.role,
              description: sanitizeNullable(item.description),
              startDate: item.startDate,
              endDate: item.current ? null : (item.endDate ?? null),
              current: item.current,
              location: sanitizeNullable(item.location),
              logoUrl: sanitizeNullable(item.logoUrl),
              logoAssetId: item.logoAssetId ?? null,
              order: index,
            },
          }),
        createItem: (item, index) =>
          tx.experience.create({
            data: {
              profileId: profile.id,
              company: item.company,
              role: item.role,
              description: sanitizeNullable(item.description),
              startDate: item.startDate,
              endDate: item.current ? null : (item.endDate ?? null),
              current: item.current,
              location: sanitizeNullable(item.location),
              logoUrl: sanitizeNullable(item.logoUrl),
              logoAssetId: item.logoAssetId ?? null,
              order: index,
            },
          }),
      });

      return tx.experience.findMany({
        where: { profileId: profile.id },
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
      });
    }

    if (collection === "educations") {
      const typedItems = items as NonNullable<ProfileBaseInput["educations"]>;

      await syncCollection({
        tx,
        profileId: profile.id,
        items: typedItems,
        label: "Formacoes",
        findExistingIds: () =>
          tx.education.findMany({
            where: { profileId: profile.id },
            select: { id: true },
          }),
        deleteMissing: (keepIds) =>
          tx.education.deleteMany({
            where: {
              profileId: profile.id,
              id: keepIds.length > 0 ? { notIn: keepIds } : undefined,
            },
          }),
        updateItem: (id, item, index) =>
          tx.education.update({
            where: { id },
            data: {
              institution: item.institution,
              degree: sanitizeNullable(item.degree),
              field: sanitizeNullable(item.field),
              description: sanitizeNullable(item.description),
              startDate: item.startDate,
              endDate: item.current ? null : (item.endDate ?? null),
              current: item.current,
              logoUrl: sanitizeNullable(item.logoUrl),
              order: index,
            },
          }),
        createItem: (item, index) =>
          tx.education.create({
            data: {
              profileId: profile.id,
              institution: item.institution,
              degree: sanitizeNullable(item.degree),
              field: sanitizeNullable(item.field),
              description: sanitizeNullable(item.description),
              startDate: item.startDate,
              endDate: item.current ? null : (item.endDate ?? null),
              current: item.current,
              logoUrl: sanitizeNullable(item.logoUrl),
              order: index,
            },
          }),
      });

      return tx.education.findMany({
        where: { profileId: profile.id },
        orderBy: [{ order: "asc" }, { startDate: "desc" }],
        select: {
          id: true,
          institution: true,
          degree: true,
          field: true,
          description: true,
          startDate: true,
          endDate: true,
          current: true,
          logoUrl: true,
        },
      });
    }

    if (collection === "skills") {
      const typedItems = items as NonNullable<ProfileBaseInput["skills"]>;
      await syncCollection({
        tx,
        profileId: profile.id,
        items: typedItems,
        label: "Skills",
        findExistingIds: () =>
          tx.skill.findMany({
            where: { profileId: profile.id },
            select: { id: true },
          }),
        deleteMissing: (keepIds) =>
          tx.skill.deleteMany({
            where: {
              profileId: profile.id,
              id: keepIds.length > 0 ? { notIn: keepIds } : undefined,
            },
          }),
        updateItem: (id, item, index) =>
          tx.skill.update({
            where: { id },
            data: {
              name: item.name,
              category: sanitizeNullable(item.category),
              level: sanitizeNullable(item.level),
              order: index,
            },
          }),
        createItem: (item, index) =>
          tx.skill.create({
            data: {
              profileId: profile.id,
              name: item.name,
              category: sanitizeNullable(item.category),
              level: sanitizeNullable(item.level),
              order: index,
            },
          }),
      });

      return tx.skill.findMany({
        where: { profileId: profile.id },
        orderBy: { order: "asc" },
        select: {
          id: true,
          name: true,
          category: true,
          level: true,
        },
      });
    }

    if (collection === "projects") {
      const typedItems = items as NonNullable<ProfileBaseInput["projects"]>;
      const referencedAssetIds = dedupeIds(
        typedItems.flatMap((item) => (item.coverAssetId ? [item.coverAssetId] : []))
      );

      await assertOwnedIds(
        profile.id,
        referencedAssetIds,
        async (ids) =>
          tx.asset.findMany({
            where: { profileId: profile.id, id: { in: ids } },
            select: { id: true },
          }),
        "Assets"
      );

      await syncCollection({
        tx,
        profileId: profile.id,
        items: typedItems,
        label: "Projetos",
        findExistingIds: () =>
          tx.project.findMany({
            where: { profileId: profile.id },
            select: { id: true },
          }),
        deleteMissing: (keepIds) =>
          tx.project.deleteMany({
            where: {
              profileId: profile.id,
              id: keepIds.length > 0 ? { notIn: keepIds } : undefined,
            },
          }),
        updateItem: (id, item, index) =>
          tx.project.update({
            where: { id },
            data: {
              title: item.title,
              description: sanitizeNullable(item.description),
              imageUrl: sanitizeNullable(item.imageUrl),
              url: sanitizeNullable(item.url),
              repoUrl: sanitizeNullable(item.repoUrl),
              tags: item.tags,
              featured: item.featured,
              coverAssetId: item.coverAssetId ?? null,
              coverFitMode: item.coverFitMode,
              coverPositionX: item.coverPositionX,
              coverPositionY: item.coverPositionY,
              startDate: item.startDate ?? null,
              endDate: item.endDate ?? null,
              order: index,
            },
          }),
        createItem: (item, index) =>
          tx.project.create({
            data: {
              profileId: profile.id,
              title: item.title,
              description: sanitizeNullable(item.description),
              imageUrl: sanitizeNullable(item.imageUrl),
              url: sanitizeNullable(item.url),
              repoUrl: sanitizeNullable(item.repoUrl),
              tags: item.tags,
              featured: item.featured,
              coverAssetId: item.coverAssetId ?? null,
              coverFitMode: item.coverFitMode,
              coverPositionX: item.coverPositionX,
              coverPositionY: item.coverPositionY,
              startDate: item.startDate ?? null,
              endDate: item.endDate ?? null,
              order: index,
            },
          }),
      });

      return tx.project.findMany({
        where: { profileId: profile.id },
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
          coverFitMode: true,
          coverPositionX: true,
          coverPositionY: true,
          startDate: true,
          endDate: true,
        },
      });
    }

    if (collection === "achievements") {
      const typedItems = items as NonNullable<ProfileBaseInput["achievements"]>;
      const referencedAssetIds = dedupeIds(
        typedItems.flatMap((item) => (item.assetId ? [item.assetId] : []))
      );

      await assertOwnedIds(
        profile.id,
        referencedAssetIds,
        async (ids) =>
          tx.asset.findMany({
            where: { profileId: profile.id, id: { in: ids } },
            select: { id: true },
          }),
        "Assets"
      );

      await syncCollection({
        tx,
        profileId: profile.id,
        items: typedItems,
        label: "Achievements",
        findExistingIds: () =>
          tx.achievement.findMany({
            where: { profileId: profile.id },
            select: { id: true },
          }),
        deleteMissing: (keepIds) =>
          tx.achievement.deleteMany({
            where: {
              profileId: profile.id,
              id: keepIds.length > 0 ? { notIn: keepIds } : undefined,
            },
          }),
        updateItem: (id, item, index) =>
          tx.achievement.update({
            where: { id },
            data: {
              title: item.title,
              description: sanitizeNullable(item.description),
              date: item.date ?? null,
              metric: sanitizeNullable(item.metric),
              imageUrl: sanitizeNullable(item.imageUrl),
              assetId: item.assetId ?? null,
              order: index,
            },
          }),
        createItem: (item, index) =>
          tx.achievement.create({
            data: {
              profileId: profile.id,
              title: item.title,
              description: sanitizeNullable(item.description),
              date: item.date ?? null,
              metric: sanitizeNullable(item.metric),
              imageUrl: sanitizeNullable(item.imageUrl),
              assetId: item.assetId ?? null,
              order: index,
            },
          }),
      });

      return tx.achievement.findMany({
        where: { profileId: profile.id },
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
      });
    }

    if (collection === "proofs") {
      const typedItems = items as NonNullable<ProfileBaseInput["proofs"]>;
      const referencedAssetIds = dedupeIds(
        typedItems.flatMap((item) => (item.assetId ? [item.assetId] : []))
      );

      await assertOwnedIds(
        profile.id,
        referencedAssetIds,
        async (ids) =>
          tx.asset.findMany({
            where: { profileId: profile.id, id: { in: ids } },
            select: { id: true },
          }),
        "Assets"
      );

      await syncCollection({
        tx,
        profileId: profile.id,
        items: typedItems,
        label: "Proofs",
        findExistingIds: () =>
          tx.proof.findMany({
            where: { profileId: profile.id },
            select: { id: true },
          }),
        deleteMissing: (keepIds) =>
          tx.proof.deleteMany({
            where: {
              profileId: profile.id,
              id: keepIds.length > 0 ? { notIn: keepIds } : undefined,
            },
          }),
        updateItem: (id, item, index) =>
          tx.proof.update({
            where: { id },
            data: {
              title: item.title,
              description: sanitizeNullable(item.description),
              metric: sanitizeNullable(item.metric),
              url: sanitizeNullable(item.url),
              imageUrl: sanitizeNullable(item.imageUrl),
              assetId: item.assetId ?? null,
              tags: item.tags,
              reviewerName: sanitizeNullable(item.reviewerName) ?? item.title,
              reviewerRole: sanitizeNullable(item.reviewerRole),
              reviewerEmail: sanitizeNullable(item.reviewerEmail),
              rating: item.rating,
              isVisible: item.isVisible,
              source: item.source,
              order: index,
            },
          }),
        createItem: (item, index) =>
          tx.proof.create({
            data: {
              profileId: profile.id,
              title: item.title,
              description: sanitizeNullable(item.description),
              metric: sanitizeNullable(item.metric),
              url: sanitizeNullable(item.url),
              imageUrl: sanitizeNullable(item.imageUrl),
              assetId: item.assetId ?? null,
              tags: item.tags,
              reviewerName: sanitizeNullable(item.reviewerName) ?? item.title,
              reviewerRole: sanitizeNullable(item.reviewerRole),
              reviewerEmail: sanitizeNullable(item.reviewerEmail),
              rating: item.rating,
              isVisible: item.isVisible,
              source: item.source,
              order: index,
            },
          }),
      });

      return tx.proof.findMany({
        where: { profileId: profile.id },
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
          reviewerName: true,
          reviewerRole: true,
          reviewerEmail: true,
          rating: true,
          isVisible: true,
          source: true,
        },
      });
    }

    const typedItems = items as NonNullable<ProfileBaseInput["links"]>;
    await syncCollection({
      tx,
      profileId: profile.id,
      items: typedItems,
      label: "Links",
      findExistingIds: () =>
        tx.profileLink.findMany({
          where: { profileId: profile.id },
          select: { id: true },
        }),
      deleteMissing: (keepIds) =>
        tx.profileLink.deleteMany({
          where: {
            profileId: profile.id,
            id: keepIds.length > 0 ? { notIn: keepIds } : undefined,
          },
        }),
      updateItem: (id, item, index) =>
        tx.profileLink.update({
          where: { id },
          data: {
            platform: item.platform,
            url: item.url,
            label: sanitizeNullable(item.label),
            order: index,
          },
        }),
      createItem: (item, index) =>
        tx.profileLink.create({
          data: {
            profileId: profile.id,
            platform: item.platform,
            url: item.url,
            label: sanitizeNullable(item.label),
            order: index,
          },
        }),
    });

    return tx.profileLink.findMany({
      where: { profileId: profile.id },
      orderBy: { order: "asc" },
      select: {
        id: true,
        platform: true,
        label: true,
        url: true,
      },
    });
  });
}

export async function updateOwnedProfileBase(
  db: DbClient,
  userId: string,
  input: ProfileBaseInput
): Promise<ProfileAggregateWithBirthDate> {
  return db.$transaction(
    async (tx) => {
      const profile = await getOwnedProfileRecordOrThrow(tx, userId);

      if (input.assets) {
        await upsertAssets(tx, profile.id, input.assets);
      }

      const referencedAssetIds = collectReferencedAssetIds(input);

      await assertOwnedIds(
        profile.id,
        referencedAssetIds,
        async (ids) =>
          tx.asset.findMany({
            where: { profileId: profile.id, id: { in: ids } },
            select: { id: true },
          }),
        "Assets"
      );

      await tx.profile.update({
        where: { id: profile.id },
        data: {
          displayName: sanitizeNullable(input.displayName),
          avatarUrl: sanitizeNullable(input.avatarUrl),
          headline: sanitizeNullable(input.headline),
          bio: sanitizeNullable(input.bio),
          location: sanitizeNullable(input.location),
          pronouns: sanitizeNullable(input.pronouns),
          websiteUrl: sanitizeNullable(input.websiteUrl),
          publicEmail: sanitizeNullable(input.publicEmail),
          phone: sanitizeNullable(input.phone),
          openToOpportunities: input.openToOpportunities,
          opportunityMotivation: sanitizeNullable(input.opportunityMotivation),
          showOpportunityMotivation: input.showOpportunityMotivation,
        },
      });

      if (input.birthDate !== undefined) {
        await tx.$executeRaw(Prisma.sql`
          UPDATE "Profile"
          SET "birthDate" = ${input.birthDate ?? null}
          WHERE "id" = ${profile.id}
        `);
      }

      if (input.highlights) {
        await syncCollection({
          tx,
          profileId: profile.id,
          items: input.highlights,
          label: "Highlights",
          findExistingIds: () =>
            tx.highlight.findMany({
              where: { profileId: profile.id },
              select: { id: true },
            }),
          deleteMissing: (keepIds) =>
            tx.highlight.deleteMany({
              where: {
                profileId: profile.id,
                id: keepIds.length > 0 ? { notIn: keepIds } : undefined,
              },
            }),
          updateItem: (id, item, index) =>
            tx.highlight.update({
              where: { id },
              data: {
                title: item.title,
                description: sanitizeNullable(item.description),
                metric: sanitizeNullable(item.metric),
                assetId: item.assetId ?? null,
                order: index,
              },
            }),
          createItem: (item, index) =>
            tx.highlight.create({
              data: {
                profileId: profile.id,
                title: item.title,
                description: sanitizeNullable(item.description),
                metric: sanitizeNullable(item.metric),
                assetId: item.assetId ?? null,
                order: index,
              },
            }),
        });
      }

      if (input.experiences) {
        await syncCollection({
          tx,
          profileId: profile.id,
          items: input.experiences,
          label: "Experiencias",
          findExistingIds: () =>
            tx.experience.findMany({
              where: { profileId: profile.id },
              select: { id: true },
            }),
          deleteMissing: (keepIds) =>
            tx.experience.deleteMany({
              where: {
                profileId: profile.id,
                id: keepIds.length > 0 ? { notIn: keepIds } : undefined,
              },
            }),
          updateItem: (id, item, index) =>
            tx.experience.update({
              where: { id },
              data: {
                company: item.company,
                role: item.role,
                description: sanitizeNullable(item.description),
                startDate: item.startDate,
                endDate: item.current ? null : (item.endDate ?? null),
                current: item.current,
                location: sanitizeNullable(item.location),
                logoUrl: sanitizeNullable(item.logoUrl),
                logoAssetId: item.logoAssetId ?? null,
                order: index,
              },
            }),
          createItem: (item, index) =>
            tx.experience.create({
              data: {
                profileId: profile.id,
                company: item.company,
                role: item.role,
                description: sanitizeNullable(item.description),
                startDate: item.startDate,
                endDate: item.current ? null : (item.endDate ?? null),
                current: item.current,
                location: sanitizeNullable(item.location),
                logoUrl: sanitizeNullable(item.logoUrl),
                logoAssetId: item.logoAssetId ?? null,
                order: index,
              },
            }),
        });
      }

      if (input.educations) {
        await syncCollection({
          tx,
          profileId: profile.id,
          items: input.educations,
          label: "Formacoes",
          findExistingIds: () =>
            tx.education.findMany({
              where: { profileId: profile.id },
              select: { id: true },
            }),
          deleteMissing: (keepIds) =>
            tx.education.deleteMany({
              where: {
                profileId: profile.id,
                id: keepIds.length > 0 ? { notIn: keepIds } : undefined,
              },
            }),
          updateItem: (id, item, index) =>
            tx.education.update({
              where: { id },
              data: {
                institution: item.institution,
                degree: sanitizeNullable(item.degree),
                field: sanitizeNullable(item.field),
                description: sanitizeNullable(item.description),
                startDate: item.startDate,
                endDate: item.current ? null : (item.endDate ?? null),
                current: item.current,
                logoUrl: sanitizeNullable(item.logoUrl),
                order: index,
              },
            }),
          createItem: (item, index) =>
            tx.education.create({
              data: {
                profileId: profile.id,
                institution: item.institution,
                degree: sanitizeNullable(item.degree),
                field: sanitizeNullable(item.field),
                description: sanitizeNullable(item.description),
                startDate: item.startDate,
                endDate: item.current ? null : (item.endDate ?? null),
                current: item.current,
                logoUrl: sanitizeNullable(item.logoUrl),
                order: index,
              },
            }),
        });
      }

      if (input.skills) {
        await syncCollection({
          tx,
          profileId: profile.id,
          items: input.skills,
          label: "Skills",
          findExistingIds: () =>
            tx.skill.findMany({
              where: { profileId: profile.id },
              select: { id: true },
            }),
          deleteMissing: (keepIds) =>
            tx.skill.deleteMany({
              where: {
                profileId: profile.id,
                id: keepIds.length > 0 ? { notIn: keepIds } : undefined,
              },
            }),
          updateItem: (id, item, index) =>
            tx.skill.update({
              where: { id },
              data: {
                name: item.name,
                category: sanitizeNullable(item.category),
                level: sanitizeNullable(item.level),
                order: index,
              },
            }),
          createItem: (item, index) =>
            tx.skill.create({
              data: {
                profileId: profile.id,
                name: item.name,
                category: sanitizeNullable(item.category),
                level: sanitizeNullable(item.level),
                order: index,
              },
            }),
        });
      }

      if (input.projects) {
        await syncCollection({
          tx,
          profileId: profile.id,
          items: input.projects,
          label: "Projetos",
          findExistingIds: () =>
            tx.project.findMany({
              where: { profileId: profile.id },
              select: { id: true },
            }),
          deleteMissing: (keepIds) =>
            tx.project.deleteMany({
              where: {
                profileId: profile.id,
                id: keepIds.length > 0 ? { notIn: keepIds } : undefined,
              },
            }),
          updateItem: (id, item, index) =>
            tx.project.update({
              where: { id },
              data: {
                title: item.title,
                description: sanitizeNullable(item.description),
                imageUrl: sanitizeNullable(item.imageUrl),
                url: sanitizeNullable(item.url),
                repoUrl: sanitizeNullable(item.repoUrl),
                tags: item.tags,
                featured: item.featured,
                coverAssetId: item.coverAssetId ?? null,
                coverFitMode: item.coverFitMode,
                coverPositionX: item.coverPositionX,
                coverPositionY: item.coverPositionY,
                startDate: item.startDate ?? null,
                endDate: item.endDate ?? null,
                order: index,
              },
            }),
          createItem: (item, index) =>
            tx.project.create({
              data: {
                profileId: profile.id,
                title: item.title,
                description: sanitizeNullable(item.description),
                imageUrl: sanitizeNullable(item.imageUrl),
                url: sanitizeNullable(item.url),
                repoUrl: sanitizeNullable(item.repoUrl),
                tags: item.tags,
                featured: item.featured,
                coverAssetId: item.coverAssetId ?? null,
                coverFitMode: item.coverFitMode,
                coverPositionX: item.coverPositionX,
                coverPositionY: item.coverPositionY,
                startDate: item.startDate ?? null,
                endDate: item.endDate ?? null,
                order: index,
              },
            }),
        });
      }

      if (input.achievements) {
        await syncCollection({
          tx,
          profileId: profile.id,
          items: input.achievements,
          label: "Achievements",
          findExistingIds: () =>
            tx.achievement.findMany({
              where: { profileId: profile.id },
              select: { id: true },
            }),
          deleteMissing: (keepIds) =>
            tx.achievement.deleteMany({
              where: {
                profileId: profile.id,
                id: keepIds.length > 0 ? { notIn: keepIds } : undefined,
              },
            }),
          updateItem: (id, item, index) =>
            tx.achievement.update({
              where: { id },
              data: {
                title: item.title,
                description: sanitizeNullable(item.description),
                date: item.date ?? null,
                metric: sanitizeNullable(item.metric),
                imageUrl: sanitizeNullable(item.imageUrl),
                assetId: item.assetId ?? null,
                order: index,
              },
            }),
          createItem: (item, index) =>
            tx.achievement.create({
              data: {
                profileId: profile.id,
                title: item.title,
                description: sanitizeNullable(item.description),
                date: item.date ?? null,
                metric: sanitizeNullable(item.metric),
                imageUrl: sanitizeNullable(item.imageUrl),
                assetId: item.assetId ?? null,
                order: index,
              },
            }),
        });
      }

      if (input.proofs) {
        await syncCollection({
          tx,
          profileId: profile.id,
          items: input.proofs,
          label: "Proofs",
          findExistingIds: () =>
            tx.proof.findMany({
              where: { profileId: profile.id },
              select: { id: true },
            }),
          deleteMissing: (keepIds) =>
            tx.proof.deleteMany({
              where: {
                profileId: profile.id,
                id: keepIds.length > 0 ? { notIn: keepIds } : undefined,
              },
            }),
          updateItem: (id, item, index) =>
            tx.proof.update({
              where: { id },
              data: {
                title: item.title,
                description: sanitizeNullable(item.description),
                metric: sanitizeNullable(item.metric),
                url: sanitizeNullable(item.url),
                imageUrl: sanitizeNullable(item.imageUrl),
                assetId: item.assetId ?? null,
                tags: item.tags,
                reviewerName: sanitizeNullable(item.reviewerName) ?? item.title,
                reviewerRole: sanitizeNullable(item.reviewerRole),
                reviewerEmail: sanitizeNullable(item.reviewerEmail),
                rating: item.rating,
                isVisible: item.isVisible,
                source: item.source,
                order: index,
              },
            }),
          createItem: (item, index) =>
            tx.proof.create({
              data: {
                profileId: profile.id,
                title: item.title,
                description: sanitizeNullable(item.description),
                metric: sanitizeNullable(item.metric),
                url: sanitizeNullable(item.url),
                imageUrl: sanitizeNullable(item.imageUrl),
                assetId: item.assetId ?? null,
                tags: item.tags,
                reviewerName: sanitizeNullable(item.reviewerName) ?? item.title,
                reviewerRole: sanitizeNullable(item.reviewerRole),
                reviewerEmail: sanitizeNullable(item.reviewerEmail),
                rating: item.rating,
                isVisible: item.isVisible,
                source: item.source,
                order: index,
              },
            }),
        });
      }

      if (input.links) {
        await syncCollection({
          tx,
          profileId: profile.id,
          items: input.links,
          label: "Links",
          findExistingIds: () =>
            tx.profileLink.findMany({
              where: { profileId: profile.id },
              select: { id: true },
            }),
          deleteMissing: (keepIds) =>
            tx.profileLink.deleteMany({
              where: {
                profileId: profile.id,
                id: keepIds.length > 0 ? { notIn: keepIds } : undefined,
              },
            }),
          updateItem: (id, item, index) =>
            tx.profileLink.update({
              where: { id },
              data: {
                platform: item.platform,
                url: item.url,
                label: sanitizeNullable(item.label),
                order: index,
              },
            }),
          createItem: (item, index) =>
            tx.profileLink.create({
              data: {
                profileId: profile.id,
                platform: item.platform,
                url: item.url,
                label: sanitizeNullable(item.label),
                order: index,
              },
            }),
        });
      }

      const updatedProfile = await tx.profile.findUniqueOrThrow({
        where: { id: profile.id },
        include: profileAggregateInclude,
      });

      return withProfileBirthDate(tx, updatedProfile);
    },
    {
      maxWait: 10_000,
      timeout: 20_000,
    }
  );
}
