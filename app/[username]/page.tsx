import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { AppShell } from "@/components/app/AppShell";
import PublicProfileHubPage from "@/components/public/PublicProfileHubPage";
import { PublicVisitorShell } from "@/components/public/PublicVisitorShell";
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
    return { title: "Pagina nao encontrada - LINKFOLIO" };
  }

  const displayName = hub.displayName ?? username;
  const headline = hub.headline ?? "";

  return {
    title: `${displayName} - LINKFOLIO`,
    description:
      headline ||
      `Veja o perfil publico, portfolios e curriculos de ${displayName} no LINKFOLIO.`,
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

  const isOwner = session?.user?.id === hub.user.id;

  if (isOwner) {
    return (
      <AppShell
        userName={hub.displayName ?? hub.user.username ?? undefined}
        userImage={hub.avatarUrl ?? undefined}
        userUsername={hub.user.username}
      >
        <PublicProfileHubPage
          username={username}
          hub={hub}
          reviewSummary={reviewSummary}
          isOwner
          embedded
        />
      </AppShell>
    );
  }

  return (
    <PublicVisitorShell>
      <PublicProfileHubPage
        username={username}
        hub={hub}
        reviewSummary={reviewSummary}
        isOwner={false}
        embedded
      />
    </PublicVisitorShell>
  );
}
