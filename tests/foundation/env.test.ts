import { describe, expect, it } from "vitest";
import { parseServerEnv } from "@/lib/env";

const validEnv: NodeJS.ProcessEnv = {
  NODE_ENV: "test",
  DATABASE_URL: "postgresql://user:pass@example.com/db?sslmode=require",
  DIRECT_URL: "postgresql://user:pass@example.com/db?sslmode=require",
  AUTH_SECRET: "01234567890123456789012345678901",
  NEXT_PUBLIC_APP_URL: "http://localhost:3000",
  NEXT_PUBLIC_APP_NAME: "FolioTree",
};

describe("server env validation", () => {
  it("accepts the required MVP environment", () => {
    const parsed = parseServerEnv(validEnv);
    expect(parsed.success).toBe(true);
  });

  it("rejects a short auth secret", () => {
    const parsed = parseServerEnv({ ...validEnv, AUTH_SECRET: "short" });
    expect(parsed.success).toBe(false);
  });

  it("rejects non-PostgreSQL database URLs", () => {
    const parsed = parseServerEnv({
      ...validEnv,
      DATABASE_URL: "mysql://user:pass@example.com/db",
    });

    expect(parsed.success).toBe(false);
  });

  it("requires S3 details when the S3 provider is enabled", () => {
    const parsed = parseServerEnv({
      ...validEnv,
      STORAGE_PROVIDER: "s3",
    });

    expect(parsed.success).toBe(false);
  });

  it("accepts local storage for development uploads without S3 credentials", () => {
    const parsed = parseServerEnv({
      ...validEnv,
      STORAGE_PROVIDER: "local",
    });

    expect(parsed.success).toBe(true);
  });

  it("accepts Supabase S3-compatible storage configuration", () => {
    const parsed = parseServerEnv({
      ...validEnv,
      STORAGE_PROVIDER: "s3",
      STORAGE_S3_ENDPOINT: "https://example.storage.supabase.co/storage/v1/s3",
      STORAGE_S3_REGION: "us-east-2",
      STORAGE_S3_BUCKET: "foliotree",
      STORAGE_S3_ACCESS_KEY_ID: "access-key",
      STORAGE_S3_SECRET_ACCESS_KEY: "secret-key",
    });

    expect(parsed.success).toBe(true);
  });
});
