import { prisma } from "@/lib/prisma";
import { publicReviewSchema } from "@/lib/validations";

export type PublicReviewSummary = Awaited<ReturnType<typeof getPublicReviewSummary>>;

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

export async function createPublicReview(formData: FormData) {
  const input = publicReviewSchema.parse({
    username: formData.get("username"),
    reviewerName: formData.get("reviewerName"),
    reviewerRole: formData.get("reviewerRole"),
    reviewerEmail: formData.get("reviewerEmail"),
    rating: formData.get("rating"),
    description: formData.get("description"),
  });

  const profile = await prisma.profile.findFirst({
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
    return { ok: false, message: "Perfil não encontrado." };
  }

  await prisma.proof.create({
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
    message: "Review recebida. Ela ficará oculta até o dono do perfil aprovar.",
  };
}
