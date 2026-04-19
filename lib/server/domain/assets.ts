import { PrismaClient } from "@/generated/prisma-client";
import { ApiRouteError } from "@/lib/server/api";
import { getOwnedProfileBase } from "@/lib/server/domain/profile-base";
import type { AssetInput } from "@/lib/validations";

type DbClient = PrismaClient;

function sanitizeNullable(value: string | null | undefined) {
  if (value === undefined) return undefined;
  if (value === "") return null;
  return value;
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
