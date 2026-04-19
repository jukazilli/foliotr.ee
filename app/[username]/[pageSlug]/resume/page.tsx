import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PublicResumePage from "@/components/public/PublicResumePage";
import {
  getPublicProfile,
  getPublishedPageByUsernameAndSlug,
  requirePublishedResume,
} from "@/lib/server/domain/public-pages";

interface PublicResumeSlugPageProps {
  params: Promise<{ username: string; pageSlug: string }>;
}

export async function generateMetadata({
  params,
}: PublicResumeSlugPageProps): Promise<Metadata> {
  const { username, pageSlug } = await params;
  const page = await getPublishedPageByUsernameAndSlug(username, pageSlug);

  if (!page || page.version.resumeConfig?.publishState !== "PUBLISHED") {
    return { title: "Curriculo nao encontrado - FolioTree" };
  }

  const displayName = getPublicProfile(page).displayName ?? username;

  return {
    title: `Curriculo - ${displayName} | FolioTree`,
    description: `Curriculo profissional de ${displayName}.`,
  };
}

export default async function PublicResumeSlugPage({
  params,
}: PublicResumeSlugPageProps) {
  const { username, pageSlug } = await params;
  const page = await getPublishedPageByUsernameAndSlug(username, pageSlug);

  if (!page) {
    notFound();
  }

  const { snapshot } = requirePublishedResume(page);
  return (
    <PublicResumePage
      page={page}
      username={username}
      pageSlug={pageSlug}
      snapshot={snapshot}
    />
  );
}
