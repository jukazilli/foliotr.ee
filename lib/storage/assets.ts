import {
  getImageAssetPolicy,
  validateImageAssetCandidate,
  type ImageAssetCandidate,
  type ImageAssetPolicy,
} from "@/lib/storage/policy";

export type AssetUploadPurpose = "avatar" | "banner" | "project" | "proof";

export interface ImageAssetUploadRequest extends ImageAssetCandidate {
  purpose: AssetUploadPurpose;
}

export type ImageAssetUploadReadiness =
  | {
      ready: true;
      provider: Exclude<ImageAssetPolicy["provider"], "disabled">;
      maxBytes: number;
      allowedMimeTypes: string[];
    }
  | {
      ready: false;
      reason: "STORAGE_DISABLED" | "TYPE" | "SIZE";
    };

export function prepareImageAssetUpload(
  request: ImageAssetUploadRequest,
  policy: ImageAssetPolicy = getImageAssetPolicy()
): ImageAssetUploadReadiness {
  const candidate = validateImageAssetCandidate(request, policy);

  if (!candidate.valid) {
    return { ready: false, reason: candidate.reason };
  }

  if (policy.provider === "disabled") {
    return { ready: false, reason: "STORAGE_DISABLED" };
  }

  return {
    ready: true,
    provider: policy.provider,
    maxBytes: policy.maxBytes,
    allowedMimeTypes: policy.allowedMimeTypes,
  };
}
