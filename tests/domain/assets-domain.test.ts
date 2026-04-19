import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiRouteError } from "@/lib/server/api";

const mocks = vi.hoisted(() => ({
  getOwnedProfileBase: vi.fn(),
}));

vi.mock("@/lib/server/domain/profile-base", () => ({
  getOwnedProfileBase: mocks.getOwnedProfileBase,
}));

describe("assets domain", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates an asset under the owned profile with validated metadata", async () => {
    mocks.getOwnedProfileBase.mockResolvedValue({ id: "profile_1" });

    const db = {
      asset: {
        create: vi.fn().mockResolvedValue({ id: "asset_1" }),
      },
    };

    const { createOwnedAsset } = await import("@/lib/server/domain/assets");
    const asset = await createOwnedAsset(db as never, "user_1", {
      kind: "IMAGE",
      status: "READY",
      url: "https://cdn.foliotree.test/avatar.png",
      storageKey: "assets/avatar.png",
      name: "Avatar",
      altText: "",
      mimeType: "image/png",
      size: 2048,
      width: 512,
      height: 512,
      metadata: { origin: "seed" },
    });

    expect(asset).toEqual({ id: "asset_1" });
    expect(db.asset.create).toHaveBeenCalledWith({
      data: {
        profileId: "profile_1",
        kind: "IMAGE",
        status: "READY",
        url: "https://cdn.foliotree.test/avatar.png",
        storageKey: "assets/avatar.png",
        name: "Avatar",
        altText: null,
        mimeType: "image/png",
        size: 2048,
        width: 512,
        height: 512,
        metadata: { origin: "seed" },
      },
    });
  });

  it("rejects asset updates outside the owner's scope", async () => {
    mocks.getOwnedProfileBase.mockResolvedValue({ id: "profile_1" });

    const db = {
      asset: {
        findFirst: vi.fn().mockResolvedValue(null),
        update: vi.fn(),
      },
    };

    const { updateOwnedAsset } = await import("@/lib/server/domain/assets");

    await expect(
      updateOwnedAsset(db as never, "user_1", "asset_foreign", {
        kind: "DOCUMENT",
        status: "READY",
        url: "https://cdn.foliotree.test/proof.pdf",
        storageKey: "proofs/proof.pdf",
        name: "Proof",
        altText: "Proof PDF",
        mimeType: "application/pdf",
        size: 4096,
        width: null,
        height: null,
        metadata: { pageCount: 3 },
      })
    ).rejects.toMatchObject({
      code: "NOT_FOUND",
      status: 404,
    } satisfies Partial<ApiRouteError>);
  });
});
