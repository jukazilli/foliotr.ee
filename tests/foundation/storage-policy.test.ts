import { describe, expect, it } from "vitest";
import { validateImageAssetCandidate } from "@/lib/storage/policy";

const policy = {
  provider: "disabled" as const,
  maxBytes: 1024,
  allowedMimeTypes: ["image/png", "image/jpeg"],
};

describe("image asset policy", () => {
  it("accepts allowed image files inside the configured size", () => {
    const result = validateImageAssetCandidate(
      { mimeType: "image/png", size: 512 },
      policy
    );

    expect(result).toEqual({ valid: true });
  });

  it("rejects unsupported file types", () => {
    const result = validateImageAssetCandidate(
      { mimeType: "text/html", size: 512 },
      policy
    );

    expect(result).toEqual({ valid: false, reason: "TYPE" });
  });

  it("rejects oversized image files", () => {
    const result = validateImageAssetCandidate(
      { mimeType: "image/jpeg", size: 2048 },
      policy
    );

    expect(result).toEqual({ valid: false, reason: "SIZE" });
  });
});
