import type { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiRouteError } from "@/lib/server/api";

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  getOwnedProfileBase: vi.fn(),
  getOwnedVersion: vi.fn(),
  upsertOwnedPageOutput: vi.fn(),
}));

vi.mock("@/auth", () => ({
  auth: mocks.auth,
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {},
}));

vi.mock("@/lib/server/domain/profile-base", () => ({
  getOwnedProfileBase: mocks.getOwnedProfileBase,
  updateOwnedProfileBase: vi.fn(),
}));

vi.mock("@/lib/server/domain/versions", () => ({
  createOwnedVersion: vi.fn(),
  listOwnedVersions: vi.fn(),
  getOwnedVersion: mocks.getOwnedVersion,
  updateOwnedVersion: vi.fn(),
  upsertOwnedPageOutput: mocks.upsertOwnedPageOutput,
  upsertOwnedResumeOutput: vi.fn(),
}));

function requestJson(url: string, method = "GET", body?: unknown): NextRequest {
  return new Request(url, {
    method,
    headers: body ? { "content-type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  }) as unknown as NextRequest;
}

describe("domain route authorization", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects anonymous profile reads at the server boundary", async () => {
    mocks.auth.mockResolvedValue(null);

    const route = await import("@/app/api/profile/route");
    const response = await route.GET();
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.error.code).toBe("UNAUTHORIZED");
    expect(mocks.getOwnedProfileBase).not.toHaveBeenCalled();
  });

  it("returns not found when version ownership check fails", async () => {
    mocks.auth.mockResolvedValue({ user: { id: "user_1" } });
    mocks.getOwnedVersion.mockRejectedValue(new ApiRouteError("NOT_FOUND", 404));

    const route = await import("@/app/api/versions/[versionId]/route");
    const response = await route.GET(requestJson("https://foliotree.test/api/versions/version_2"), {
      params: Promise.resolve({ versionId: "version_2" }),
    });
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body.error.code).toBe("NOT_FOUND");
  });

  it("rejects anonymous page output writes", async () => {
    mocks.auth.mockResolvedValue(null);

    const route = await import("@/app/api/versions/[versionId]/page/route");
    const response = await route.PUT(
      requestJson("https://foliotree.test/api/versions/version_1/page", "PUT", {
        title: "Design Lead",
        slug: "design-lead",
        templateId: "ckh0000000000000000000000",
        publishState: "DRAFT",
      }),
      { params: Promise.resolve({ versionId: "version_1" }) }
    );
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.error.code).toBe("UNAUTHORIZED");
    expect(mocks.upsertOwnedPageOutput).not.toHaveBeenCalled();
  });
});
