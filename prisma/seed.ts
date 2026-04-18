import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Upsert Template "classic"
  const template = await prisma.template.upsert({
    where: { slug: "classic" },
    update: {
      name: "Clássico",
      description: "Template limpo e profissional",
    },
    create: {
      name: "Clássico",
      slug: "classic",
      description: "Template limpo e profissional",
      isActive: true,
    },
  });

  const blockDefs: Array<{
    blockType: string;
    defaultOrder: number;
    required: boolean;
    defaultConfig: Record<string, unknown>;
  }> = [
    {
      blockType: "hero",
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
      blockType: "about",
      defaultOrder: 1,
      required: false,
      defaultConfig: {
        title: "Sobre mim",
        showLocation: true,
        showLinks: true,
      },
    },
    {
      blockType: "experience",
      defaultOrder: 2,
      required: false,
      defaultConfig: {
        title: "Experiência",
        maxItems: 5,
        showCompanyLogo: true,
        showCurrentBadge: true,
      },
    },
    {
      blockType: "education",
      defaultOrder: 3,
      required: false,
      defaultConfig: {
        title: "Formação",
        maxItems: 3,
      },
    },
    {
      blockType: "skills",
      defaultOrder: 4,
      required: false,
      defaultConfig: {
        title: "Habilidades",
        layout: "tags",
        showLevel: false,
        showCategory: true,
      },
    },
    {
      blockType: "projects",
      defaultOrder: 5,
      required: false,
      defaultConfig: {
        title: "Projetos",
        layout: "grid",
        maxItems: 6,
        showImages: true,
      },
    },
    {
      blockType: "achievements",
      defaultOrder: 6,
      required: false,
      defaultConfig: {
        title: "Conquistas",
        showMetrics: true,
        showDates: true,
      },
    },
    {
      blockType: "proof",
      defaultOrder: 7,
      required: false,
      defaultConfig: {
        title: "Resultados",
        showMetrics: true,
      },
    },
    {
      blockType: "links",
      defaultOrder: 8,
      required: false,
      defaultConfig: {
        title: "Links",
        layout: "grid",
      },
    },
    {
      blockType: "contact",
      defaultOrder: 9,
      required: false,
      defaultConfig: {
        title: "Contato",
        showEmail: true,
        showPhone: false,
      },
    },
  ];

  for (const blockDef of blockDefs) {
    await prisma.templateBlockDef.upsert({
      where: {
        templateId_blockType: {
          templateId: template.id,
          blockType: blockDef.blockType,
        },
      },
      update: {
        defaultOrder: blockDef.defaultOrder,
        required: blockDef.required,
        defaultConfig: blockDef.defaultConfig,
      },
      create: {
        templateId: template.id,
        blockType: blockDef.blockType,
        defaultOrder: blockDef.defaultOrder,
        required: blockDef.required,
        defaultConfig: blockDef.defaultConfig,
      },
    });
  }

  console.log("✅ Seed concluído");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
