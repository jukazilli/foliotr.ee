import type { FastifyInstance, FastifyRequest } from "fastify";
import { BlockType, Prisma, PublishStatus, VersionGoal } from "@prisma/client";
import { getAuthContext } from "./auth.js";
import { getDb } from "./db.js";

type JsonBody = Record<string, unknown>;

function bodyOf(request: FastifyRequest): JsonBody {
  return typeof request.body === "object" && request.body !== null
    ? (request.body as JsonBody)
    : {};
}

function stringValue(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function optionalString(value: unknown) {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

async function getOrCreateUser(request: FastifyRequest) {
  const auth = getAuthContext(request);
  const db = getDb();

  return db.user.upsert({
    where: { clerkUserId: auth.clerkUserId },
    create: {
      clerkUserId: auth.clerkUserId,
      email: optionalString(request.headers["x-user-email"]),
      name: optionalString(request.headers["x-user-name"]),
    },
    update: {},
  });
}

async function getOwnedProfile(request: FastifyRequest) {
  const user = await getOrCreateUser(request);
  const db = getDb();

  return db.profile.findUnique({
    where: { userId: user.id },
    include: {
      links: { orderBy: { sortOrder: "asc" } },
      proofs: true,
      projects: true,
      experiences: true,
      achievements: true,
      highlights: { orderBy: { sortOrder: "asc" } },
      versions: true,
    },
  });
}

const blockTypeByDomain = {
  hero: BlockType.HERO,
  about: BlockType.ABOUT,
  experienceTimeline: BlockType.EXPERIENCE_TIMELINE,
  projectGrid: BlockType.PROJECT_GRID,
  proofList: BlockType.PROOF_LIST,
  links: BlockType.LINKS,
  contact: BlockType.CONTACT,
  image: BlockType.IMAGE,
  resumeCta: BlockType.RESUME_CTA,
  socialLinks: BlockType.SOCIAL_LINKS,
} as const;

export async function registerRoutes(app: FastifyInstance) {
  app.get("/v1/me", async (request) => {
    const user = await getOrCreateUser(request);
    const profile = await getOwnedProfile(request);

    return { user, profile };
  });

  app.get("/v1/profile", async (request) => {
    return getOwnedProfile(request);
  });

  app.put("/v1/profile", async (request) => {
    const user = await getOrCreateUser(request);
    const body = bodyOf(request);

    return getDb().profile.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        slug: stringValue(body.slug, `profile-${user.id}`),
        displayName: stringValue(body.displayName, "Untitled profile"),
        headline: stringValue(body.headline, "Professional value, clear in seconds."),
        location: optionalString(body.location),
        bio: stringValue(body.bio),
        avatarUrl: optionalString(body.avatarUrl),
      },
      update: {
        slug: optionalString(body.slug),
        displayName: optionalString(body.displayName),
        headline: optionalString(body.headline),
        location: optionalString(body.location),
        bio: optionalString(body.bio),
        avatarUrl: optionalString(body.avatarUrl),
      },
    });
  });

  app.get("/v1/links", async (request) => {
    const profile = await getOwnedProfile(request);
    if (!profile) return [];
    return getDb().link.findMany({
      where: { profileId: profile.id },
      orderBy: { sortOrder: "asc" },
    });
  });

  app.post("/v1/links", async (request) => {
    const profile = await getOwnedProfile(request);
    if (!profile) throw new Error("Profile required");
    const body = bodyOf(request);

    return getDb().link.create({
      data: {
        profileId: profile.id,
        label: stringValue(body.label, "Link"),
        url: stringValue(body.url, "https://example.com"),
        kind: stringValue(body.kind, "link"),
        sortOrder: Number(body.sortOrder ?? 0),
      },
    });
  });

  app.get("/v1/proofs", async (request) => {
    const profile = await getOwnedProfile(request);
    if (!profile) return [];
    return getDb().proof.findMany({ where: { profileId: profile.id } });
  });

  app.post("/v1/proofs", async (request) => {
    const profile = await getOwnedProfile(request);
    if (!profile) throw new Error("Profile required");
    const body = bodyOf(request);

    return getDb().proof.create({
      data: {
        profileId: profile.id,
        title: stringValue(body.title, "Proof"),
        summary: stringValue(body.summary),
        metricLabel: optionalString(body.metricLabel),
        metricValue: optionalString(body.metricValue),
        url: optionalString(body.url),
      },
    });
  });

  app.get("/v1/projects", async (request) => {
    const profile = await getOwnedProfile(request);
    if (!profile) return [];
    return getDb().project.findMany({ where: { profileId: profile.id } });
  });

  app.post("/v1/projects", async (request) => {
    const profile = await getOwnedProfile(request);
    if (!profile) throw new Error("Profile required");
    const body = bodyOf(request);

    return getDb().project.create({
      data: {
        profileId: profile.id,
        title: stringValue(body.title, "Project"),
        summary: stringValue(body.summary),
        role: optionalString(body.role),
        result: optionalString(body.result),
        imageUrl: optionalString(body.imageUrl),
        url: optionalString(body.url),
      },
    });
  });

  app.get("/v1/experiences", async (request) => {
    const profile = await getOwnedProfile(request);
    if (!profile) return [];
    return getDb().experience.findMany({ where: { profileId: profile.id } });
  });

  app.post("/v1/experiences", async (request) => {
    const profile = await getOwnedProfile(request);
    if (!profile) throw new Error("Profile required");
    const body = bodyOf(request);

    return getDb().experience.create({
      data: {
        profileId: profile.id,
        company: stringValue(body.company, "Company"),
        role: stringValue(body.role, "Role"),
        startDate: stringValue(body.startDate, "2024"),
        endDate: optionalString(body.endDate),
        summary: stringValue(body.summary),
      },
    });
  });

  app.get("/v1/highlights", async (request) => {
    const profile = await getOwnedProfile(request);
    if (!profile) return [];
    return getDb().highlight.findMany({
      where: { profileId: profile.id },
      orderBy: { sortOrder: "asc" },
    });
  });

  app.get("/v1/achievements", async (request) => {
    const profile = await getOwnedProfile(request);
    if (!profile) return [];
    return getDb().achievement.findMany({ where: { profileId: profile.id } });
  });

  app.post("/v1/achievements", async (request) => {
    const profile = await getOwnedProfile(request);
    if (!profile) throw new Error("Profile required");
    const body = bodyOf(request);

    return getDb().achievement.create({
      data: {
        profileId: profile.id,
        title: stringValue(body.title, "Achievement"),
        summary: stringValue(body.summary),
        year: optionalString(body.year),
      },
    });
  });

  app.post("/v1/highlights", async (request) => {
    const profile = await getOwnedProfile(request);
    if (!profile) throw new Error("Profile required");
    const body = bodyOf(request);

    return getDb().highlight.create({
      data: {
        profileId: profile.id,
        title: stringValue(body.title, "Highlight"),
        body: stringValue(body.body),
        sortOrder: Number(body.sortOrder ?? 0),
      },
    });
  });

  app.get("/v1/versions", async (request) => {
    const profile = await getOwnedProfile(request);
    if (!profile) return [];
    return getDb().version.findMany({ where: { profileId: profile.id } });
  });

  app.post("/v1/versions", async (request) => {
    const profile = await getOwnedProfile(request);
    if (!profile) throw new Error("Profile required");
    const body = bodyOf(request);

    return getDb().version.create({
      data: {
        profileId: profile.id,
        name: stringValue(body.name, "New version"),
        goal: VersionGoal.GENERAL,
        status: PublishStatus.DRAFT,
        audience: optionalString(body.audience),
        summary: stringValue(body.summary),
      },
    });
  });

  app.get("/v1/templates", async () => {
    return getDb().template.findMany({
      include: {
        revisions: {
          include: {
            blocks: { orderBy: { sortOrder: "asc" } },
          },
        },
      },
    });
  });

  app.get("/v1/pages", async (request) => {
    const profile = await getOwnedProfile(request);
    if (!profile) return [];
    return getDb().page.findMany({
      where: { version: { profileId: profile.id } },
      include: { blocks: { orderBy: { sortOrder: "asc" } } },
    });
  });

  app.post("/v1/pages", async (request) => {
    const profile = await getOwnedProfile(request);
    if (!profile) throw new Error("Profile required");
    const body = bodyOf(request);
    const db = getDb();
    const version = await db.version.findFirst({ where: { profileId: profile.id } });
    if (!version) throw new Error("Version required");
    const template = await db.template.findFirst({
      where: { slug: stringValue(body.templateSlug, "community-portfolio") },
      include: {
        revisions: {
          orderBy: { createdAt: "desc" },
          take: 1,
          include: { blocks: { orderBy: { sortOrder: "asc" } } },
        },
      },
    });
    const revision = template?.revisions[0];
    if (!template || !revision) throw new Error("Template required");

    return db.page.create({
      data: {
        versionId: version.id,
        templateId: template.id,
        templateRevisionId: revision.id,
        slug: stringValue(body.slug, `${profile.slug}-page`),
        title: stringValue(body.title, profile.displayName),
        status: PublishStatus.DRAFT,
        blocks: {
          create: revision.blocks.map((block) => ({
            templateBlock: block.id,
            type: block.type,
            name: block.name,
            sortOrder: block.sortOrder,
            visible: block.defaultVisible,
            content: (block.defaultContent ?? {}) as Prisma.InputJsonValue,
            style: {},
            assetRefs: [],
          })),
        },
      },
      include: { blocks: { orderBy: { sortOrder: "asc" } } },
    });
  });

  app.patch("/v1/pages/:id/publish", async (request) => {
    const { id } = request.params as { id: string };
    return getDb().page.update({
      where: { id },
      data: {
        status: PublishStatus.PUBLISHED,
        publishedAt: new Date(),
      },
    });
  });

  app.patch("/v1/pages/:id/unpublish", async (request) => {
    const { id } = request.params as { id: string };
    return getDb().page.update({
      where: { id },
      data: {
        status: PublishStatus.DRAFT,
        publishedAt: null,
      },
    });
  });

  app.get("/v1/resumes", async (request) => {
    const profile = await getOwnedProfile(request);
    if (!profile) return [];
    return getDb().resumeView.findMany({
      where: { version: { profileId: profile.id } },
    });
  });

  app.post("/v1/resumes", async (request) => {
    const profile = await getOwnedProfile(request);
    if (!profile) throw new Error("Profile required");
    const version = await getDb().version.findFirst({ where: { profileId: profile.id } });
    if (!version) throw new Error("Version required");
    const body = bodyOf(request);

    return getDb().resumeView.create({
      data: {
        versionId: version.id,
        slug: stringValue(body.slug, `${profile.slug}-resume`),
        title: stringValue(body.title, `${profile.displayName} Resume`),
        status: PublishStatus.DRAFT,
        visibleSections: ["summary", "experience", "projects", "proof", "links"],
      },
    });
  });

  app.patch("/v1/resumes/:id/publish", async (request) => {
    const { id } = request.params as { id: string };
    return getDb().resumeView.update({
      where: { id },
      data: {
        status: PublishStatus.PUBLISHED,
        publishedAt: new Date(),
      },
    });
  });

  app.patch("/v1/resumes/:id/unpublish", async (request) => {
    const { id } = request.params as { id: string };
    return getDb().resumeView.update({
      where: { id },
      data: {
        status: PublishStatus.DRAFT,
        publishedAt: null,
      },
    });
  });

  app.get("/v1/assets", async (request) => {
    const user = await getOrCreateUser(request);
    return getDb().asset.findMany({ where: { userId: user.id } });
  });

  app.post("/v1/assets", async (request) => {
    const user = await getOrCreateUser(request);
    const body = bodyOf(request);

    return getDb().asset.create({
      data: {
        userId: user.id,
        kind: "IMAGE",
        provider: stringValue(body.provider, "vercel-blob"),
        url: stringValue(body.url),
        alt: optionalString(body.alt),
        metadata: {},
      },
    });
  });

  app.get("/v1/public/pages/:slug", async (request) => {
    const { slug } = request.params as { slug: string };
    return getDb().page.findUnique({
      where: { slug },
      include: {
        blocks: { orderBy: { sortOrder: "asc" } },
        version: { include: { profile: true } },
        template: true,
      },
    });
  });

  app.get("/v1/public/resumes/:slug", async (request) => {
    const { slug } = request.params as { slug: string };
    return getDb().resumeView.findUnique({
      where: { slug },
      include: {
        version: { include: { profile: true } },
      },
    });
  });
}

export { blockTypeByDomain };
