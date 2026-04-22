import { normalizeStoragePublicUrl } from "@/lib/storage/public-url";

export interface AssetUsageLocation {
  type:
    | "avatar"
    | "project_cover"
    | "experience_logo"
    | "achievement"
    | "highlight"
    | "proof"
    | "page_block";
  label: string;
  referenceId?: string;
}

export interface AssetUsageSummary {
  inUse: boolean;
  count: number;
  locations: AssetUsageLocation[];
}

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
  usageSummary?: AssetUsageSummary;
  canDelete?: boolean;
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
  const usageSummaryRecord = asRecord(asset.usageSummary);
  const usageLocations: AssetUsageLocation[] = [];

  if (Array.isArray(usageSummaryRecord.locations)) {
    usageSummaryRecord.locations.forEach((item) => {
      const location = asRecord(item);

      if (typeof location.type !== "string" || typeof location.label !== "string") {
        return;
      }

      usageLocations.push({
        type: location.type as AssetUsageLocation["type"],
        label: location.label,
        ...(typeof location.referenceId === "string"
          ? { referenceId: location.referenceId }
          : {}),
      });
    });
  }

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
    usageSummary: {
      inUse: Boolean(usageSummaryRecord.inUse),
      count:
        typeof usageSummaryRecord.count === "number" ? usageSummaryRecord.count : 0,
      locations: usageLocations,
    },
    canDelete: typeof asset.canDelete === "boolean" ? asset.canDelete : undefined,
  };
}

export function formatAssetSize(size: number | null | undefined) {
  if (!size) return "";
  if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}
