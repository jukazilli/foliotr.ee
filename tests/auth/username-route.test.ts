import type { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  userFindUnique: vi.fn(),
  userUpdate: vi.fn(),
}));

vi.mock("@/auth", () => ({
  auth: mocks.auth,
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: mocks.userFindUnique,
      update: mocks.userUpdate,
    },
  },
}));

function requestCheck(username: string): NextRequest {
  return new Request(
    `https://foliotree.test/api/username?username=${encodeURIComponent(username)}`,
    { method: "GET" }
  ) as unknown as NextRequest;
}

function requestPatch(body: unknown): NextRequest {
  return new Request("https://foliotree.test/api/username", {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  }) as unknown as NextRequest;
}

async function usernameRoute() {
  return import("@/app/api/username/route");
}

describe("username API route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.auth.mockResolvedValue({ user: { id: "user_1" } });
    mocks.userUpdate.mockResolvedValue({ id: "user_1", username: "juliano.zilli" });
  });

  it("reports unavailable usernames with suggestions", async () => {
    mocks.userFindUnique.mockImplementation(async ({ where }: { where: { username: string } }) => {
      if (where.username === "juliano.zilli") return { id: "user_2" };
      return null;
    });

    const route = await usernameRoute();
    const response = await route.GET(requestCheck("juliano.zilli"));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.available).toBe(false);
    expect(body.suggestions).toHaveLength(3);
  });

  it("updates the current user's username when it is available", async () => {
    mocks.userFindUnique.mockResolvedValue(null);

    const route = await usernameRoute();
    const response = await route.PATCH(requestPatch({ username: " Juliano Zilli " }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(mocks.userUpdate).toHaveBeenCalledWith({
      where: { id: "user_1" },
      data: { username: "juliano.zilli" },
      select: {
        id: true,
        username: true,
      },
    });
    expect(body.user.username).toBe("juliano.zilli");
  });

  it("blocks username updates when another user already owns the handle", async () => {
    mocks.userFindUnique.mockImplementation(async ({ where }: { where: { username: string } }) => {
      if (where.username === "juliano.zilli") return { id: "user_2" };
      return null;
    });

    const route = await usernameRoute();
    const response = await route.PATCH(requestPatch({ username: "juliano.zilli" }));
    const body = await response.json();

    expect(response.status).toBe(409);
    expect(body.error.code).toBe("CONFLICT");
    expect(mocks.userUpdate).not.toHaveBeenCalled();
  });
});
