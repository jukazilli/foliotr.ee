import { prisma } from "@/lib/prisma";
import { PUBLIC_REVIEW_RATE_LIMIT, checkRateLimit } from "@/lib/security/rate-limit";
import { publicReviewSchema } from "@/lib/validations";

export type PublicReviewSummary = Awaited<ReturnType<typeof getPublicReviewSummary>>;

const PUBLIC_REVIEW_PENDING_LIMIT = 20;

type ReviewsDatabase = Pick<typeof prisma, "profile" | "proof">;

interface CreatePublicReviewOptions {
  clientIp?: string;
  db?: ReviewsDatabase;
  now?: number;
}

function roundRating(value: number) {
  return Math.round(value * 10) / 10;
}

export async function getPublicReviewSummary(username: string) {
  const profile = await prisma.profile.findFirst({
    where: {
      user: {
        username,
      },
    },
    select: {
      id: true,
      proofs: {
        where: { isVisible: true },
        orderBy: [{ order: "asc" }, { createdAt: "desc" }],
        select: {
          id: true,
          title: true,
          description: true,
          metric: true,
          reviewerName: true,
          reviewerRole: true,
          rating: true,
          createdAt: true,
        },
      },
    },
  });

  const reviews = profile?.proofs ?? [];
  const ratingTotal = reviews.reduce((total, review) => total + review.rating, 0);

  return {
    count: reviews.length,
    averageRating: reviews.length ? roundRating(ratingTotal / reviews.length) : null,
    reviews: reviews.map((review) => ({
      id: review.id,
      reviewerName: review.reviewerName ?? review.title,
      reviewerRole: review.reviewerRole ?? review.metric,
      rating: review.rating,
      description: review.description,
      createdAt: review.createdAt,
    })),
  };
}

export async function createPublicReview(
  formData: FormData,
  options: CreatePublicReviewOptions = {}
) {
  const db = options.db ?? prisma;
  const input = publicReviewSchema.parse({
    username: formData.get("username"),
    reviewerName: formData.get("reviewerName"),
    reviewerRole: formData.get("reviewerRole"),
    reviewerEmail: formData.get("reviewerEmail"),
    rating: formData.get("rating"),
    description: formData.get("description"),
    website: formData.get("website") ?? "",
  });

  if (input.website) {
    return {
      ok: true,
      message: "Review recebida. Ela ficara oculta ate o dono do perfil aprovar.",
    };
  }

  const clientIp = options.clientIp?.trim() || "unknown";
  const rateLimit = checkRateLimit(
    `reviews:public:${clientIp}:${input.username}`,
    PUBLIC_REVIEW_RATE_LIMIT,
    options.now
  );

  if (!rateLimit.allowed) {
    return {
      ok: false,
      message: "Muitas reviews enviadas em pouco tempo. Tente novamente mais tarde.",
    };
  }

  const profile = await db.profile.findFirst({
    where: {
      user: {
        username: input.username,
      },
    },
    select: {
      id: true,
      _count: {
        select: {
          proofs: true,
        },
      },
    },
  });

  if (!profile) {
    return { ok: false, message: "Perfil nao encontrado." };
  }

  const pendingPublicReviews = await db.proof.count({
    where: {
      profileId: profile.id,
      isVisible: false,
      source: "public",
      tags: { has: "review" },
    },
  });

  if (pendingPublicReviews >= PUBLIC_REVIEW_PENDING_LIMIT) {
    return {
      ok: false,
      message: "Este perfil ja tem muitas reviews aguardando aprovacao.",
    };
  }

  await db.proof.create({
    data: {
      profileId: profile.id,
      title: input.reviewerName,
      description: input.description,
      metric: input.reviewerRole || null,
      tags: ["review"],
      reviewerName: input.reviewerName,
      reviewerRole: input.reviewerRole || null,
      reviewerEmail: input.reviewerEmail || null,
      rating: input.rating,
      isVisible: false,
      source: "public",
      order: profile._count.proofs,
    },
  });

  return {
    ok: true,
    message: "Review recebida. Ela ficara oculta ate o dono do perfil aprovar.",
  };
}
