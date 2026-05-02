import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  checkRateLimit,
  checkRateLimitAsync,
  resetRateLimitStore,
} from "@/lib/security/rate-limit";

describe("rate limit foundation", () => {
  beforeEach(() => {
    resetRateLimitStore();
  });

  afterEach(() => {
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
    vi.restoreAllMocks();
    resetRateLimitStore();
  });

  it("allows requests until the window limit is reached", () => {
    const options = { max: 2, windowMs: 1_000 };

    expect(checkRateLimit("auth:test", options, 0).allowed).toBe(true);
    expect(checkRateLimit("auth:test", options, 100).allowed).toBe(true);
    expect(checkRateLimit("auth:test", options, 200).allowed).toBe(false);
  });

  it("opens a new window after reset", () => {
    const options = { max: 1, windowMs: 1_000 };

    expect(checkRateLimit("auth:test", options, 0).allowed).toBe(true);
    expect(checkRateLimit("auth:test", options, 500).allowed).toBe(false);
    expect(checkRateLimit("auth:test", options, 1_001).allowed).toBe(true);
  });

  it("falls back to the in-memory limiter when distributed storage fails", async () => {
    process.env.UPSTASH_REDIS_REST_URL = "https://redis.example.com";
    process.env.UPSTASH_REDIS_REST_TOKEN = "token";
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("redis unavailable"));

    const options = { max: 1, windowMs: 1_000 };

    expect((await checkRateLimitAsync("auth:test", options, 0)).allowed).toBe(true);
    expect((await checkRateLimitAsync("auth:test", options, 100)).allowed).toBe(false);
  });
});
