import bcrypt from "bcryptjs";
import type { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { resetRateLimitStore } from "@/lib/security/rate-limit";

const mocks = vi.hoisted(() => {
  const tx = {
    user: {
      create: vi.fn(),
    },
    profile: {
      create: vi.fn(),
    },
    version: {
      create: vi.fn(),
    },
  };

  return {
    tx,
    userFindUnique: vi.fn(),
    transaction: vi.fn(async (callback: (client: typeof tx) => Promise<unknown>) =>
      callback(tx)
    ),
  };
});

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: mocks.userFindUnique,
    },
    $transaction: mocks.transaction,
  },
}));

function requestJson(body: unknown): NextRequest {
  return new Request("https://foliotree.test/api/register", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-forwarded-for": "203.0.113.20",
    },
    body: JSON.stringify(body),
  }) as unknown as NextRequest;
}

async function registerPost() {
  const route = await import("@/app/api/register/route");
  return route.POST;
}

describe("register API route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetRateLimitStore();
    mocks.tx.user.create.mockResolvedValue({ id: "user_1" });
    mocks.tx.profile.create.mockResolvedValue({ id: "profile_1" });
    mocks.tx.version.create.mockResolvedValue({ id: "version_1" });
    mocks.transaction.mockImplementation(
      async (callback: (client: typeof mocks.tx) => Promise<unknown>) =>
        callback(mocks.tx)
    );
  });

  it("creates a user, profile and default version with a hashed password", async () => {
    mocks.userFindUnique.mockResolvedValue(null);

    const post = await registerPost();
    const response = await post(
      requestJson({
        name: "Ana Souza",
        email: "ANA@example.com",
        password: "StrongPass123",
        confirmPassword: "StrongPass123",
      })
    );

    const userCreateCall = mocks.tx.user.create.mock.calls[0]?.[0] as
      | { data?: { email?: string; passwordHash?: string } }
      | undefined;

    expect(response.status).toBe(201);
    expect(userCreateCall?.data?.email).toBe("ana@example.com");
    expect(userCreateCall?.data?.passwordHash).toBeTruthy();
    expect(userCreateCall?.data?.passwordHash).not.toBe("StrongPass123");
    expect(
      await bcrypt.compare("StrongPass123", userCreateCall?.data?.passwordHash ?? "")
    ).toBe(true);
    expect(mocks.tx.profile.create).toHaveBeenCalledWith({
      data: {
        userId: "user_1",
        displayName: "Ana Souza",
        onboardingDone: false,
      },
    });
    expect(mocks.tx.version.create).toHaveBeenCalledWith({
      data: {
        profileId: "profile_1",
        name: "Principal",
        isDefault: true,
      },
    });
  });

  it("returns a normalized conflict without creating records", async () => {
    mocks.userFindUnique.mockResolvedValue({ id: "existing_user" });

    const post = await registerPost();
    const response = await post(
      requestJson({
        name: "Ana Souza",
        email: "ana@example.com",
        password: "StrongPass123",
        confirmPassword: "StrongPass123",
      })
    );
    const body = await response.json();

    expect(response.status).toBe(409);
    expect(body.error.code).toBe("CONFLICT");
    expect(mocks.transaction).not.toHaveBeenCalled();
  });

  it("rejects invalid registration input at the server boundary", async () => {
    const post = await registerPost();
    const response = await post(
      requestJson({
        name: "A",
        email: "not-an-email",
        password: "short",
        confirmPassword: "different",
      })
    );
    const body = await response.json();

    expect(response.status).toBe(422);
    expect(body.error.code).toBe("VALIDATION_ERROR");
    expect(mocks.userFindUnique).not.toHaveBeenCalled();
  });
});
