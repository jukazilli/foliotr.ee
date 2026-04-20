import type { TemplateBlockDef } from "@/generated/prisma-client";
import { derivePortfolioCommunitySemantics } from "@/lib/templates/portfolio-community-semantics";
import type { SemanticSeedStrategy, SemanticSeededBlock } from "@/lib/templates/semantic/types";

function asRecord(value: unknown) {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function readImageAlt(value: unknown, fallback: string) {
  const record = asRecord(value);
  return typeof record.alt === "string" && record.alt.trim() ? record.alt : fallback;
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

const portfolioCommunityBlockSeeders: Record<
  string,
  (
    blockDef: TemplateBlockDef,
    context: Parameters<SemanticSeedStrategy["seedBlocks"]>[0]["context"]
  ) => SemanticSeededBlock
> = {
  "portfolio.hero": (blockDef, context) => {
    const semantics = derivePortfolioCommunitySemantics({
      profile: context.profile,
      version: context.version,
      blockConfigs: {
        "portfolio.hero": asRecord(blockDef.defaultConfig),
      },
    });

    return withSourceMeta(
      blockDef,
      {
        ...asRecord(blockDef.defaultConfig),
        name: semantics.hero.displayName,
        headline: semantics.hero.headline,
        locationLine: semantics.hero.locationLine,
        ctaHref: semantics.hero.ctaHref,
        ctaLabel: semantics.hero.ctaLabel,
        portrait: semantics.hero.portrait,
      },
      {
        visible: semantics.hero.visible,
        resolvedFrom: [
          { target: "name", slot: "profile.displayName", source: "profile.displayName" },
          {
            target: "headline",
            slot: "version.headline",
            source: context.version.customHeadline
              ? "version.customHeadline"
              : "profile.headline",
          },
          {
            target: "portrait",
            slot: "profile.avatar",
            source: context.profile.avatarUrl ? "profile.avatarUrl" : "template.default",
          },
          { target: "ctaHref", slot: "hero.resumeHref", source: "derived.username.resume" },
        ],
      }
    );
  },
  "portfolio.about": (blockDef, context) => {
    const semantics = derivePortfolioCommunitySemantics({
      profile: context.profile,
      version: context.version,
      blockConfigs: {
        "portfolio.about": asRecord(blockDef.defaultConfig),
      },
    });

    return withSourceMeta(
      blockDef,
      {
        ...asRecord(blockDef.defaultConfig),
        title: semantics.about.title,
        body: semantics.about.body,
      },
      {
        visible: semantics.about.visible,
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
  },
  "portfolio.education": (blockDef, context) => {
    const semantics = derivePortfolioCommunitySemantics({
      profile: context.profile,
      version: context.version,
      blockConfigs: {
        "portfolio.education": asRecord(blockDef.defaultConfig),
      },
    });

    return withSourceMeta(
      blockDef,
      {
        ...asRecord(blockDef.defaultConfig),
        title: semantics.education.title,
      },
      {
        visible: semantics.education.visible,
        resolvedFrom: [
          {
            target: "items",
            slot: "education.items",
            source:
              context.version.educations.length > 0
                ? "version.educations"
                : "profile.educations",
          },
        ],
      }
    );
  },
  "portfolio.experience": (blockDef, context) => {
    const semantics = derivePortfolioCommunitySemantics({
      profile: context.profile,
      version: context.version,
      blockConfigs: {
        "portfolio.experience": asRecord(blockDef.defaultConfig),
      },
    });

    return withSourceMeta(
      blockDef,
      {
        ...asRecord(blockDef.defaultConfig),
        title: semantics.experience.title,
        maxItems: semantics.experience.maxItems,
      },
      {
        visible: semantics.experience.visible,
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
  },
  "portfolio.work": (blockDef, context) => {
    const semantics = derivePortfolioCommunitySemantics({
      profile: context.profile,
      version: context.version,
      blockConfigs: {
        "portfolio.work": asRecord(blockDef.defaultConfig),
      },
    });

    return withSourceMeta(
      blockDef,
      {
        ...asRecord(blockDef.defaultConfig),
        title: semantics.work.title,
        intro: semantics.work.intro,
        maxItems: semantics.work.maxItems,
        fallbackProjects: semantics.work.fallbackProjects,
      },
      {
        visible: semantics.work.visible,
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
  },
  "portfolio.contact": (blockDef, context) => {
    const semantics = derivePortfolioCommunitySemantics({
      profile: context.profile,
      version: context.version,
      blockConfigs: {
        "portfolio.contact": asRecord(blockDef.defaultConfig),
      },
    });

    return withSourceMeta(
      blockDef,
      {
        ...asRecord(blockDef.defaultConfig),
        title: semantics.contact.title,
        body: semantics.contact.body,
        image: semantics.contact.supportImage
          ? {
              src: semantics.contact.supportImage,
              alt: readImageAlt(blockDef.defaultConfig, "Contact support image"),
            }
          : asRecord(blockDef.defaultConfig).image,
        links: semantics.contact.links,
      },
      {
        visible: semantics.contact.visible,
        resolvedFrom: [
          {
            target: "links",
            slot: "contact.links",
            source: semantics.contact.links.some((item) => item.type === "proof")
              ? "profile.links + profile.proofs"
              : semantics.contact.links.some((item) => item.type === "profileLink")
                ? "profile.links"
                : "template.default",
          },
          {
            target: "image",
            slot: "contact.supportImage",
            source: semantics.contact.supportImage
              ? "profile.proofs.imageUrl"
              : "template.default",
            fallbackUsed: !semantics.contact.supportImage,
          },
        ],
      }
    );
  },
};

export const portfolioCommunitySemanticStrategy: SemanticSeedStrategy = {
  slug: "portfolio-community",
  seedBlocks({ blockDefs, context }) {
    return blockDefs.map((blockDef) => {
      const seedBlock = portfolioCommunityBlockSeeders[blockDef.blockType];

      if (!seedBlock) {
        return withSourceMeta(blockDef, asRecord(blockDef.defaultConfig), {
          visible: true,
          resolvedFrom: [],
        });
      }

      return seedBlock(blockDef, context);
    });
  },
};
