import type { TemplateBlockDef } from "@prisma/client";
import type { SemanticSeedStrategy, SemanticSeededBlock } from "@/lib/templates/semantic/types";

function asRecord(value: unknown) {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function readString(value: unknown) {
  return typeof value === "string" ? value : "";
}

function hasText(value: unknown) {
  return typeof value === "string" && value.trim().length > 0;
}

function formatLocationLine(location: string | null | undefined) {
  if (!location) return "";
  return `based in ${location}.`;
}

function toProofLink(
  proof: {
    id: string;
    title: string;
    url: string;
    metric?: string | null;
  },
  order: number
) {
  return {
    order,
    label: proof.metric?.trim() ? `${proof.title} - ${proof.metric}` : proof.title,
    href: proof.url,
    type: "proof",
  };
}

function hasProofUrl<T extends { url: string | null }>(
  proof: T
): proof is T & { url: string } {
  return typeof proof.url === "string" && proof.url.trim().length > 0;
}

function toProfileLink(
  link: {
    id: string;
    platform: string;
    url: string;
    label?: string | null;
  },
  order: number
) {
  return {
    order,
    label: link.label?.trim() ? link.label : link.platform,
    href: link.url,
    type: "profileLink",
  };
}

function withSourceMeta(
  blockDef: TemplateBlockDef,
  config: Record<string, unknown>,
  extra: {
    visible: boolean;
    resolvedFrom: Array<{ target: string; slot: string; source: string; fallbackUsed?: boolean }>;
  }
): SemanticSeededBlock {
  return {
    key: blockDef.key,
    blockType: blockDef.blockType,
    order: blockDef.defaultOrder,
    visible: extra.visible,
    config,
    props: {
      semantic: {
        blockMeaning: blockDef.blockType,
        resolvedFrom: extra.resolvedFrom,
      },
    },
    assets: {},
  };
}

function getSelectedExperiences(context: Parameters<SemanticSeedStrategy["seedBlocks"]>[0]["context"]) {
  if (context.version.experiences.length > 0) {
    return context.version.experiences
      .map((item) => item.experience)
      .filter(Boolean);
  }

  return [...context.profile.experiences].sort((left, right) => left.order - right.order);
}

function getSelectedProjects(context: Parameters<SemanticSeedStrategy["seedBlocks"]>[0]["context"]) {
  if (context.version.projects.length > 0) {
    return context.version.projects
      .map((item) => item.project)
      .filter(Boolean);
  }

  return [...context.profile.projects].sort((left, right) => left.order - right.order);
}

function getSelectedLinks(context: Parameters<SemanticSeedStrategy["seedBlocks"]>[0]["context"]) {
  if (context.version.links.length > 0) {
    return context.version.links
      .map((item) => item.link)
      .filter(Boolean);
  }

  return [...context.profile.links].sort((left, right) => left.order - right.order);
}

function getSelectedProofs(context: Parameters<SemanticSeedStrategy["seedBlocks"]>[0]["context"]) {
  if (context.version.proofs.length > 0) {
    return context.version.proofs
      .map((item) => item.proof)
      .filter(Boolean);
  }

  return [...context.profile.proofs].sort((left, right) => left.order - right.order);
}

function seedHero(
  blockDef: TemplateBlockDef,
  context: Parameters<SemanticSeedStrategy["seedBlocks"]>[0]["context"]
) {
  const defaultConfig = asRecord(blockDef.defaultConfig);
  const displayName =
    context.profile.displayName ??
    context.profile.user?.name ??
    readString(defaultConfig.name) ??
    "";
  const headline =
    context.version.customHeadline ??
    context.profile.headline ??
    readString(defaultConfig.headline);
  const portrait = context.profile.avatarUrl
    ? {
        src: context.profile.avatarUrl,
        alt: displayName || "Profile portrait",
      }
    : defaultConfig.portrait;
  const username = context.profile.user?.username ?? "";

  return withSourceMeta(blockDef, {
    ...defaultConfig,
    name: displayName,
    headline,
    locationLine:
      formatLocationLine(context.profile.location) ||
      readString(defaultConfig.locationLine),
    ctaHref: username ? `/${username}/resume` : readString(defaultConfig.ctaHref) || "/resume",
    portrait,
  }, {
    visible: hasText(displayName) || hasText(headline),
    resolvedFrom: [
      { target: "name", slot: "profile.displayName", source: "profile.displayName" },
      { target: "headline", slot: "version.headline", source: context.version.customHeadline ? "version.customHeadline" : "profile.headline" },
      { target: "portrait", slot: "profile.avatar", source: context.profile.avatarUrl ? "profile.avatarUrl" : "template.default" },
      { target: "ctaHref", slot: "hero.resumeHref", source: "derived.username.resume" },
    ],
  });
}

function seedAbout(
  blockDef: TemplateBlockDef,
  context: Parameters<SemanticSeedStrategy["seedBlocks"]>[0]["context"]
) {
  const defaultConfig = asRecord(blockDef.defaultConfig);
  const body = context.version.customBio ?? context.profile.bio ?? readString(defaultConfig.body);

  return withSourceMeta(
    blockDef,
    {
      ...defaultConfig,
      body,
    },
    {
      visible: hasText(body),
      resolvedFrom: [
        {
          target: "body",
          slot: "version.about",
          source: context.version.customBio ? "version.customBio" : "profile.bio",
          fallbackUsed: !context.version.customBio && !context.profile.bio,
        },
      ],
    }
  );
}

function seedExperience(
  blockDef: TemplateBlockDef,
  context: Parameters<SemanticSeedStrategy["seedBlocks"]>[0]["context"]
) {
  const defaultConfig = asRecord(blockDef.defaultConfig);
  const experiences = getSelectedExperiences(context);
  const maxItems = Math.min(
    Math.max(experiences.length, 0),
    Number(defaultConfig.maxItems ?? 3) || 3
  );

  return withSourceMeta(
    blockDef,
    {
      ...defaultConfig,
      maxItems: maxItems > 0 ? maxItems : defaultConfig.maxItems ?? 3,
    },
    {
      visible: experiences.length > 0,
      resolvedFrom: [
        {
          target: "maxItems",
          slot: "trajectory.experiences",
          source:
            context.version.experiences.length > 0
              ? "version.experiences"
              : "profile.experiences",
        },
      ],
    }
  );
}

function seedWork(
  blockDef: TemplateBlockDef,
  context: Parameters<SemanticSeedStrategy["seedBlocks"]>[0]["context"]
) {
  const defaultConfig = asRecord(blockDef.defaultConfig);
  const projects = getSelectedProjects(context);
  const fallbackProjects =
    projects.length === 0
      ? []
      : projects.slice(0, 2).map((project) => ({
          title: project.title,
          description: project.description ?? "",
          date: project.startDate
            ? new Date(project.startDate).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })
            : "Featured work",
          image: project.imageUrl
            ? {
                src: project.imageUrl,
                alt: project.title,
              }
            : undefined,
          href: project.url || undefined,
        }));

  return withSourceMeta(
    blockDef,
    {
      ...defaultConfig,
      maxItems:
        projects.length > 0
          ? Math.min(projects.length, Number(defaultConfig.maxItems ?? 2) || 2)
          : defaultConfig.maxItems ?? 2,
      fallbackProjects,
    },
    {
      visible: projects.length > 0,
      resolvedFrom: [
        {
          target: "fallbackProjects",
          slot: "projects.featured",
          source:
            context.version.projects.length > 0 ? "version.projects" : "profile.projects",
        },
      ],
    }
  );
}

