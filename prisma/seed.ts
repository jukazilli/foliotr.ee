import { Prisma, PrismaClient } from "@prisma/client";
import { PORTFOLIO_COMMUNITY_TEMPLATE } from "../lib/templates/portfolio-community";

const prisma = new PrismaClient();

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
  await upsertTemplate({
    slug: "classic",
    name: "Classico",
    description: "Template limpo e profissional",
    theme: {
      fontFamily: "FolioTree system",
      background: "#FFFFFF",
      ink: "#0F1115",
      accent: "#D5F221",
    },
    blocks: [
      {
        key: "classic-hero",
        blockType: "hero",
        label: "Apresentacao",
        defaultOrder: 0,
        required: true,
        defaultConfig: {
          showAvatar: true,
          showBanner: false,
          ctaText: "Entre em contato",
          layout: "centered",
        },
      },
      {
        key: "classic-about",
        blockType: "about",
        label: "Sobre mim",
        defaultOrder: 1,
        required: false,
        defaultConfig: {
          title: "Sobre mim",
          showLocation: true,
          showLinks: true,
        },
      },
      {
        key: "classic-experience",
        blockType: "experience",
        label: "Experiencia",
        defaultOrder: 2,
        required: false,
        defaultConfig: {
          title: "Experiencia",
          maxItems: 5,
          showCompanyLogo: true,
          showCurrentBadge: true,
        },
      },
      {
        key: "classic-projects",
        blockType: "projects",
        label: "Projetos",
        defaultOrder: 3,
        required: false,
        defaultConfig: {
          title: "Projetos",
          layout: "grid",
          maxItems: 6,
          showImages: true,
        },
      },
      {
        key: "classic-contact",
        blockType: "contact",
        label: "Contato",
        defaultOrder: 4,
        required: false,
        defaultConfig: {
          title: "Contato",
          showEmail: true,
          showPhone: false,
        },
      },
    ],
  });

  await upsertTemplate({
    slug: PORTFOLIO_COMMUNITY_TEMPLATE.slug,
    name: PORTFOLIO_COMMUNITY_TEMPLATE.name,
    description: PORTFOLIO_COMMUNITY_TEMPLATE.description,
    thumbnail: PORTFOLIO_COMMUNITY_TEMPLATE.thumbnail,
    version: PORTFOLIO_COMMUNITY_TEMPLATE.version,
    source: PORTFOLIO_COMMUNITY_TEMPLATE.source,
    sourceNodeId: PORTFOLIO_COMMUNITY_TEMPLATE.sourceNodeId,
    theme: PORTFOLIO_COMMUNITY_TEMPLATE.theme,
    blocks: PORTFOLIO_COMMUNITY_TEMPLATE.blocks,
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
