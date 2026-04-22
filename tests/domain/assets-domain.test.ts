import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiRouteError } from "@/lib/server/api";

const mocks = vi.hoisted(() => ({
  getOwnedProfileBase: vi.fn(),
  deleteImageFromLocal: vi.fn(),
  deleteImageFromS3: vi.fn(),
}));

vi.mock("@/lib/server/domain/profile-base", () => ({
  getOwnedProfileBase: mocks.getOwnedProfileBase,
}));

vi.mock("@/lib/storage/local", () => ({
  deleteImageFromLocal: mocks.deleteImageFromLocal,
}));

vi.mock("@/lib/storage/s3", () => ({
  deleteImageFromS3: mocks.deleteImageFromS3,
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

  it("lists only assets from the owned profile with pagination", async () => {
    mocks.getOwnedProfileBase.mockResolvedValue({ id: "profile_1" });

    const db = {
      profile: {
        findUnique: vi.fn().mockResolvedValue({ avatarUrl: null }),
      },
      pageBlock: {
        findMany: vi.fn().mockResolvedValue([]),
      },
      asset: {
        findMany: vi.fn().mockImplementation((args: { select: Record<string, unknown> }) => {
          if ("kind" in args.select) {
            return Promise.resolve([
              {
                id: "asset_1",
                kind: "IMAGE",
                status: "READY",
                url: "https://uploads/profile/avatar.jpg",
                storageKey: "uploads/user_1/avatar.jpg",
                metadata: { provider: "s3" },
                createdAt: new Date("2026-04-21T10:00:00.000Z"),
              },
              {
                id: "asset_2",
                kind: "IMAGE",
                status: "READY",
                url: "https://cdn.foliotree.test/image.jpg",
                storageKey: "external/image.jpg",
                metadata: { provider: "external" },
                createdAt: new Date("2026-04-21T09:00:00.000Z"),
              },
            ]);
          }

          return Promise.resolve([
            {
              id: "asset_1",
              projectCovers: [],
              proofAssets: [],
              highlightAssets: [],
              achievementAssets: [],
              experienceLogos: [],
            },
          ]);
        }),
      },
    };

    const { listOwnedAssets } = await import("@/lib/server/domain/assets");
    const result = await listOwnedAssets(db as never, "user_1", {
      kind: "IMAGE",
      status: "READY",
      limit: 1,
    });

    expect(result).toEqual({
      assets: [
        {
          id: "asset_1",
          kind: "IMAGE",
          status: "READY",
          url: "/api/assets/proxy?key=uploads%2Fuser_1%2Favatar.jpg",
          metadata: { provider: "s3" },
          createdAt: new Date("2026-04-21T10:00:00.000Z"),
          usageSummary: {
            inUse: false,
            count: 0,
            locations: [],
          },
          canDelete: true,
        },
      ],
      nextCursor: "asset_1",
      page: 1,
      limit: 1,
      total: 0,
      totalPages: 1,
    });
    expect(db.asset.findMany).toHaveBeenNthCalledWith(1, {
      where: {
        profileId: "profile_1",
        kind: "IMAGE",
        status: "READY",
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 2,
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
  });

  it("hides local-only upload assets when local storage is not active", async () => {
    mocks.getOwnedProfileBase.mockResolvedValue({ id: "profile_1" });

    const db = {
      profile: {
        findUnique: vi.fn().mockResolvedValue({ avatarUrl: null }),
      },
      pageBlock: {
        findMany: vi.fn().mockResolvedValue([]),
      },
      asset: {
        findMany: vi.fn().mockImplementation((args: { select: Record<string, unknown> }) => {
          if ("kind" in args.select) {
            return Promise.resolve([
              {
                id: "asset_local",
                kind: "IMAGE",
                status: "READY",
                url: "/uploads/user_1/avatar/local.jpg",
                storageKey: "uploads/user_1/avatar/local.jpg",
                metadata: { provider: "local" },
                createdAt: new Date("2026-04-21T10:00:00.000Z"),
              },
            ]);
          }

          return Promise.resolve([]);
        }),
      },
    };

    const { listOwnedAssets } = await import("@/lib/server/domain/assets");
    const result = await listOwnedAssets(db as never, "user_1", {
      kind: "IMAGE",
      status: "READY",
      limit: 48,
    });

    expect(result).toEqual({
      assets: [],
      nextCursor: null,
      page: 1,
      limit: 48,
      total: 0,
      totalPages: 1,
    });
  });

  it("blocks deletion when the asset is still in use", async () => {
    mocks.getOwnedProfileBase.mockResolvedValue({ id: "profile_1" });

    const db = {
      profile: {
        findUnique: vi.fn().mockResolvedValue({ avatarUrl: null }),
      },
      pageBlock: {
        findMany: vi.fn().mockResolvedValue([]),
      },
      asset: {
        findFirst: vi
          .fn()
          .mockResolvedValueOnce({
            id: "asset_1",
            storageKey: "uploads/user_1/asset/image.jpg",
            metadata: { provider: "local" },
            url: "/uploads/user_1/asset/image.jpg",
          })
          .mockResolvedValueOnce({
            id: "asset_1",
            url: "/uploads/user_1/asset/image.jpg",
            storageKey: "uploads/user_1/asset/image.jpg",
            metadata: { provider: "local" },
          }),
        findMany: vi.fn().mockResolvedValue([
          {
            id: "asset_1",
            projectCovers: [{ id: "project_1", title: "Projeto em destaque" }],
            proofAssets: [],
            highlightAssets: [],
            achievementAssets: [],
            experienceLogos: [],
          },
        ]),
        delete: vi.fn(),
      },
    };

    const { deleteOwnedAsset } = await import("@/lib/server/domain/assets");

    await expect(deleteOwnedAsset(db as never, "user_1", "asset_1")).rejects.toMatchObject({
      code: "CONFLICT",
      status: 409,
      details: {
        usageSummary: {
          inUse: true,
          count: 1,
        },
      },
    } satisfies Partial<ApiRouteError>);

    expect(db.asset.delete).not.toHaveBeenCalled();
    expect(mocks.deleteImageFromLocal).not.toHaveBeenCalled();
  });
});
