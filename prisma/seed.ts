import { Prisma } from "../generated/prisma-client";
import { prisma } from "../lib/prisma";
import { portfolioCommunityManifest } from "../assets/template/portfolio-community/manifest";

type SeedBlock = {
  key: string;
  blockType: string;
  label: string;
  category?: string;
  defaultOrder: number;
  required: boolean;
  defaultConfig: Prisma.InputJsonValue;
  defaultProps?: Prisma.InputJsonValue;
  editableFields?: Prisma.InputJsonValue;
  assetFields?: Prisma.InputJsonValue;
  allowedChildren?: Prisma.InputJsonValue;
};

async function upsertTemplate(args: {
  slug: string;
  name: string;
  description: string;
  thumbnail?: string | null;
  coverUrl?: string | null;
  referenceUrl?: string | null;
  category?: string;
  tags?: string[];
  libraryStatus?: string;
  origin?: string | null;
  summary?: string | null;
  detail?: string | null;
  sortOrder?: number;
  eligibility?: Prisma.InputJsonValue;
  resumeDefaults?: Prisma.InputJsonValue;
  restrictions?: Prisma.InputJsonValue;
  sourcePackage?: Prisma.InputJsonValue;
  version?: number;
  source?: string | null;
  sourceNodeId?: string | null;
  theme?: Prisma.InputJsonValue;
  blocks: SeedBlock[];
}) {
  const template = await prisma.template.upsert({
    where: { slug: args.slug },
    update: {
      name: args.name,
      description: args.description,
      thumbnail: args.thumbnail,
      coverUrl: args.coverUrl,
      referenceUrl: args.referenceUrl,
      category: args.category ?? "general",
      tags: args.tags ?? [],
      libraryStatus: args.libraryStatus ?? "available",
      origin: args.origin,
      summary: args.summary,
      detail: args.detail,
      sortOrder: args.sortOrder ?? 0,
      eligibility: args.eligibility ?? {},
      resumeDefaults: args.resumeDefaults ?? {},
      restrictions: args.restrictions ?? {},
      sourcePackage: args.sourcePackage ?? {},
      version: args.version ?? 1,
      source: args.source,
      sourceNodeId: args.sourceNodeId,
      theme: args.theme ?? {},
      isActive: true,
    },
    create: {
      name: args.name,
      slug: args.slug,
      description: args.description,
      thumbnail: args.thumbnail,
      coverUrl: args.coverUrl,
      referenceUrl: args.referenceUrl,
      category: args.category ?? "general",
      tags: args.tags ?? [],
      libraryStatus: args.libraryStatus ?? "available",
      origin: args.origin,
      summary: args.summary,
      detail: args.detail,
      sortOrder: args.sortOrder ?? 0,
      eligibility: args.eligibility ?? {},
      resumeDefaults: args.resumeDefaults ?? {},
      restrictions: args.restrictions ?? {},
      sourcePackage: args.sourcePackage ?? {},
      version: args.version ?? 1,
      source: args.source,
      sourceNodeId: args.sourceNodeId,
      theme: args.theme ?? {},
      isActive: true,
    },
  });

  for (const block of args.blocks) {
    await prisma.templateBlockDef.upsert({
      where: {
        templateId_key: {
          templateId: template.id,
          key: block.key,
        },
      },
      update: {
        blockType: block.blockType,
        label: block.label,
        category: block.category ?? "section",
        defaultOrder: block.defaultOrder,
        required: block.required,
        repeatable: false,
        defaultConfig: block.defaultConfig,
        defaultProps: block.defaultProps ?? {},
        editableFields: block.editableFields ?? [],
        assetFields: block.assetFields ?? [],
        allowedChildren: block.allowedChildren ?? [],
      },
      create: {
        templateId: template.id,
        key: block.key,
        blockType: block.blockType,
        label: block.label,
        category: block.category ?? "section",
        defaultOrder: block.defaultOrder,
        required: block.required,
        repeatable: false,
        defaultConfig: block.defaultConfig,
        defaultProps: block.defaultProps ?? {},
        editableFields: block.editableFields ?? [],
        assetFields: block.assetFields ?? [],
        allowedChildren: block.allowedChildren ?? [],
      },
    });
  }

  return template;
}

async function main() {
  await prisma.template.updateMany({
    where: { slug: "classic" },
    data: { isActive: false },
  });

  await upsertTemplate({
    slug: portfolioCommunityManifest.slug,
    name: portfolioCommunityManifest.name,
    description: portfolioCommunityManifest.description,
    thumbnail: "/template-assets/portfolio-community/cover.png",
    coverUrl: "/template-assets/portfolio-community/cover.png",
    referenceUrl: null,
    category: portfolioCommunityManifest.library.category,
    tags: [...portfolioCommunityManifest.library.tags],
    libraryStatus: portfolioCommunityManifest.library.status,
    origin: portfolioCommunityManifest.library.origin ?? null,
    summary: portfolioCommunityManifest.library.summary,
    detail: portfolioCommunityManifest.library.detail,
    sortOrder: portfolioCommunityManifest.library.sortOrder,
    eligibility: portfolioCommunityManifest.eligibility,
    resumeDefaults: portfolioCommunityManifest.resumeDefaults,
    restrictions: portfolioCommunityManifest.restrictions,
    version: portfolioCommunityManifest.version,
    source: portfolioCommunityManifest.source,
    sourceNodeId: null,
    theme: portfolioCommunityManifest.theme,
    blocks: portfolioCommunityManifest.blocks.map((block) => ({
      key: block.key,
      blockType: block.blockType,
      label: block.label,
      category: block.category,
      defaultOrder: block.defaultOrder,
      required: block.required,
      defaultConfig: block.defaultConfig,
      defaultProps: ("defaultProps" in block ? block.defaultProps : {}) ?? {},
      editableFields: [...block.editableFields],
      assetFields: [...block.assetFields],
      allowedChildren: [...block.allowedChildren],
    })),
  });

  console.log("Seed completed");
}

main()
  .catch((e) => {
    const errorName = e instanceof Error ? e.name : typeof e;
    console.error(`[seed] ${errorName}`);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
