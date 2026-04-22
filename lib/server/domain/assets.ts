import { PrismaClient } from "@/generated/prisma-client";
import { ApiRouteError } from "@/lib/server/api";
import { normalizeStoragePublicUrl } from "@/lib/storage/public-url";
import { deleteImageFromLocal } from "@/lib/storage/local";
import { deleteImageFromS3 } from "@/lib/storage/s3";
import { getOwnedProfileBase } from "@/lib/server/domain/profile-base";
import type { AssetInput } from "@/lib/validations";

type DbClient = PrismaClient;
type AssetKindInput = "IMAGE" | "DOCUMENT" | "VIDEO" | "AUDIO" | "OTHER";
type AssetStatusInput = "PENDING" | "READY" | "FAILED";
type AssetUsageLocationType =
  | "avatar"
  | "project_cover"
  | "experience_logo"
  | "achievement"
  | "highlight"
  | "proof"
  | "page_block";

export interface ListOwnedAssetsInput {
  kind?: AssetKindInput;
  status?: AssetStatusInput;
  limit?: number;
  cursor?: string | null;
  page?: number | null;
}

export interface AssetUsageLocation {
  type: AssetUsageLocationType;
  label: string;
  referenceId?: string;
}

export interface AssetUsageSummary {
  inUse: boolean;
  count: number;
  locations: AssetUsageLocation[];
}

function sanitizeNullable(value: string | null | undefined) {
  if (value === undefined) return undefined;
  if (value === "") return null;
  return value;
}

function readAssetProvider(metadata: unknown) {
  if (typeof metadata !== "object" || metadata === null || Array.isArray(metadata)) {
    return "";
  }

  const provider = (metadata as { provider?: unknown }).provider;
  return typeof provider === "string" ? provider : "";
}

function readAssetBucket(metadata: unknown) {
  if (typeof metadata !== "object" || metadata === null || Array.isArray(metadata)) {
    return "";
  }

  const bucket = (metadata as { bucket?: unknown }).bucket;
  return typeof bucket === "string" ? bucket : "";
}

function toGalleryAssetUrl(asset: {
  url: string;
  storageKey: string;
  metadata: unknown;
}) {
  if (
    readAssetProvider(asset.metadata) === "s3" &&
    asset.storageKey.startsWith("uploads/")
  ) {
    return `/api/assets/proxy?key=${encodeURIComponent(asset.storageKey)}`;
  }

  return asset.url;
}

function collectAssetIdsFromPayload(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.flatMap((item) => collectAssetIdsFromPayload(item));
  }

  if (typeof value !== "object" || value === null) {
    return [];
  }

  const record = value as Record<string, unknown>;
  const assetIds = typeof record.assetId === "string" ? [record.assetId] : [];

  return [...assetIds, ...Object.values(record).flatMap((item) => collectAssetIdsFromPayload(item))];
}

