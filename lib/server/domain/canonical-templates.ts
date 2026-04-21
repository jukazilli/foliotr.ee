import type { PrismaClient } from "@/generated/prisma-client";
import {
  canonicalTemplateEligibilitySchema,
  canonicalTemplateRestrictionsSchema,
  canonicalTemplateResumeDefaultsSchema,
  type CanonicalTemplateEligibility,
} from "@/lib/templates/manifest";
import { templateListInclude, type TemplateListItem } from "@/lib/server/domain/templates";
import type { VersionAggregate } from "@/lib/server/domain/includes";

type DbClient = PrismaClient;
type ReadonlyTemplateEligibility = Omit<CanonicalTemplateEligibility, "requiredProfileFields"> & {
  readonly requiredProfileFields: readonly CanonicalTemplateEligibility["requiredProfileFields"][number][];
};

export interface TemplateEligibilityIssue {
  key: string;
  label: string;
  description: string;
}

export interface TemplateEligibilityResult {
  eligible: boolean;
  completed: number;
  total: number;
  issues: TemplateEligibilityIssue[];
}

type EligibilityProfile = {
  displayName?: string | null;
  headline?: string | null;
  bio?: string | null;
  avatarUrl?: string | null;
  user?: {
    name?: string | null;
  } | null;
  experiences: Array<{ id: string }>;
  projects: Array<{ id: string }>;
  links: Array<{ id: string }>;
  proofs: Array<{ id: string }>;
};

