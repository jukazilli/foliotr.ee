import Link from "next/link";
import { notFound } from "next/navigation";
import TemplateRenderer from "@/components/templates/TemplateRenderer";
import type { RenderablePageBlock, TemplateProfile } from "@/components/templates/types";
import { prisma } from "@/lib/prisma";
import { getCanonicalTemplateBySlug } from "@/lib/server/domain/canonical-templates";

interface TemplateExamplePageProps {
  params: Promise<{ slug: string }>;
}

function toRenderableBlocks(template: NonNullable<Awaited<ReturnType<typeof getCanonicalTemplateBySlug>>>) {
  const now = new Date();

  return template.blockDefs.map((blockDef) => ({
    id: `example-${blockDef.id}`,
    pageId: "template-example",
    templateBlockDefId: blockDef.id,
    parentId: null,
    key: blockDef.key,
    blockType: blockDef.blockType,
    order: blockDef.defaultOrder,
    visible: true,
    config: blockDef.defaultConfig,
    props: blockDef.defaultProps,
    assets: {},
    createdAt: now,
    updatedAt: now,
    templateBlockDef: blockDef,
    children: [],
  })) as RenderablePageBlock[];
}

function getExampleProfile(): TemplateProfile {
  const now = new Date();

  return {
    id: "template-example-profile",
    userId: "template-example-user",
    displayName: "Alex Morgan",
    avatarUrl: null,
    bannerUrl: null,
    headline: "Designer de Produto",
    bio: "Criando produtos digitais claros para equipes em movimento rapido.",
    location: "Amsterdam",
    pronouns: null,
    websiteUrl: "https://example.com",
    publicEmail: "hello@example.com",
    phone: null,
    birthDate: null,
    onboardingDone: true,
    createdAt: now,
    updatedAt: now,
    user: {
      name: "Alex Morgan",
      email: "hello@example.com",
      username: "alex",
    },
    experiences: [],
    educations: [],
    skills: [],
    projects: [],
    achievements: [],
    links: [],
    proofs: [],
  } as unknown as TemplateProfile;
}

export default async function TemplateExamplePage({ params }: TemplateExamplePageProps) {
  const { slug } = await params;
  const template = await getCanonicalTemplateBySlug(prisma, slug);

  if (!template) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="fixed right-4 top-4 z-50 print:hidden">
        <Link
          href="/templates"
          className="inline-flex h-9 items-center rounded-lg border border-black/10 bg-white/90 px-3 text-sm font-semibold text-neutral-900 shadow-sm backdrop-blur transition hover:bg-white"
        >
          Voltar
        </Link>
      </div>
      <TemplateRenderer
        templateSlug={template.slug}
        blocks={toRenderableBlocks(template)}
        profile={getExampleProfile()}
        version={{
          customHeadline: null,
          customBio: null,
          selectedExperienceIds: [],
          selectedEducationIds: [],
          selectedProjectIds: [],
          selectedSkillIds: [],
          selectedAchievementIds: [],
          selectedProofIds: [],
          selectedHighlightIds: [],
          selectedLinkIds: [],
        }}
        templateSourcePackage={template.sourcePackage}
      />
    </main>
  );
}
