import type { TemplateBlockDef } from "@/generated/prisma-client";
import type {
  RenderablePageBlock,
  TemplateProfile,
} from "@/components/templates/types";
import type { VersionForBlocks } from "@/components/blocks/types";
import type { ProfileAggregate, VersionAggregate } from "@/lib/server/domain/includes";
import { getPlatformLabel, getPlatformUrl } from "@/lib/utils";
import type { PortfolioCommunitySourcePackage } from "@/lib/templates/source-package";
import { normalizeStoragePublicUrl } from "@/lib/storage/public-url";

type PortfolioCommunityBlockType =
  | "portfolio.hero"
  | "portfolio.about"
  | "portfolio.education"
  | "portfolio.experience"
  | "portfolio.work"
  | "portfolio.contact"
  | "portfolio.custom-section";

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

export interface PortfolioCommunityEducationItem {
  id: string;
  institution: string;
  degree: string;
  field: string;
  description: string;
  current: boolean;
  period: string;
  startDate: Date | string | null;
  endDate: Date | string | null;
}

export interface PortfolioCommunityWorkItem {
  key: string;
  projectId?: string;
  source: "project" | "fallback";
  title: string;
  description: string;
  date: string;
  image: string;
  href: string;
  imageValue?: PortfolioCommunityImageValue | null;
  imageConfigPath?: string;
}

export interface PortfolioCommunityImageValue {
  src: string;
  alt: string;
  fitMode: "fit" | "fill" | "crop";
  positionX: number;
  positionY: number;
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
    portrait: PortfolioCommunityImageValue | null;
    showSocialIcons: boolean;
    showPlusCluster: boolean;
    showSlashMarks: boolean;
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
  education: {
    visible: boolean;
    title: string;
    items: PortfolioCommunityEducationItem[];
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
      hidden?: boolean;
    }>;
  };
  contact: {
    visible: boolean;
    title: string;
    body: string;
    publicEmail: string;
    supportImage: PortfolioCommunityImageValue | null;
    links: PortfolioCommunityLink[];
    displayLinks: string[];
  };
  customSections: Array<{
    id: string;
    visible: boolean;
    title: string;
    body: string;
    image: PortfolioCommunityImageValue | null;
    imageAlign: "left" | "center" | "right";
    listItems: Array<{ text: string }>;
  }>;
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

function asArray(value: unknown) {
  return Array.isArray(value) ? value : [];
}

function readStringArray(value: unknown) {
  return asArray(value).filter(
    (item): item is string => typeof item === "string" && item.trim().length > 0
  );
}

