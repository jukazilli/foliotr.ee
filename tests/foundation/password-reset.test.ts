import { describe, expect, it } from "vitest";
import {
  PASSWORD_RESET_TOKEN_BYTES,
  generatePasswordResetToken,
  getPasswordResetExpiresAt,
  hashPasswordResetToken,
  isPasswordResetExpired,
} from "@/lib/auth/password-reset";

describe("password reset token foundation", () => {
  it("generates opaque tokens with enough entropy", () => {
    const token = generatePasswordResetToken();
    expect(token.length).toBeGreaterThan(PASSWORD_RESET_TOKEN_BYTES);
  });

  it("stores only a deterministic hash of the token", () => {
    const token = "opaque-token";
    const hash = hashPasswordResetToken(token);

    expect(hash).toHaveLength(64);
    expect(hash).toBe(hashPasswordResetToken(token));
    expect(hash).not.toContain(token);
  });

  it("expires tokens after the configured window", () => {
    const now = new Date("2026-04-18T12:00:00.000Z");
    const expiresAt = getPasswordResetExpiresAt(now);

    expect(isPasswordResetExpired(expiresAt, now)).toBe(false);
    expect(isPasswordResetExpired(expiresAt, expiresAt)).toBe(true);
  });
});
