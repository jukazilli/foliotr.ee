import nextEnv from "@next/env";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const { loadEnvConfig } = nextEnv;
loadEnvConfig(process.cwd());

const prisma = new PrismaClient();

const email = "perf-audit@foliotree.local";
const password = "PerfAudit123";

async function main() {
  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      name: "Perf Audit",
      username: "perf-audit",
      passwordHash,
    },
    create: {
      email,
      name: "Perf Audit",
      username: "perf-audit",
      passwordHash,
      profile: {
        create: {
          displayName: "Perf Audit",
          headline: "Perfil local de benchmark",
          bio: "Perfil usado apenas para auditoria local de performance.",
          onboardingDone: true,
          versions: {
            create: {
              name: "Principal",
              isDefault: true,
            },
          },
          experiences: {
            create: [
              {
                company: "FolioTree",
                role: "Benchmark",
                description: "Experiencia local para medicao.",
                startDate: new Date("2024-01-01"),
                current: true,
                order: 0,
              },
            ],
          },
          projects: {
            create: [
              {
                title: "Projeto de benchmark",
                description: "Projeto local para medicao.",
                featured: true,
                order: 0,
              },
            ],
          },
          links: {
            create: [
              {
                platform: "site",
                label: "Site",
                url: "https://foliotree.local",
                order: 0,
              },
            ],
          },
        },
      },
    },
    include: {
      profile: {
        select: {
          id: true,
          versions: { select: { id: true }, take: 1 },
          experiences: { select: { id: true }, take: 1 },
          projects: { select: { id: true }, take: 1 },
          links: { select: { id: true }, take: 1 },
        },
      },
    },
  });

  if (user.profile) {
    await prisma.profile.update({
      where: { id: user.profile.id },
      data: {
        displayName: "Perf Audit",
        headline: "Perfil local de benchmark",
        bio: "Perfil usado apenas para auditoria local de performance.",
        onboardingDone: true,
      },
    });

    if (user.profile.versions.length === 0) {
      await prisma.version.create({
        data: {
          profileId: user.profile.id,
          name: "Principal",
          isDefault: true,
        },
      });
    }
  }

  console.log(JSON.stringify({ email, password, userId: user.id }, null, 2));
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
