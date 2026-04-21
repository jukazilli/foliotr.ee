import { describe, expect, it } from "vitest";
import {
  buildUsernameCandidates,
  normalizeUsernameInput,
  suggestAvailableUsernames,
} from "@/lib/usernames";

describe("username helpers", () => {
  it("normalizes username input for public handles", () => {
    expect(normalizeUsernameInput(" Júlia Zilli!! ")).toBe("julia.zilli");
    expect(normalizeUsernameInput("__Ana---Souza__")).toBe("ana.souza");
  });

  it("generates instagram-like candidates within the public username contract", () => {
    const candidates = buildUsernameCandidates("juliano-zilli", 1713657600000);

    expect(candidates.length).toBeGreaterThanOrEqual(3);
    expect(candidates).toContain("juliano-zilli.2024");
    expect(candidates.every((candidate) => /^[a-z0-9._-]{3,20}$/.test(candidate))).toBe(true);
  });

  it("skips unavailable generated candidates", async () => {
    const unavailable = new Set(["juliano-zilli.2024", "juliano-zilli_100"]);
    const suggestions = await suggestAvailableUsernames(
      "juliano-zilli",
      async (candidate) => unavailable.has(candidate),
      { count: 3, seed: 1713657600000 }
    );

    expect(suggestions).toHaveLength(3);
    expect(suggestions).not.toContain("juliano-zilli.2024");
    expect(suggestions).not.toContain("juliano-zilli_100");
  });
});
