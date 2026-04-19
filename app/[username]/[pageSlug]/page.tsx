import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PublicTemplatePage from "@/components/public/PublicTemplatePage";
import {
  getPublishedPageByUsernameAndSlug,
  getPublicProfile,
  toPublicVersionSelection,
} from "@/lib/server/domain/public-pages";

interface PublicTemplateSlugPageProps {
  params: Promise<{ username: string; pageSlug: string }>;
}

export async function generateMetadata({
  params,
}: PublicTemplateSlugPageProps): Promise<Metadata> {
  const { username, pageSlug } = await params;
  const page = await getPublishedPageByUsernameAndSlug(username, pageSlug);

  if (!page) {
    return { title: "Pagina nao encontrada - FolioTree" };
  }

  const profile = getPublicProfile(page);
  const version = toPublicVersionSelection(page);
  const displayName = profile.displayName ?? username;
  const headline = version.customHeadline ?? profile.headline ?? "";

  return {
    title: `${displayName} - ${page.title ?? page.version.name}`,
    description: headline || `Veja a pagina publica de ${displayName} no FolioTree.`,
  };
}

export default async function PublicTemplateSlugPage({
  params,
}: PublicTemplateSlugPageProps) {
  const { username, pageSlug } = await params;
  const page = await getPublishedPageByUsernameAndSlug(username, pageSlug);

  if (!page) {
    notFound();
  }

  return <PublicTemplatePage page={page} username={username} pageSlug={pageSlug} />;
}
