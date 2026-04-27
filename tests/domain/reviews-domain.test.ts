import { beforeEach, describe, expect, it, vi } from "vitest";
import { resetRateLimitStore } from "@/lib/security/rate-limit";

function buildReviewForm(overrides: Record<string, string> = {}) {
  const formData = new FormData();
  formData.set("username", overrides.username ?? "juliano-zill");
  formData.set("reviewerName", overrides.reviewerName ?? "Ana Souza");
  formData.set("reviewerRole", overrides.reviewerRole ?? "Tech Lead");
  formData.set("reviewerEmail", overrides.reviewerEmail ?? "ana@example.com");
  formData.set("rating", overrides.rating ?? "5");
  formData.set(
    "description",
    overrides.description ?? "Foi uma experiencia muito produtiva trabalhar junto."
  );
  if (overrides.website) {
    formData.set("website", overrides.website);
  }
  return formData;
}

function buildDb({ pendingReviews = 0 }: { pendingReviews?: number } = {}) {
  return {
    profile: {
      findFirst: vi.fn().mockResolvedValue({
        id: "profile_1",
        _count: { proofs: 4 },
      }),
    },
    proof: {
      count: vi.fn().mockResolvedValue(pendingReviews),
      create: vi.fn().mockResolvedValue({ id: "review_1" }),
    },
  };
}

describe("reviews domain", () => {
  beforeEach(() => {
    resetRateLimitStore();
  });

  it("creates public reviews as hidden review-backed proofs", async () => {
    const db = buildDb();
    const { createPublicReview } = await import("@/lib/server/domain/reviews");

    const result = await createPublicReview(buildReviewForm(), {
      clientIp: "203.0.113.10",
      db: db as never,
    });

    expect(result.ok).toBe(true);
    expect(db.proof.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        profileId: "profile_1",
        title: "Ana Souza",
        reviewerName: "Ana Souza",
        reviewerRole: "Tech Lead",
        reviewerEmail: "ana@example.com",
        rating: 5,
        tags: ["review"],
        isVisible: false,
        source: "public",
        order: 4,
      }),
    });
  });

  it("accepts honeypot submissions without creating a review", async () => {
    const db = buildDb();
    const { createPublicReview } = await import("@/lib/server/domain/reviews");

    const result = await createPublicReview(buildReviewForm({ website: "bot" }), {
      clientIp: "203.0.113.10",
      db: db as never,
    });

    expect(result.ok).toBe(true);
    expect(db.profile.findFirst).not.toHaveBeenCalled();
    expect(db.proof.create).not.toHaveBeenCalled();
  });

  it("blocks new public reviews when the profile has too many pending reviews", async () => {
    const db = buildDb({ pendingReviews: 20 });
    const { createPublicReview } = await import("@/lib/server/domain/reviews");

    const result = await createPublicReview(buildReviewForm(), {
      clientIp: "203.0.113.10",
      db: db as never,
    });

    expect(result.ok).toBe(false);
    expect(result.message).toContain("aguardando aprovacao");
    expect(db.proof.create).not.toHaveBeenCalled();
  });

  it("rate limits public reviews by ip and username", async () => {
    const db = buildDb();
    const { createPublicReview } = await import("@/lib/server/domain/reviews");

    for (let index = 0; index < 3; index += 1) {
      const result = await createPublicReview(buildReviewForm(), {
        clientIp: "203.0.113.10",
        db: db as never,
        now: 0,
      });
      expect(result.ok).toBe(true);
    }

    const blocked = await createPublicReview(buildReviewForm(), {
      clientIp: "203.0.113.10",
      db: db as never,
      now: 0,
    });

    expect(blocked.ok).toBe(false);
    expect(blocked.message).toContain("Muitas reviews");
  });
});