function asRecord(value: unknown) {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function countSelected(total: number, selectedIds: string[] | undefined) {
  if (!selectedIds || selectedIds.length === 0) return total;
  return selectedIds.length;
}

function hasText(value: string | null | undefined) {
  return Boolean(value && value.trim());
}

function parseEligibility(value: unknown) {
  return canonicalTemplateEligibilitySchema.parse(asRecord(value));
}

export function readTemplateResumeDefaults(value: unknown) {
  return canonicalTemplateResumeDefaultsSchema.parse(asRecord(value));
}

function parseRestrictions(value: unknown) {
  return canonicalTemplateRestrictionsSchema.parse(asRecord(value));
}

export interface CanonicalTemplateListItem extends TemplateListItem {
  category: string;
  tags: string[];
  libraryStatus: "available" | "editor-ready" | "paused";
  origin: string | null;
  summary: string;
  detail: string;
  sortOrder: number;
  coverUrl: string;
  referenceUrl: string | null;
  detailHref: string;
  useHref: string;
  editorReady: boolean;
  isCanonical: true;
  eligibility: CanonicalTemplateEligibility;
  resumeDefaults: ReturnType<typeof readTemplateResumeDefaults>;
  restrictions: ReturnType<typeof parseRestrictions>;
}

function hydrateCanonicalTemplate(template: TemplateListItem): CanonicalTemplateListItem {
  const eligibility = parseEligibility(template.eligibility);
  const resumeDefaults = readTemplateResumeDefaults(template.resumeDefaults);
  const restrictions = parseRestrictions(template.restrictions);
  const category = template.category?.trim() || "general";
  const tags = Array.isArray(template.tags) ? template.tags : [];
  const libraryStatus =
    template.libraryStatus === "editor-ready" ||
    template.libraryStatus === "paused" ||
    template.libraryStatus === "available"
      ? template.libraryStatus
      : "available";

  return {
    ...template,
    category,
    tags,
    libraryStatus,
    origin: template.origin ?? null,
    summary: template.summary?.trim() || template.description?.trim() || "",
    detail: template.detail?.trim() || template.description?.trim() || "",
    sortOrder: template.sortOrder ?? 0,
    coverUrl: template.coverUrl ?? template.thumbnail ?? "",
    referenceUrl: template.referenceUrl ?? null,
    detailHref: `/templates/${template.slug}`,
    useHref: `/templates/${template.slug}`,
    editorReady: libraryStatus === "editor-ready" || libraryStatus === "available",
    isCanonical: true as const,
    eligibility,
    resumeDefaults,
    restrictions,
  };
}

export function evaluateTemplateEligibility(
  source: ReadonlyTemplateEligibility | Pick<CanonicalTemplateListItem, "eligibility">,
  profile: EligibilityProfile,
  version?: VersionAggregate | null
): TemplateEligibilityResult {
  const eligibility = "eligibility" in source ? source.eligibility : source;
  const issues: TemplateEligibilityIssue[] = [];

  const displayName = profile.displayName ?? profile.user?.name ?? null;
  const headline = version?.customHeadline ?? profile.headline ?? null;
  const bio = version?.customBio ?? profile.bio ?? null;

  if (eligibility.requiredProfileFields.includes("displayName") && !hasText(displayName)) {
    issues.push({
      key: "displayName",
      label: "Nome publico",
      description: "Defina um nome de exibicao para o template.",
    });
  }

  if (eligibility.requiredProfileFields.includes("headline") && !hasText(headline)) {
    issues.push({
      key: "headline",
      label: "Headline",
      description: "Adicione uma headline clara para abrir o portfolio.",
    });
  }

  if (eligibility.requiredProfileFields.includes("bio") && !hasText(bio)) {
    issues.push({
      key: "bio",
      label: "Sobre",
      description: "Preencha a bio base para alimentar a narrativa do template.",
    });
  }

  if (eligibility.requiresAvatar && !hasText(profile.avatarUrl)) {
    issues.push({
      key: "avatarUrl",
      label: "Imagem de perfil",
      description: "Envie uma foto ou retrato para o hero principal.",
    });
  }

  const experienceCount = countSelected(
    profile.experiences.length,
    version?.experiences.map((item) => item.experienceId)
  );
  const projectCount = countSelected(
    profile.projects.length,
    version?.projects.map((item) => item.projectId)
  );
  const linkCount = countSelected(
    profile.links.length,
    version?.links.map((item) => item.linkId)
  );
  const proofCount = countSelected(
    profile.proofs.length,
    version?.proofs.map((item) => item.proofId)
  );

  if (experienceCount < eligibility.minExperienceItems) {
    issues.push({
      key: "experiences",
      label: "Experiencias",
      description: `Adicione pelo menos ${eligibility.minExperienceItems} experiencias.`,
    });
  }

  if (projectCount < eligibility.minProjectItems) {
    issues.push({
      key: "projects",
      label: "Projetos",
      description: `Adicione pelo menos ${eligibility.minProjectItems} projetos.`,
    });
  }

  if (experienceCount + projectCount < eligibility.minExperienceOrProjectItems) {
    issues.push({
      key: "experienceOrProject",
      label: "Experiencias ou projetos",
      description: `Garanta pelo menos ${eligibility.minExperienceOrProjectItems} experiencia ou projeto para preencher a area central do template.`,
    });
  }

  if (linkCount < eligibility.minLinkItems) {
    issues.push({
      key: "links",
      label: "Links",
      description: `Adicione pelo menos ${eligibility.minLinkItems} links publicos para a secao de contato.`,
    });
  }

  if (proofCount < eligibility.minProofItems) {
    issues.push({
      key: "proofs",
      label: "Provas",
      description: `Adicione pelo menos ${eligibility.minProofItems} provas publicas.`,
    });
  }

  if (linkCount + proofCount < eligibility.minLinkOrProofItems) {
    issues.push({
      key: "linksOrProofs",
      label: "Links ou provas",
      description: `Garanta pelo menos ${eligibility.minLinkOrProofItems} links ou provas publicas.`,
    });
  }

  const total = issues.length + 1;
  return {
    eligible: issues.length === 0,
    completed: issues.length === 0 ? total : Math.max(total - issues.length, 0),
    total,
    issues,
  };
}

export async function listCanonicalTemplates(
  db: DbClient
): Promise<CanonicalTemplateListItem[]> {
  const templates = await db.template.findMany({
    where: { isActive: true },
    include: templateListInclude,
    orderBy: [{ sortOrder: "asc" }, { slug: "asc" }],
  });

  return templates.map(hydrateCanonicalTemplate);
}

export async function getCanonicalTemplateBySlug(
  db: DbClient,
  slug: string
): Promise<CanonicalTemplateListItem | null> {
  const template = await db.template.findUnique({
    where: { slug },
    include: templateListInclude,
  });

  if (!template || !template.isActive) return null;

  return hydrateCanonicalTemplate(template);
}
