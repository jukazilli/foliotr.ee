import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import PublicProfileHubPage from "@/components/public/PublicProfileHubPage";
import { getPublicProfileHub } from "@/lib/server/domain/public-pages";
import { getPublicReviewSummary } from "@/lib/server/domain/reviews";

interface PublicProfilePageProps {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({
  params,
}: PublicProfilePageProps): Promise<Metadata> {
  const { username } = await params;
  const hub = await getPublicProfileHub(username);

  if (!hub) {
    return { title: "Pagina nao encontrada - FolioTree" };
  }

  const displayName = hub.displayName ?? username;
  const headline = hub.headline ?? "";

  return {
    title: `${displayName} - FolioTree`,
    description:
      headline ||
      `Veja o perfil publico, portfolios e curriculos de ${displayName} no FolioTree.`,
  };
}

export default async function PublicProfilePage({ params }: PublicProfilePageProps) {
  const { username } = await params;
  const [session, hub, reviewSummary] = await Promise.all([
    auth(),
    getPublicProfileHub(username),
    getPublicReviewSummary(username),
  ]);

  if (!hub) {
    notFound();
  }

  return (
    <PublicProfileHubPage
      username={username}
      hub={hub}
      reviewSummary={reviewSummary}
      isOwner={session?.user?.id === hub.user.id}
    />
  );
}
