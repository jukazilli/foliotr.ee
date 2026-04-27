import type { Metadata } from "next";
import { notFound } from "next/navigation";
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
    return { title: "Página não encontrada - FolioTree" };
  }

  const displayName = hub.displayName ?? username;
  const headline = hub.headline ?? "";

  return {
    title: `${displayName} - FolioTree`,
    description:
      headline ||
      `Veja o perfil público, portfólios e currículos de ${displayName} no FolioTree.`,
  };
}

export default async function PublicProfilePage({ params }: PublicProfilePageProps) {
  const { username } = await params;
  const [hub, reviewSummary] = await Promise.all([
    getPublicProfileHub(username),
    getPublicReviewSummary(username),
  ]);

  if (!hub) {
    notFound();
  }

  return (
    <PublicProfileHubPage username={username} hub={hub} reviewSummary={reviewSummary} />
  );
}