function readString(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function readNumber(value: unknown, fallback: number) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function clampPercentage(value: unknown, fallback: number) {
  const resolved =
    typeof value === "number" && Number.isFinite(value) ? value : fallback;
  return Math.min(100, Math.max(0, resolved));
}

function readBoolean(value: unknown) {
  return typeof value === "boolean" ? value : undefined;
}

function readImage(value: unknown): PortfolioCommunityImageValue | null {
  const image = asRecord(value);
  const src = readString(image.src);

  if (!src) return null;

  const fitMode =
    image.fitMode === "fit" || image.fitMode === "fill" || image.fitMode === "crop"
      ? image.fitMode
      : "fill";

  return {
    src: normalizeStoragePublicUrl(src),
    alt: readString(image.alt),
    fitMode,
    positionX: clampPercentage(image.positionX, 50),
    positionY: clampPercentage(image.positionY, 50),
  };
}

function readImageAlign(value: unknown): "left" | "center" | "right" {
  return value === "left" || value === "right" || value === "center" ? value : "center";
}

function createDefaultImageValue(
  src: string,
  alt: string
): PortfolioCommunityImageValue {
  return {
    src,
    alt,
    fitMode: "fill",
    positionX: 50,
    positionY: 50,
  };
}

function readProjectCoverImage(project: {
  title: string;
  imageUrl?: string | null;
  coverFitMode?: string | null;
  coverPositionX?: number | null;
  coverPositionY?: number | null;
}): PortfolioCommunityImageValue | null {
  if (!project.imageUrl) return null;

  const fitMode =
    project.coverFitMode === "fit" ||
    project.coverFitMode === "fill" ||
    project.coverFitMode === "crop"
      ? project.coverFitMode
      : "crop";

  return {
    src: normalizeStoragePublicUrl(project.imageUrl),
    alt: project.title,
    fitMode,
    positionX: clampPercentage(project.coverPositionX, 50),
    positionY: clampPercentage(project.coverPositionY, 50),
  };
}

function readProjectCoverOverride(config: Record<string, unknown>, projectId: string) {
  const projectCovers = asRecord(config.projectCovers);
  const override = asRecord(projectCovers[projectId]);
  return readImage(override.image);
}

function hasText(value: string | null | undefined) {
  return typeof value === "string" && value.trim().length > 0;
}

function formatLocationLine(location: string | null | undefined) {
  return location ? `com base em ${location}.` : "";
}

function formatYear(value: Date | string | null | undefined) {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return String(date.getUTCFullYear());
}

function formatPeriod(
  startDate: Date | string | null | undefined,
  endDate: Date | string | null | undefined,
  current: boolean
) {
  const start = formatYear(startDate);
  const end = current ? "Atual" : formatYear(endDate);
  return [start, end].filter(Boolean).join(" - ");
}

function formatProjectDate(value: Date | string | null | undefined, fallback: string) {
  if (!value) return fallback;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return fallback;
  return date.toLocaleDateString("pt-BR", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
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
      blockDef.blockType === "portfolio.education" ||
      blockDef.blockType === "portfolio.experience" ||
      blockDef.blockType === "portfolio.work" ||
      blockDef.blockType === "portfolio.contact" ||
      blockDef.blockType === "portfolio.custom-section"
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
      block.blockType === "portfolio.education" ||
      block.blockType === "portfolio.experience" ||
      block.blockType === "portfolio.work" ||
      block.blockType === "portfolio.contact" ||
      block.blockType === "portfolio.custom-section"
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
  const educationConfig = args.blockConfigs?.["portfolio.education"] ?? {};
  const experienceConfig = args.blockConfigs?.["portfolio.experience"] ?? {};
  const workConfig = args.blockConfigs?.["portfolio.work"] ?? {};
  const contactConfig = args.blockConfigs?.["portfolio.contact"] ?? {};
  const customSectionConfigs = Object.entries(args.blockConfigs ?? {})
    .filter(([key]) => key === "portfolio.custom-section")
    .map(([, value]) => asRecord(value));

  const selectedExperiences = getSelectedByIds(
    profile.experiences,
    getSelectedIds(version, "selectedExperienceIds", "experiences", "experienceId")
  );
  const selectedEducations = getSelectedByIds(
    profile.educations,
    getSelectedIds(version, "selectedEducationIds", "educations", "educationId")
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
    readString(profile.displayName) ||
    readString(profile.user?.name) ||
    readString(profile.user?.username);
  const headline =
    readString(
      version && "customHeadline" in version ? version.customHeadline : undefined
    ) ||
    profile.headline ||
    readString(heroConfig.headline) ||
    "Designer de Produto";
  const body =
    readString(
      version && "presentation" in version
        ? (version.presentation as { body?: unknown } | null | undefined)?.body
        : undefined
    ) ||
    readString(version && "customBio" in version ? version.customBio : undefined) ||
    readString(
      profile.presentations?.find((item) => item.id === profile.defaultPresentationId)
        ?.body
    ) ||
    profile.bio ||
    readString(aboutConfig.body);
  const portrait =
    readImage(heroConfig.portrait) ??
    (profile.avatarUrl
      ? createDefaultImageValue(
          normalizeStoragePublicUrl(profile.avatarUrl),
          displayName || "Foto de perfil"
        )
      : args.sourcePackage?.imports.default.imgUnsplashD1UPkiFd04A1
        ? createDefaultImageValue(
            args.sourcePackage.imports.default.imgUnsplashD1UPkiFd04A1,
            displayName || "Foto de perfil"
          )
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
    ...asArray(contactConfig.links).flatMap((item) => {
      const record = asRecord(item);
      if (
        typeof record.label !== "string" ||
        !record.label.trim() ||
        typeof record.href !== "string" ||
        !record.href.trim()
      ) {
        return [];
      }

      return [
        {
          label: record.label.trim(),
          href: record.href.trim(),
          type: "contact" as const,
        },
      ];
    }),
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
      experience.description?.trim() || `${experience.role} na ${experience.company}.`,
    location: experience.location ?? "",
    current: experience.current,
    period: formatPeriod(experience.startDate, experience.endDate, experience.current),
    startDate: experience.startDate,
    endDate: experience.endDate,
  }));
  const educationItems = selectedEducations.map((education) => ({
    id: education.id,
    institution: education.institution,
    degree: education.degree ?? "",
    field: education.field ?? "",
    description:
      education.description?.trim() ||
      [education.degree, education.field, education.institution]
        .filter(Boolean)
        .join(" - "),
    current: education.current,
    period: formatPeriod(education.startDate, education.endDate, education.current),
    startDate: education.startDate,
    endDate: education.endDate,
  }));

  const hiddenProjectIds = new Set(readStringArray(workConfig.hiddenProjectIds));
  const visibleSelectedProjects = selectedProjects.filter(
    (project) => !hiddenProjectIds.has(project.id)
  );
  const minimumWorkItems = visibleSelectedProjects.length > 1 ? 2 : 1;
  const configuredWorkMaxItems = Math.max(
    minimumWorkItems,
    Math.min(readNumber(workConfig.maxItems, 2), 6)
  );
  const fallbackWorkItems = Array.isArray(workConfig.fallbackProjects)
    ? workConfig.fallbackProjects.map(asRecord)
    : [];
  const workFallbackImages = [
    args.sourcePackage?.imports.default.imgRectangle8 ?? "",
    args.sourcePackage?.imports.default.imgUnsplashUbIWo074QlU ?? "",
  ];
  const projectWorkItems = visibleSelectedProjects
    .slice(0, configuredWorkMaxItems)
    .map((project, index): PortfolioCommunityWorkItem => {
      const projectImage =
        readProjectCoverOverride(workConfig, project.id) ??
        readProjectCoverImage(project);
      const fallbackImage = workFallbackImages[index] ?? "";
      const imageValue =
        projectImage ??
        (fallbackImage ? createDefaultImageValue(fallbackImage, project.title) : null);

      return {
        key: project.id,
        projectId: project.id,
        source: "project",
        title: project.title,
        description: project.description ?? "",
        date: formatProjectDate(project.startDate, "24 de novembro de 2019"),
        image: imageValue?.src ?? "",
        href: project.url ?? project.repoUrl ?? "",
        imageValue,
      };
    });
  const fallbackItems = fallbackWorkItems
    .slice(0, configuredWorkMaxItems)
    .map((fallback, index): PortfolioCommunityWorkItem | null => {
      if (readBoolean(fallback.hidden) === true) return null;
      const fallbackImage = readImage(fallback.image);

      return {
        key: `fallback-${index}`,
        source: "fallback",
        title: readString(fallback.title, "Projeto em destaque"),
        description: readString(
          fallback.description,
          "Resumo do projeto com contexto, abordagem e impacto gerado."
        ),
        date: readString(fallback.date, "24 de novembro de 2019"),
        image: fallbackImage?.src ?? workFallbackImages[index] ?? "",
        href: readString(fallback.href),
        imageValue: fallbackImage,
        imageConfigPath: `fallbackProjects.${index}.image`,
      };
    })
    .filter((item): item is PortfolioCommunityWorkItem => Boolean(item));
  const workItems = projectWorkItems.length > 0 ? projectWorkItems : fallbackItems;

  const selectedProofImageUrl = selectedProofs.find(
    (proof) => proof.imageUrl
  )?.imageUrl;
  const supportImage =
    readImage(contactConfig.image) ??
    (selectedProofImageUrl
      ? createDefaultImageValue(
          normalizeStoragePublicUrl(selectedProofImageUrl),
          "Imagem de apoio"
        )
      : undefined) ??
    (args.sourcePackage?.imports.default.imgUnsplash2Xht5D22Y0I
      ? createDefaultImageValue(
          args.sourcePackage.imports.default.imgUnsplash2Xht5D22Y0I,
          "Imagem de apoio"
        )
      : null);

  return {
    hero: {
      visible: readBoolean(args.visibility?.["portfolio.hero"]) ?? hasText(headline),
      displayName,
      firstName: displayName.split(" ")[0] ?? "",
      eyebrow: readString(heroConfig.eyebrow, "Ola, eu sou"),
      headline,
      locationLine:
        readString(heroConfig.locationLine) ||
        formatLocationLine(profile.location) ||
        "com base na sua cidade.",
      ctaHref: resolveResumeHref(
        readString(heroConfig.ctaHref, "/resume"),
        profile.user?.username
      ),
      ctaLabel: readString(heroConfig.ctaLabel, "Curriculo"),
      portrait,
      showSocialIcons: readBoolean(heroConfig.showSocialIcons) ?? true,
      showPlusCluster: readBoolean(heroConfig.showPlusCluster) ?? true,
      showSlashMarks: readBoolean(heroConfig.showSlashMarks) ?? true,
    },
    about: {
      visible: readBoolean(args.visibility?.["portfolio.about"]) ?? hasText(body),
      title: readString(aboutConfig.title, "sobre."),
      body,
    },
    experience: {
      visible:
        readBoolean(args.visibility?.["portfolio.experience"]) ??
        selectedExperiences.length > 0,
      title: readString(experienceConfig.title, "experiencia"),
      maxItems: Math.max(
        1,
        Math.min(
          experienceItems.length || readNumber(experienceConfig.maxItems, 3),
          readNumber(experienceConfig.maxItems, 3)
        )
      ),
      items: experienceItems.slice(0, readNumber(experienceConfig.maxItems, 3)),
    },
    education: {
      visible:
        readBoolean(args.visibility?.["portfolio.education"]) ??
        selectedEducations.length > 0,
      title: readString(educationConfig.title, "formacao"),
      items: educationItems,
    },
    work: {
      visible: readBoolean(args.visibility?.["portfolio.work"]) ?? workItems.length > 0,
      title: readString(workConfig.title, "projetos."),
      intro: readString(workConfig.intro),
      maxItems: Math.max(
        1,
        Math.min(workItems.length || configuredWorkMaxItems, configuredWorkMaxItems)
      ),
      items: workItems,
      fallbackProjects: visibleSelectedProjects
        .slice(0, configuredWorkMaxItems)
        .map((project) => {
          const projectImage =
            readProjectCoverOverride(workConfig, project.id) ??
            readProjectCoverImage(project);

          return {
            title: project.title,
            description: project.description ?? "",
            date: formatProjectDate(project.startDate, "Projeto em destaque"),
            href: project.url ?? project.repoUrl ?? undefined,
            image: projectImage
              ? {
                  src: projectImage.src,
                  alt: projectImage.alt || project.title,
                }
              : undefined,
          };
        }),
    },
    contact: {
      visible:
        readBoolean(args.visibility?.["portfolio.contact"]) ??
        Boolean(profile.publicEmail || contactLinks.length > 0),
      title: readString(contactConfig.title, "contato."),
      body: readString(contactConfig.body) || body,
      publicEmail: profile.publicEmail ?? "",
      supportImage,
      links: contactLinks,
      displayLinks: contactLinks.slice(0, 2).map((item) => item.label),
    },
    customSections: customSectionConfigs.map((config, index) => ({
      id: `custom-${index}`,
      visible: true,
      title: readString(config.title, "nova secao"),
      body: readString(config.body),
      image: readImage(config.image),
      imageAlign: readImageAlign(config.imageAlign),
      listItems: asArray(config.listItems)
        .map((item) => asRecord(item))
        .flatMap((item) =>
          typeof item.text === "string" && item.text.trim()
            ? [{ text: item.text.trim() }]
            : []
        ),
    })),
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
