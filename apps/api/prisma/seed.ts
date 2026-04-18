import { BlockType, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const template = await prisma.template.upsert({
    where: { slug: "community-portfolio" },
    create: {
      slug: "community-portfolio",
      name: "Community Portfolio",
      description:
        "Portfolio editorial inspirado no template Figma Community, adaptado para tokens FolioTree.",
    },
    update: {
      name: "Community Portfolio",
      description:
        "Portfolio editorial inspirado no template Figma Community, adaptado para tokens FolioTree.",
    },
  });

  await prisma.templateRevision.deleteMany({
    where: { templateId: template.id, version: "0.1.0" },
  });

  await prisma.templateRevision.create({
    data: {
      templateId: template.id,
      version: "0.1.0",
      tokens: {
        fonts: {
          display: "Sora",
          ui: "Inter",
          data: "IBM Plex Mono",
        },
        colors: {
          background: "#FBF8CC",
          ink: "#03045E",
          accent: "#F5EE84",
        },
      },
      blocks: {
        create: [
          ["HERO", "Hero", 0, true],
          ["SOCIAL_LINKS", "Social links", 1, false],
          ["ABOUT", "About", 2, false],
          ["EXPERIENCE_TIMELINE", "Experience", 3, false],
          ["PROJECT_GRID", "Work", 4, false],
          ["PROOF_LIST", "Proof", 5, false],
          ["CONTACT", "Contact", 6, false],
        ].map(([type, name, sortOrder, required]) => ({
          type: type as BlockType,
          name: String(name),
          sortOrder: Number(sortOrder),
          required: Boolean(required),
          defaultVisible: true,
          contentSchema: {},
          styleSchema: {},
          defaultContent: {},
        })),
      },
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
