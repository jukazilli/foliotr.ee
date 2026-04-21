import type { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const tx = {
    user: {
      update: vi.fn(),
    },
    profile: {
      update: vi.fn(),
    },
  };

  return {
    auth: vi.fn(),
    tx,
    userFindUnique: vi.fn(),
    transaction: vi.fn(async (callback: (client: typeof tx) => Promise<unknown>) =>
      callback(tx)
    ),
  };
});

vi.mock("@/auth", () => ({
  auth: mocks.auth,
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: mocks.userFindUnique,
    },
    $transaction: mocks.transaction,
  },
}));

function requestJson(body: unknown): NextRequest {
  return new Request("https://foliotree.test/api/onboarding", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  }) as unknown as NextRequest;
}

function requestCheck(username: string): NextRequest {
  return new Request(
    `https://foliotree.test/api/onboarding?username=${encodeURIComponent(username)}`,
    { method: "GET" }
  ) as unknown as NextRequest;
}

async function onboardingRoute() {
  return import("@/app/api/onboarding/route");
}

describe("onboarding API route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.auth.mockResolvedValue({ user: { id: "user_1" } });
    mocks.tx.user.update.mockResolvedValue({ id: "user_1" });
    mocks.tx.profile.update.mockResolvedValue({ id: "profile_1" });
    mocks.transaction.mockImplementation(
      async (callback: (client: typeof mocks.tx) => Promise<unknown>) =>
        callback(mocks.tx)
    );
  });

  it("returns username suggestions when the requested username is already taken", async () => {
    mocks.userFindUnique.mockImplementation(async ({ where }: { where: { username: string } }) => {
      if (where.username === "juliano-zilli") return { id: "user_2" };
      return null;
    });

    const route = await onboardingRoute();
    const response = await route.GET(requestCheck("juliano-zilli"));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.available).toBe(false);
    expect(body.message).toBe("Esse username ja esta em uso.");
    expect(body.suggestions).toHaveLength(3);
  });

  it("blocks duplicate usernames on final onboarding submit", async () => {
    mocks.userFindUnique.mockImplementation(async ({ where }: { where: { username: string } }) => {
      if (where.username === "juliano-zilli") return { id: "user_2" };
      return null;
    });

    const route = await onboardingRoute();
    const response = await route.POST(
      requestJson({
        username: "juliano-zilli",
        headline: "Analista de Sistemas",
      })
    );
    const body = await response.json();

    expect(response.status).toBe(409);
    expect(body.error.code).toBe("CONFLICT");
    expect(body.error.details.suggestions).toHaveLength(3);
    expect(mocks.transaction).not.toHaveBeenCalled();
  });

  it("normalizes and saves available usernames", async () => {
    mocks.userFindUnique.mockResolvedValue(null);

    const route = await onboardingRoute();
    const response = await route.POST(
      requestJson({
        username: " Juliano Zilli ",
        headline: "Analista de Sistemas",
      })
    );

    expect(response.status).toBe(200);
    expect(mocks.tx.user.update).toHaveBeenCalledWith({
      where: { id: "user_1" },
      data: { username: "juliano.zilli" },
    });
  });
});
