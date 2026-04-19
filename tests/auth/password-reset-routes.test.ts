import bcrypt from "bcryptjs";
import type { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  generatePasswordResetToken,
  hashPasswordResetToken,
} from "@/lib/auth/password-reset";
import { resetRateLimitStore } from "@/lib/security/rate-limit";

const validEnv = {
  NODE_ENV: "test",
  DATABASE_URL: "postgresql://user:pass@example.com/db?sslmode=require",
  DIRECT_URL: "postgresql://user:pass@example.com/db?sslmode=require",
  AUTH_SECRET: "01234567890123456789012345678901",
  NEXT_PUBLIC_APP_URL: "https://foliotree.test",
  NEXT_PUBLIC_APP_NAME: "FolioTree",
};

const mocks = vi.hoisted(() => {
  const tx = {
    user: {
      update: vi.fn(),
    },
    passwordResetToken: {
      updateMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
  };

  return {
    tx,
    userFindUnique: vi.fn(),
    resetTokenFindUnique: vi.fn(),
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
    passwordResetToken: {
      findUnique: mocks.resetTokenFindUnique,
    },
    $transaction: mocks.transaction,
  },
}));

function requestJson(url: string, body: unknown): NextRequest {
  return new Request(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-forwarded-for": "203.0.113.10",
    },
    body: JSON.stringify(body),
  }) as unknown as NextRequest;
}

async function forgotPasswordPost() {
  const route = await import("@/app/api/forgot-password/route");
  return route.POST;
}

async function resetPasswordPost() {
  const route = await import("@/app/api/reset-password/route");
  return route.POST;
}

describe("password reset API routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetRateLimitStore();
    Object.assign(process.env, validEnv);
    mocks.transaction.mockImplementation(
      async (callback: (client: typeof mocks.tx) => Promise<unknown>) =>
        callback(mocks.tx)
    );
  });

  it("creates a hashed expirable token for existing users without returning it", async () => {
    mocks.userFindUnique.mockResolvedValue({
      id: "user_1",
      email: "ana@example.com",
    });

    const post = await forgotPasswordPost();
    const response = await post(
      requestJson("https://foliotree.test/api/forgot-password", {
        email: "Ana@Example.com",
      })
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(JSON.stringify(body)).not.toContain("token");
    expect(mocks.tx.passwordResetToken.updateMany).toHaveBeenCalledWith({
      where: { userId: "user_1", usedAt: null },
      data: { usedAt: expect.any(Date) },
    });
    expect(mocks.tx.passwordResetToken.create).toHaveBeenCalledWith({
      data: {
        userId: "user_1",
        tokenHash: expect.stringMatching(/^[a-f0-9]{64}$/),
        expiresAt: expect.any(Date),
      },
    });
  });

  it("returns the same generic forgot-password response for unknown users", async () => {
    mocks.userFindUnique.mockResolvedValue(null);

    const post = await forgotPasswordPost();
    const response = await post(
      requestJson("https://foliotree.test/api/forgot-password", {
        email: "unknown@example.com",
      })
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(mocks.tx.passwordResetToken.create).not.toHaveBeenCalled();
  });

  it("updates the password with a hash and marks a valid reset token as used", async () => {
    const token = generatePasswordResetToken();
    mocks.resetTokenFindUnique.mockResolvedValue({
      id: "reset_1",
      userId: "user_1",
      expiresAt: new Date(Date.now() + 60_000),
      usedAt: null,
    });

    const post = await resetPasswordPost();
    const response = await post(
      requestJson("https://foliotree.test/api/reset-password", {
        token,
        password: "NewPassword123",
        confirmPassword: "NewPassword123",
      })
    );
    const userUpdateCall = mocks.tx.user.update.mock.calls[0]?.[0] as
      | { data?: { passwordHash?: string } }
      | undefined;

    expect(response.status).toBe(200);
    expect(mocks.resetTokenFindUnique).toHaveBeenCalledWith({
      where: { tokenHash: hashPasswordResetToken(token) },
      select: {
        id: true,
        userId: true,
        expiresAt: true,
        usedAt: true,
      },
    });
    expect(userUpdateCall?.data?.passwordHash).toBeTruthy();
    expect(userUpdateCall?.data?.passwordHash).not.toBe("NewPassword123");
    expect(
      await bcrypt.compare("NewPassword123", userUpdateCall?.data?.passwordHash ?? "")
    ).toBe(true);
    expect(mocks.tx.passwordResetToken.update).toHaveBeenCalledWith({
      where: { id: "reset_1" },
      data: { usedAt: expect.any(Date) },
    });
  });

  it("rejects expired reset tokens without changing the password", async () => {
    const token = generatePasswordResetToken();
    mocks.resetTokenFindUnique.mockResolvedValue({
      id: "reset_1",
      userId: "user_1",
      expiresAt: new Date(Date.now() - 1_000),
      usedAt: null,
    });

    const post = await resetPasswordPost();
    const response = await post(
      requestJson("https://foliotree.test/api/reset-password", {
        token,
        password: "NewPassword123",
        confirmPassword: "NewPassword123",
      })
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error.code).toBe("BAD_REQUEST");
    expect(mocks.tx.user.update).not.toHaveBeenCalled();
    expect(mocks.tx.passwordResetToken.update).not.toHaveBeenCalled();
  });
});
