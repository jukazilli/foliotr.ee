import crypto from "node:crypto";

export const PASSWORD_RESET_TOKEN_BYTES = 32;
export const PASSWORD_RESET_TOKEN_TTL_MS = 30 * 60 * 1000;

export function generatePasswordResetToken(): string {
  return crypto.randomBytes(PASSWORD_RESET_TOKEN_BYTES).toString("base64url");
}

export function hashPasswordResetToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function getPasswordResetExpiresAt(now = new Date()): Date {
  return new Date(now.getTime() + PASSWORD_RESET_TOKEN_TTL_MS);
}

export function isPasswordResetExpired(expiresAt: Date, now = new Date()): boolean {
  return expiresAt.getTime() <= now.getTime();
}
