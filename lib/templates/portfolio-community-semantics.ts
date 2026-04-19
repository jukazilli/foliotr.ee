import type { TemplateBlockDef } from "@/generated/prisma-client";
import type {
  RenderablePageBlock,
  TemplateProfile,
} from "@/components/templates/types";
import type { VersionForBlocks } from "@/components/blocks/types";
import type {
  ProfileAggregate,
  VersionAggregate,
} from "@/lib/server/domain/includes";
import {
  getPlatformLabel,
  getPlatformUrl,
} from "@/lib/utils";
import type { PortfolioCommunitySourcePackage } from "@/lib/templates/source-package";

type PortfolioCommunityBlockType =
  | "portfolio.hero"
  | "portfolio.about"
  | "portfolio.experience"
  | "portfolio.work"
  | "portfolio.contact";

type PortfolioProfileInput = TemplateProfile | ProfileAggregate;
type PortfolioVersionInput = VersionAggregate | VersionForBlocks | null | undefined;
type BlockConfigMap = Partial<
  Record<PortfolioCommunityBlockType, Record<string, unknown>>
>;
type BlockVisibilityMap = Partial<Record<PortfolioCommunityBlockType, boolean>>;

export interface PortfolioCommunityLink {
  label: string;
  href: string;
  type: "profileLink" | "proof" | "contact";
}

export interface PortfolioCommunityExperienceItem {
  id: string;
  company: string;
  role: string;
  description: string;
  location: string;
  current: boolean;
  period: string;
  startDate: Date | string | null;
  endDate: Date | string | null;
}

export interface PortfolioCommunityWorkItem {
  key: string;
  title: string;
  description: string;
  date: string;
  image: string;
  href: string;
}

export interface PortfolioCommunitySemantics {
  hero: {
    visible: boolean;
    displayName: string;
    firstName: string;
    eyebrow: string;
    headline: string;
    locationLine: string;
    ctaHref: string;
    ctaLabel: string;
    portrait: { src: string; alt: string } | null;
  };
  about: {
    visible: boolean;
    title: string;
    body: string;
  };
  experience: {
    visible: boolean;
    title: string;
    maxItems: number;
    items: PortfolioCommunityExperienceItem[];
  };
  work: {
    visible: boolean;
    title: string;
    intro: string;
    maxItems: number;
    items: PortfolioCommunityWorkItem[];
    fallbackProjects: Array<{
      title: string;
      description: string;
      date: string;
      href?: string;
      image?: { src: string; alt: string };
    }>;
  };
  contact: {
    visible: boolean;
    title: string;
    body: string;
    publicEmail: string;
    supportImage: string;
    links: PortfolioCommunityLink[];
    displayLinks: string[];
  };
  selections: {
    skills: Array<{ id: string; name: string; category: string | null }>;
    achievements: Array<{
      id: string;
      title: string;
      metric: string | null;
      description: string | null;
    }>;
  };
  header: {
    displayName: string;
    headline: string;
    location: string;
    publicEmail: string;
    phone: string;
    avatarUrl: string;
  };
}