function seedContact(
  blockDef: TemplateBlockDef,
  context: Parameters<SemanticSeedStrategy["seedBlocks"]>[0]["context"]
) {
  const defaultConfig = asRecord(blockDef.defaultConfig);
  const links = getSelectedLinks(context);
  const proofs = getSelectedProofs(context).filter(hasProofUrl);
  const mergedLinks = [
    ...links.map((link, index) => toProfileLink(link, index)),
    ...proofs.map((proof, index) => toProofLink(proof, links.length + index)),
  ]
    .sort((left, right) => left.order - right.order)
    .map(({ label, href, type }) => ({ label, href, type }));
  const supportImage =
    proofs.find((proof) => proof.imageUrl)?.imageUrl ||
    readString(asRecord(defaultConfig.image).src);
  const body =
    context.profile.publicEmail || mergedLinks.length > 0
      ? context.version.customBio ?? context.profile.bio ?? readString(defaultConfig.body)
      : readString(defaultConfig.body);

  return withSourceMeta(
    blockDef,
    {
      ...defaultConfig,
      body,
      image: supportImage
        ? {
            src: supportImage,
            alt: readString(asRecord(defaultConfig.image).alt) || "Contact support image",
          }
        : defaultConfig.image,
      links: mergedLinks,
    },
    {
      visible: Boolean(context.profile.publicEmail || mergedLinks.length > 0),
      resolvedFrom: [
        {
          target: "links",
          slot: "contact.links",
          source:
            proofs.length > 0
              ? "profile.links + profile.proofs"
              : links.length > 0
                ? "profile.links"
                : "template.default",
        },
        {
          target: "image",
          slot: "contact.supportImage",
          source: proofs.find((proof) => proof.imageUrl) ? "profile.proofs.imageUrl" : "template.default",
          fallbackUsed: !proofs.find((proof) => proof.imageUrl),
        },
      ],
    }
  );
}

const portfolioCommunityBlockSeeders: Record<
  string,
  (
    blockDef: TemplateBlockDef,
    context: Parameters<SemanticSeedStrategy["seedBlocks"]>[0]["context"]
  ) => SemanticSeededBlock
> = {
  "portfolio.hero": seedHero,
  "portfolio.about": seedAbout,
  "portfolio.experience": seedExperience,
  "portfolio.work": seedWork,
  "portfolio.contact": seedContact,
};

export const portfolioCommunitySemanticStrategy: SemanticSeedStrategy = {
  slug: "portfolio-community",
  seedBlocks({ blockDefs, context }) {
    return blockDefs.map((blockDef) => {
      const seedBlock = portfolioCommunityBlockSeeders[blockDef.blockType];

      if (!seedBlock) {
        return withSourceMeta(
          blockDef,
          asRecord(blockDef.defaultConfig),
          {
            visible: true,
            resolvedFrom: [],
          }
        );
      }

      return seedBlock(blockDef, context);
    });
  },
};
