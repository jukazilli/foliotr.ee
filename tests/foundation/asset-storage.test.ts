import { describe, expect, it } from "vitest";
import { prepareImageAssetUpload } from "@/lib/storage/assets";

const basePolicy = {
  maxBytes: 1024,
  allowedMimeTypes: ["image/png", "image/webp"],
};

describe("asset storage foundation", () => {
  it("keeps uploads disabled until a provider is configured", () => {
    const result = prepareImageAssetUpload(
      { purpose: "avatar", mimeType: "image/png", size: 512 },
      { ...basePolicy, provider: "disabled" }
    );

    expect(result).toEqual({ ready: false, reason: "STORAGE_DISABLED" });
  });

  it("reports readiness without binding the app to a provider SDK", () => {
    const result = prepareImageAssetUpload(
      { purpose: "project", mimeType: "image/webp", size: 512 },
      { ...basePolicy, provider: "s3" }
    );

    expect(result).toEqual({
      ready: true,
      provider: "s3",
      maxBytes: 1024,
      allowedMimeTypes: ["image/png", "image/webp"],
    });
  });
});
