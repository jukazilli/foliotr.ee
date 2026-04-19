import { beforeEach, describe, expect, it } from "vitest";
import { checkRateLimit, resetRateLimitStore } from "@/lib/security/rate-limit";

describe("rate limit foundation", () => {
  beforeEach(() => {
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
});
