import { getEnv, type StorageProvider } from "@/lib/env";

export interface ImageAssetCandidate {
  mimeType: string;
  size: number;
}

export interface ImageAssetPolicy {
  provider: StorageProvider;
  maxBytes: number;
  allowedMimeTypes: string[];
}

export function getImageAssetPolicy(): ImageAssetPolicy {
  const env = getEnv();

  return {
    provider: env.STORAGE_PROVIDER,
    maxBytes: env.STORAGE_MAX_FILE_SIZE_MB * 1024 * 1024,
    allowedMimeTypes: env.STORAGE_ALLOWED_IMAGE_TYPES.split(",")
      .map((value) => value.trim())
      .filter(Boolean),
  };
}

export function validateImageAssetCandidate(
  candidate: ImageAssetCandidate,
  policy: ImageAssetPolicy = getImageAssetPolicy()
): { valid: true } | { valid: false; reason: "TYPE" | "SIZE" } {
  if (!policy.allowedMimeTypes.includes(candidate.mimeType)) {
    return { valid: false, reason: "TYPE" };
  }

  if (candidate.size > policy.maxBytes) {
    return { valid: false, reason: "SIZE" };
  }

  return { valid: true };
}
