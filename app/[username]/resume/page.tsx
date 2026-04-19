import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PublicResumePage from "@/components/public/PublicResumePage";
import {
  getPrimaryPublishedPage,
  requirePublishedResume,
} from "@/lib/server/domain/public-pages";

interface ResumePageProps {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: ResumePageProps): Promise<Metadata> {
  const { username } = await params;
  const page = await getPrimaryPublishedPage(username);

  if (!page || page.version.resumeConfig?.publishState !== "PUBLISHED") {
    return { title: "Curriculo nao encontrado - FolioTree" };
  }

  const displayName = page.version.profile.displayName ?? username;

  return {
    title: `Curriculo - ${displayName} | FolioTree`,
    description: `Curriculo profissional de ${displayName}.`,
  };
}

export default async function ResumePage({ params }: ResumePageProps) {
  const { username } = await params;
  const page = await getPrimaryPublishedPage(username);

  if (!page) {
    notFound();
  }

  const resumeConfig = requirePublishedResume(page);
  return <PublicResumePage page={page} username={username} resumeConfig={resumeConfig} />;
}
