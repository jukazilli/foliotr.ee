import { PrismaClient } from "@/generated/prisma-client";
import { ApiRouteError } from "@/lib/server/api";
import { getOwnedProfileBase } from "@/lib/server/domain/profile-base";
import type { AssetInput } from "@/lib/validations";

type DbClient = PrismaClient;
type AssetKindInput = "IMAGE" | "DOCUMENT" | "VIDEO" | "AUDIO" | "OTHER";
type AssetStatusInput = "PENDING" | "READY" | "FAILED";

export interface ListOwnedAssetsInput {
  kind?: AssetKindInput;
  status?: AssetStatusInput;
  limit?: number;
  cursor?: string | null;
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
  const assets = await db.asset.findMany({
    where: {
      profileId: profile.id,
      kind: input.kind,
      status: input.status,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: limit + 1,
    ...(input.cursor
      ? {
          cursor: { id: input.cursor },
          skip: 1,
        }
      : {}),
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
  });
  const hasNextPage = assets.length > limit;
  const pageItems = (hasNextPage ? assets.slice(0, limit) : assets).filter((asset) =>
    isListableAsset(asset, userId)
  );

  return {
    assets: pageItems.map(({ storageKey, ...asset }) => ({
      ...asset,
      url: toGalleryAssetUrl({
        url: asset.url,
        storageKey,
        metadata: asset.metadata,
      }),
    })),
    nextCursor: hasNextPage ? (pageItems[pageItems.length - 1]?.id ?? null) : null,
  };
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