function asRecord(value: unknown) {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function readString(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function readNumber(value: unknown, fallback: number) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function readBoolean(value: unknown) {
  return typeof value === "boolean" ? value : undefined;
}

function readImage(value: unknown) {
  const image = asRecord(value);
  const src = readString(image.src);

  if (!src) return null;

  return {
    src,
    alt: readString(image.alt),
  };
}

function hasText(value: string | null | undefined) {
  return typeof value === "string" && value.trim().length > 0;
}

function getFirstName(value: string) {
  return value.trim().split(/\s+/)[0] || value;
}

function formatLocationLine(location: string | null | undefined) {
  return location ? `based in ${location}.` : "";
}

function formatYear(value: Date | string | null | undefined) {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return String(date.getFullYear());
}

function formatPeriod(
  startDate: Date | string | null | undefined,
  endDate: Date | string | null | undefined,
  current: boolean
) {
  const start = formatYear(startDate);
  const end = current ? "Present" : formatYear(endDate);
  return [start, end].filter(Boolean).join(" - ");
}

function formatProjectDate(value: Date | string | null | undefined, fallback: string) {
  if (!value) return fallback;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return fallback;
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function dedupeLinks(links: PortfolioCommunityLink[]) {
  const seen = new Set<string>();
  return links.filter((link) => {
    const key = `${link.type}:${link.label}:${link.href}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function getSelectedIds(
  version: PortfolioVersionInput,
  explicitKey: keyof VersionForBlocks,
  relationKey: keyof VersionAggregate,
  relationIdKey: string
) {
  if (!version) return [];

  const explicit = (version as Record<string, unknown>)[explicitKey as string];
  if (Array.isArray(explicit) && explicit.every((item) => typeof item === "string")) {
    return explicit as string[];
  }

  const relation = (version as Record<string, unknown>)[relationKey as string];
  if (!Array.isArray(relation)) return [];

  return relation
    .map((item) => asRecord(item)[relationIdKey])
    .filter((item): item is string => typeof item === "string" && item.length > 0);
}

function getSelectedByIds<T extends { id: string; order?: number | null }>(
  items: T[],
  ids: string[]
) {
  if (!ids.length) {
    return [...items].sort((left, right) => (left.order ?? 0) - (right.order ?? 0));
  }

  const idSet = new Set(ids);
  return [...items]
    .filter((item) => idSet.has(item.id))
    .sort((left, right) => (left.order ?? 0) - (right.order ?? 0));
}

function resolveResumeHref(value: string, username?: string | null) {
  if (value === "/resume" && username) return `/${username}/resume`;
  return value;
}

export function buildPortfolioCommunityBlockStateFromDefs(
  blockDefs: Array<Pick<TemplateBlockDef, "blockType" | "defaultConfig">>
) {
  const configs: BlockConfigMap = {};

  for (const blockDef of blockDefs) {
    if (
      blockDef.blockType === "portfolio.hero" ||
      blockDef.blockType === "portfolio.about" ||
      blockDef.blockType === "portfolio.experience" ||
      blockDef.blockType === "portfolio.work" ||
      blockDef.blockType === "portfolio.contact"
    ) {
      configs[blockDef.blockType] = asRecord(blockDef.defaultConfig);
    }
  }

  return {
    configs,
    visibility: {},
  };
}

export function buildPortfolioCommunityBlockStateFromBlocks(
  blocks: RenderablePageBlock[]
) {
  const configs: BlockConfigMap = {};
  const visibility: BlockVisibilityMap = {};

  for (const block of blocks) {
    if (
      block.blockType === "portfolio.hero" ||
      block.blockType === "portfolio.about" ||
      block.blockType === "portfolio.experience" ||
      block.blockType === "portfolio.work" ||
      block.blockType === "portfolio.contact"
    ) {
      configs[block.blockType] = asRecord(block.config);
      visibility[block.blockType] = block.visible;
    }
  }

  return {
    configs,
    visibility,
  };
}

export function derivePortfolioCommunitySemantics(args: {
  profile: PortfolioProfileInput;
  version?: PortfolioVersionInput;
  blockConfigs?: BlockConfigMap;
  visibility?: BlockVisibilityMap;
  sourcePackage?: PortfolioCommunitySourcePackage | null;
}) {
  const profile = args.profile;
  const version = args.version;
  const heroConfig = args.blockConfigs?.["portfolio.hero"] ?? {};
  const aboutConfig = args.blockConfigs?.["portfolio.about"] ?? {};
  const experienceConfig = args.blockConfigs?.["portfolio.experience"] ?? {};
  const workConfig = args.blockConfigs?.["portfolio.work"] ?? {};
  const contactConfig = args.blockConfigs?.["portfolio.contact"] ?? {};

  const selectedExperiences = getSelectedByIds(
    profile.experiences,
    getSelectedIds(version, "selectedExperienceIds", "experiences", "experienceId")
  );
  const selectedProjects = getSelectedByIds(
    profile.projects,
    getSelectedIds(version, "selectedProjectIds", "projects", "projectId")
  );
  const selectedSkills = getSelectedByIds(
    profile.skills,
    getSelectedIds(version, "selectedSkillIds", "skills", "skillId")
  );
  const selectedAchievements = getSelectedByIds(
    profile.achievements,
    getSelectedIds(version, "selectedAchievementIds", "achievements", "achievementId")
  );
  const selectedProofs = getSelectedByIds(
    profile.proofs ?? [],
    getSelectedIds(version, "selectedProofIds", "proofs", "proofId")
  );
  const selectedLinks = getSelectedByIds(
    profile.links,
    getSelectedIds(version, "selectedLinkIds", "links", "linkId")
  );

  const displayName =
    profile.displayName ??
    profile.user?.name ??
    readString(heroConfig.name) ??
    "";
  const headline =
    readString(version && "customHeadline" in version ? version.customHeadline : undefined) ||
    profile.headline ||
    readString(heroConfig.headline) ||
    "Product Designer";
  const body =
    readString(version && "customBio" in version ? version.customBio : undefined) ||
    profile.bio ||
    readString(aboutConfig.body);
  const portrait =
    readImage(heroConfig.portrait) ??
    (profile.avatarUrl
      ? { src: profile.avatarUrl, alt: displayName || "Profile portrait" }
      : args.sourcePackage?.imports.default.imgUnsplashD1UPkiFd04A1
        ? {
            src: args.sourcePackage.imports.default.imgUnsplashD1UPkiFd04A1,
            alt: displayName || "Profile portrait",
          }
        : null);
  const contactLinks = dedupeLinks([
    ...(profile.publicEmail
      ? [
          {
            label: profile.publicEmail,
            href: `mailto:${profile.publicEmail}`,
            type: "contact" as const,
          },
        ]
      : []),
    ...selectedLinks.map((link) => ({
      label: link.label?.trim() ? link.label : getPlatformLabel(link.platform),
      href: getPlatformUrl(link.platform, link.url),
      type: "profileLink" as const,
    })),
    ...selectedProofs
      .filter((proof) => typeof proof.url === "string" && proof.url.trim().length > 0)
      .map((proof) => ({
        label: proof.metric?.trim() ? `${proof.title} - ${proof.metric}` : proof.title,
        href: proof.url as string,
        type: "proof" as const,
      })),
  ]);

  const experienceItems = selectedExperiences.map((experience) => ({
    id: experience.id,
    company: experience.company,
    role: experience.role,
    description:
      experience.description?.trim() || `${experience.role} at ${experience.company}.`,
    location: experience.location ?? "",
    current: experience.current,
    period: formatPeriod(experience.startDate, experience.endDate, experience.current),
    startDate: experience.startDate,
    endDate: experience.endDate,
  }));

  const fallbackWorkItems = Array.isArray(workConfig.fallbackProjects)
    ? workConfig.fallbackProjects.map(asRecord)
    : [];
  const workFallbackImages = [
    args.sourcePackage?.imports.default.imgRectangle8 ?? "",
    args.sourcePackage?.imports.default.imgUnsplashUbIWo074QlU ?? "",
  ];
  const workItems = Array.from({ length: 2 }, (_, index) => {
    const project = selectedProjects[index];
    const fallback = fallbackWorkItems[index] ?? {};

    if (project) {
      return {
        key: project.id,
        title: project.title,
        description: project.description ?? "",
        date: formatProjectDate(project.startDate, "November 24, 2019"),
        image: project.imageUrl ?? workFallbackImages[index] ?? "",
        href: project.url ?? project.repoUrl ?? "",
      };
    }

    return {
      key: `fallback-${index}`,
      title: readString(fallback.title, "Some Case Study"),
      description: readString(
        fallback.description,
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut sed aliquam sollicitudin rhoncus morbi."
      ),
      date: readString(fallback.date, "November 24, 2019"),
      image: readImage(fallback.image)?.src ?? workFallbackImages[index] ?? "",
      href: readString(fallback.href),
    };
  });

  const supportImage =
    readImage(contactConfig.image)?.src ??
    selectedProofs.find((proof) => proof.imageUrl)?.imageUrl ??
    args.sourcePackage?.imports.default.imgUnsplash2Xht5D22Y0I ??
    "";

  return {
    hero: {
      visible:
        readBoolean(args.visibility?.["portfolio.hero"]) ??
        (hasText(displayName) || hasText(headline)),
      displayName,
      firstName: getFirstName(displayName || "John Doe"),
      eyebrow: readString(heroConfig.eyebrow, "Hello, I'm"),
      headline,
      locationLine:
        readString(heroConfig.locationLine) ||
        formatLocationLine(profile.location) ||
        "based in Netherland.",
      ctaHref: resolveResumeHref(
        readString(heroConfig.ctaHref, "/resume"),
        profile.user?.username
      ),
      ctaLabel: readString(heroConfig.ctaLabel, "Resume"),
      portrait,
    },
    about: {
      visible: readBoolean(args.visibility?.["portfolio.about"]) ?? hasText(body),
      title: readString(aboutConfig.title, "about."),
      body,
    },
    experience: {
      visible:
        readBoolean(args.visibility?.["portfolio.experience"]) ??
        selectedExperiences.length > 0,
      title: readString(experienceConfig.title, "Experience"),
      maxItems: Math.max(
        1,
        Math.min(
          experienceItems.length || readNumber(experienceConfig.maxItems, 3),
          readNumber(experienceConfig.maxItems, 3)
        )
      ),
      items: experienceItems.slice(0, readNumber(experienceConfig.maxItems, 3)),
    },
    work: {
      visible:
        readBoolean(args.visibility?.["portfolio.work"]) ??
        selectedProjects.length > 0,
      title: readString(workConfig.title, "work."),
      intro: readString(workConfig.intro),
      maxItems:
        selectedProjects.length > 0
          ? Math.min(selectedProjects.length, readNumber(workConfig.maxItems, 2))
          : readNumber(workConfig.maxItems, 2),
      items: workItems,
      fallbackProjects: selectedProjects.slice(0, 2).map((project) => ({
        title: project.title,
        description: project.description ?? "",
        date: formatProjectDate(project.startDate, "Featured work"),
        href: project.url ?? project.repoUrl ?? undefined,
        image: project.imageUrl
          ? {
              src: project.imageUrl,
              alt: project.title,
            }
          : undefined,
      })),
    },
    contact: {
      visible:
        readBoolean(args.visibility?.["portfolio.contact"]) ??
        Boolean(profile.publicEmail || contactLinks.length > 0),
      title: readString(contactConfig.title, "contact."),
      body:
        readString(contactConfig.body) ||
        body,
      publicEmail: profile.publicEmail ?? "",
      supportImage,
      links: contactLinks,
      displayLinks: contactLinks.slice(0, 2).map((item) => item.label),
    },
    selections: {
      skills: selectedSkills.map((skill) => ({
        id: skill.id,
        name: skill.name,
        category: skill.category ?? null,
      })),
      achievements: selectedAchievements.map((achievement) => ({
        id: achievement.id,
        title: achievement.title,
        metric: achievement.metric ?? null,
        description: achievement.description ?? null,
      })),
    },
    header: {
      displayName,
      headline,
      location: profile.location ?? "",
      publicEmail: profile.publicEmail ?? "",
      phone: profile.phone ?? "",
      avatarUrl: portrait?.src ?? "",
    },
  } satisfies PortfolioCommunitySemantics;
}
