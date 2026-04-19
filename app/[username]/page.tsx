import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PublicTemplatePage from "@/components/public/PublicTemplatePage";
import { getPrimaryPublishedPage } from "@/lib/server/domain/public-pages";

interface PublicProfilePageProps {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({
  params,
}: PublicProfilePageProps): Promise<Metadata> {
  const { username } = await params;
  const page = await getPrimaryPublishedPage(username);

  if (!page) {
    return { title: "Pagina nao encontrada - FolioTree" };
  }

  const displayName = page.version.profile.displayName ?? username;
  const headline = page.version.customHeadline ?? page.version.profile.headline ?? "";

  return {
    title: `${displayName} - FolioTree`,
    description: headline || `Veja a pagina publica de ${displayName} no FolioTree.`,
  };
}

export default async function PublicProfilePage({ params }: PublicProfilePageProps) {
  const { username } = await params;
  const page = await getPrimaryPublishedPage(username);

  if (!page) {
    notFound();
  }

  return <PublicTemplatePage page={page} username={username} />;
}
