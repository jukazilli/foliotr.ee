import { normalizeStoragePublicUrl } from "@/lib/storage/public-url";

export interface GalleryImageAsset {
  id: string;
  url: string;
  name?: string | null;
  altText?: string | null;
  mimeType?: string | null;
  size?: number | null;
  width?: number | null;
  height?: number | null;
  metadata?: Record<string, unknown>;
  createdAt?: string | Date;
}

export const IMAGE_FILE_ACCEPT = "image/png,image/jpeg,image/webp,image/gif";
export const IMAGE_FILE_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"];
export const IMAGE_FILE_MAX_SIZE = 5 * 1024 * 1024;

export function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

export async function parseJsonResponse(response: Response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

export function formatApiError(payload: unknown, fallback: string) {
  const error = asRecord(asRecord(payload).error);
  const details = asRecord(error.details);

  if (typeof details.message === "string") return details.message;
  if (typeof error.message === "string") return error.message;

  return fallback;
}

export function readAsset(value: unknown): GalleryImageAsset | null {
  const asset = asRecord(value);

  if (typeof asset.id !== "string" || typeof asset.url !== "string") {
    return null;
  }

  return {
    id: asset.id,
    url: normalizeStoragePublicUrl(asset.url),
    name: typeof asset.name === "string" ? asset.name : null,
    altText: typeof asset.altText === "string" ? asset.altText : null,
    mimeType: typeof asset.mimeType === "string" ? asset.mimeType : null,
    size: typeof asset.size === "number" ? asset.size : null,
    width: typeof asset.width === "number" ? asset.width : null,
    height: typeof asset.height === "number" ? asset.height : null,
    metadata: asRecord(asset.metadata),
    createdAt:
      typeof asset.createdAt === "string" || asset.createdAt instanceof Date
        ? asset.createdAt
        : undefined,
  };
}

export function formatAssetSize(size: number | null | undefined) {
  if (!size) return "";
  if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}