function dedupeUsageLocations(locations: AssetUsageLocation[]) {
  const seen = new Set<string>();

  return locations.filter((location) => {
    const key = [location.type, location.referenceId ?? "", location.label].join("::");

    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function toUsageSummary(locations: AssetUsageLocation[]): AssetUsageSummary {
  const uniqueLocations = dedupeUsageLocations(locations);

  return {
    inUse: uniqueLocations.length > 0,
    count: uniqueLocations.length,
    locations: uniqueLocations,
  };
}

function buildPageBlockUsageLabel(page: { title: string | null; slug: string }, blockType: string) {
  const pageLabel = page.title?.trim() || page.slug;
  const normalizedBlockType = blockType.replace(/[-_]+/g, " ").trim();

  return normalizedBlockType ? `${pageLabel} - ${normalizedBlockType}` : pageLabel;
}

async function buildOwnedAssetUsageMap(
  db: DbClient,
  userId: string,
  assetRecords: Array<{
    id: string;
    url: string;
    storageKey: string;
    metadata: unknown;
  }>
) {
  const profile = await getOwnedProfileBase(db, userId);
  const assetIds = Array.from(new Set(assetRecords.map((asset) => asset.id)));
  const usageMap = new Map<string, AssetUsageLocation[]>();

  assetIds.forEach((assetId) => {
    usageMap.set(assetId, []);
  });

  if (assetIds.length === 0) {
    return new Map<string, AssetUsageSummary>();
  }

  const [relations, profileAvatar, pageBlocks] = await Promise.all([
    db.asset.findMany({
      where: {
        id: { in: assetIds },
        profileId: profile.id,
      },
      select: {
        id: true,
        projectCovers: {
          select: {
            id: true,
            title: true,
          },
        },
        proofAssets: {
          select: {
            id: true,
            title: true,
          },
        },
        highlightAssets: {
          select: {
            id: true,
            title: true,
          },
        },
        achievementAssets: {
          select: {
            id: true,
            title: true,
          },
        },
        experienceLogos: {
          select: {
            id: true,
            company: true,
            role: true,
          },
        },
      },
    }),
    db.profile.findUnique({
      where: { id: profile.id },
      select: { avatarUrl: true },
    }),
    db.pageBlock.findMany({
      where: {
        page: {
          version: {
            profileId: profile.id,
          },
        },
      },
      select: {
        id: true,
        blockType: true,
        assets: true,
        page: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
      },
    }),
  ]);

  function addUsageLocation(assetId: string, location: AssetUsageLocation) {
    usageMap.set(assetId, [...(usageMap.get(assetId) ?? []), location]);
  }

  if (profileAvatar?.avatarUrl) {
    const normalizedAvatarUrl = normalizeStoragePublicUrl(profileAvatar.avatarUrl);

    assetRecords.forEach((asset) => {
      const normalizedAssetUrl = normalizeStoragePublicUrl(
        toGalleryAssetUrl({
          url: asset.url,
          storageKey: asset.storageKey,
          metadata: asset.metadata,
        })
      );

      if (normalizedAssetUrl === normalizedAvatarUrl) {
        addUsageLocation(asset.id, {
          type: "avatar",
          label: "Foto do perfil",
        });
      }
    });
  }

  relations.forEach((asset) => {
    asset.projectCovers.forEach((project) => {
      addUsageLocation(asset.id, {
        type: "project_cover",
        label: project.title || "Capa de projeto",
        referenceId: project.id,
      });
    });

    asset.experienceLogos.forEach((experience) => {
      addUsageLocation(asset.id, {
        type: "experience_logo",
        label: experience.role || experience.company || "Logo de experiencia",
        referenceId: experience.id,
      });
    });

    asset.achievementAssets.forEach((achievement) => {
      addUsageLocation(asset.id, {
        type: "achievement",
        label: achievement.title || "Reconhecimento",
        referenceId: achievement.id,
      });
    });

    asset.highlightAssets.forEach((highlight) => {
      addUsageLocation(asset.id, {
        type: "highlight",
        label: highlight.title || "Highlight",
        referenceId: highlight.id,
      });
    });

    asset.proofAssets.forEach((proof) => {
      addUsageLocation(asset.id, {
        type: "proof",
        label: proof.title || "Prova",
        referenceId: proof.id,
      });
    });
  });

  pageBlocks.forEach((pageBlock) => {
    const blockAssetIds = new Set(collectAssetIdsFromPayload(pageBlock.assets));

    assetIds.forEach((assetId) => {
      if (!blockAssetIds.has(assetId)) return;

      addUsageLocation(assetId, {
        type: "page_block",
        label: buildPageBlockUsageLabel(pageBlock.page, pageBlock.blockType),
        referenceId: pageBlock.id,
      });
    });
  });

  return new Map(
    assetIds.map((assetId) => [assetId, toUsageSummary(usageMap.get(assetId) ?? [])])
  );
}

async function deleteStoredAssetObject(asset: {
  storageKey: string;
  metadata: unknown;
}) {
  const provider = readAssetProvider(asset.metadata);

  if (provider === "local") {
    await deleteImageFromLocal(asset.storageKey);
    return;
  }

  if (provider === "s3") {
    await deleteImageFromS3(asset.storageKey);
  }
}

function isLocalOnlyAsset(asset: { url: string; metadata: unknown }) {
  return (
    readAssetProvider(asset.metadata) === "local" || asset.url.startsWith("/uploads/")
  );
}

function isListableAsset(
  asset: { url: string; storageKey: string; metadata: unknown },
  userId: string
) {
  if (isLocalOnlyAsset(asset) && process.env.STORAGE_PROVIDER !== "local") {
    return false;
  }

  return (
    !asset.storageKey.startsWith("uploads/") ||
    asset.storageKey.startsWith(`uploads/${userId}/`)
  );
}

export async function createOwnedAsset(
  db: DbClient,
  userId: string,
  input: AssetInput
) {
  const profile = await getOwnedProfileBase(db, userId);

  return db.asset.create({
    data: {
      profileId: profile.id,
      kind: input.kind,
      status: input.status,
      url: input.url,
      storageKey: input.storageKey,
      name: sanitizeNullable(input.name),
      altText: sanitizeNullable(input.altText),
      mimeType: input.mimeType,
      size: input.size,
      width: input.width ?? null,
      height: input.height ?? null,
      metadata: input.metadata,
    },
  });
}

export async function listOwnedAssets(
  db: DbClient,
  userId: string,
  input: ListOwnedAssetsInput = {}
) {
  const profile = await getOwnedProfileBase(db, userId);
  const limit = Math.max(1, Math.min(input.limit ?? 48, 96));
  const page = Math.max(1, input.page ?? 1);
  const usePagePagination = !input.cursor && typeof input.page === "number";
  const where = {
    profileId: profile.id,
    kind: input.kind,
    status: input.status,
  } as const;
  const query: Parameters<DbClient["asset"]["findMany"]>[0] = {
    where,
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      kind: true,
      status: true,
      url: true,
      storageKey: true,
      name: true,
      altText: true,
      mimeType: true,
      size: true,
      width: true,
      height: true,
      metadata: true,
      createdAt: true,
    },
  };

  const total = usePagePagination ? await db.asset.count({ where }) : 0;

  if (usePagePagination) {
    query.skip = (page - 1) * limit;
    query.take = limit;
  } else {
    query.take = limit + 1;

    if (input.cursor) {
      query.cursor = { id: input.cursor };
      query.skip = 1;
    }
  }

  const assets = await db.asset.findMany(query);
  const hasNextPage = !usePagePagination && assets.length > limit;
  const pageItems = (hasNextPage ? assets.slice(0, limit) : assets).filter((asset) =>
    isListableAsset(asset, userId)
  );
  const usageMap = await buildOwnedAssetUsageMap(db, userId, pageItems);
  const totalPages = usePagePagination ? Math.max(1, Math.ceil(total / limit)) : 1;

  return {
    assets: pageItems.map(({ storageKey, ...asset }) => ({
      ...asset,
      url: toGalleryAssetUrl({
        url: asset.url,
        storageKey,
        metadata: asset.metadata,
      }),
      usageSummary: usageMap.get(asset.id) ?? toUsageSummary([]),
      canDelete: !(usageMap.get(asset.id)?.inUse ?? false),
    })),
    nextCursor:
      hasNextPage && !usePagePagination ? (pageItems[pageItems.length - 1]?.id ?? null) : null,
    page,
    limit,
    total,
    totalPages,
  };
}

export async function getOwnedAssetUsageSummary(
  db: DbClient,
  userId: string,
  assetId: string
) {
  const profile = await getOwnedProfileBase(db, userId);
  const asset = await db.asset.findFirst({
    where: {
      id: assetId,
      profileId: profile.id,
    },
    select: {
      id: true,
      url: true,
      storageKey: true,
      metadata: true,
    },
  });

  if (!asset) {
    throw new ApiRouteError("NOT_FOUND", 404);
  }

  const usageMap = await buildOwnedAssetUsageMap(db, userId, [asset]);
  return usageMap.get(asset.id) ?? toUsageSummary([]);
}

export async function updateOwnedAsset(
  db: DbClient,
  userId: string,
  assetId: string,
  input: AssetInput
) {
  const profile = await getOwnedProfileBase(db, userId);
  const asset = await db.asset.findFirst({
    where: {
      id: assetId,
      profileId: profile.id,
    },
    select: { id: true },
  });

  if (!asset) {
    throw new ApiRouteError("NOT_FOUND", 404);
  }

  return db.asset.update({
    where: { id: asset.id },
    data: {
      kind: input.kind,
      status: input.status,
      url: input.url,
      storageKey: input.storageKey,
      name: sanitizeNullable(input.name),
      altText: sanitizeNullable(input.altText),
      mimeType: input.mimeType,
      size: input.size,
      width: input.width ?? null,
      height: input.height ?? null,
      metadata: input.metadata,
    },
  });
}

export async function deleteOwnedAsset(
  db: DbClient,
  userId: string,
  assetId: string
) {
  const profile = await getOwnedProfileBase(db, userId);
  const asset = await db.asset.findFirst({
    where: {
      id: assetId,
      profileId: profile.id,
    },
    select: {
      id: true,
      storageKey: true,
      metadata: true,
      url: true,
    },
  });

  if (!asset) {
    throw new ApiRouteError("NOT_FOUND", 404);
  }

  const usageSummary = await getOwnedAssetUsageSummary(db, userId, assetId);

  if (usageSummary.inUse) {
    throw new ApiRouteError("CONFLICT", 409, {
      message: "A imagem esta em uso e nao pode ser excluida.",
      usageSummary,
    });
  }

  await deleteStoredAssetObject(asset);
  await db.asset.delete({
    where: { id: asset.id },
  });

  return {
    assetId: asset.id,
    storageKey: asset.storageKey,
    provider: readAssetProvider(asset.metadata),
    bucket: readAssetBucket(asset.metadata) || null,
  };
}
