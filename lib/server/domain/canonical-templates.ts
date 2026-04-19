import { copyFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { Prisma, PrismaClient } from "@prisma/client";
import {
  getCanonicalTemplateManifest,
  listCanonicalTemplateManifests,
} from "@/lib/templates/registry";
import {
  resolveCanonicalTemplateAssetPath,
  type CanonicalTemplateManifest,
} from "@/lib/templates/manifest";
import { templateListInclude, type TemplateListItem } from "@/lib/server/domain/templates";
import type { VersionAggregate } from "@/lib/server/domain/includes";

type DbClient = PrismaClient;
let canonicalTemplateSyncPromise: Promise<void> | null = null;

function asInputJsonValue(value: unknown): Prisma.InputJsonValue {
  return value as Prisma.InputJsonValue;
}

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

export interface CanonicalTemplateListItem extends TemplateListItem {
  category: string;
  tags: string[];
  libraryStatus: CanonicalTemplateManifest["library"]["status"];
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
}

function createTemplateAssetUrl(
  manifest: CanonicalTemplateManifest,
  asset: "cover" | "reference"
) {
  const assetFile = manifest.assets[asset];
  if (!assetFile) return null;

  return `/template-assets/${manifest.slug}/${path.basename(assetFile)}`;
}

async function ensureCanonicalTemplatePublicAssets(
  manifest: CanonicalTemplateManifest
) {
  const outputDir = path.join(
    process.cwd(),
    "public",
    "template-assets",
    manifest.slug
  );

  await mkdir(outputDir, { recursive: true });

  const coverSource = resolveCanonicalTemplateAssetPath(manifest, "cover");
  const referenceSource = resolveCanonicalTemplateAssetPath(manifest, "reference");

  if (coverSource) {
    await copyFile(
      coverSource,
      path.join(outputDir, path.basename(manifest.assets.cover))
    );
  }

  if (referenceSource && manifest.assets.reference) {
    await copyFile(
      referenceSource,
      path.join(outputDir, path.basename(manifest.assets.reference))
    );
  }
}

function countSelected(total: number, selectedIds: string[] | undefined) {
  if (!selectedIds || selectedIds.length === 0) return total;
  return selectedIds.length;
}

function hasText(value: string | null | undefined) {
  return Boolean(value && value.trim());
}

export function evaluateTemplateEligibility(
  manifest: CanonicalTemplateManifest,
  profile: EligibilityProfile,
  version?: VersionAggregate | null
): TemplateEligibilityResult {
  const issues: TemplateEligibilityIssue[] = [];

  const displayName = profile.displayName ?? profile.user?.name ?? null;
  const headline = version?.customHeadline ?? profile.headline ?? null;
  const bio = version?.customBio ?? profile.bio ?? null;

  if (manifest.eligibility.requiredProfileFields.includes("displayName") && !hasText(displayName)) {
    issues.push({
      key: "displayName",
      label: "Nome publico",
      description: "Defina um nome de exibicao para o template.",
    });
  }

  if (manifest.eligibility.requiredProfileFields.includes("headline") && !hasText(headline)) {
    issues.push({
      key: "headline",
      label: "Headline",
      description: "Adicione uma headline clara para abrir o portfolio.",
    });
  }

  if (manifest.eligibility.requiredProfileFields.includes("bio") && !hasText(bio)) {
    issues.push({
      key: "bio",
      label: "Sobre",
      description: "Preencha a bio base para alimentar a narrativa do template.",
    });
  }

  if (manifest.eligibility.requiresAvatar && !hasText(profile.avatarUrl)) {
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

  if (experienceCount < manifest.eligibility.minExperienceItems) {
    issues.push({
      key: "experiences",
      label: "Experiencias",
      description: `Adicione pelo menos ${manifest.eligibility.minExperienceItems} experiencias.`,
    });
  }

  if (projectCount < manifest.eligibility.minProjectItems) {
    issues.push({
      key: "projects",
      label: "Projetos",
      description: `Adicione pelo menos ${manifest.eligibility.minProjectItems} projetos.`,
    });
  }

  if (
    experienceCount + projectCount <
    manifest.eligibility.minExperienceOrProjectItems
  ) {
    issues.push({
      key: "experienceOrProject",
      label: "Experiencias ou projetos",
      description: `Garanta pelo menos ${manifest.eligibility.minExperienceOrProjectItems} experiencia ou projeto para preencher a area central do template.`,
    });
  }

  if (linkCount < manifest.eligibility.minLinkItems) {
    issues.push({
      key: "links",
      label: "Links",
      description: `Adicione pelo menos ${manifest.eligibility.minLinkItems} links publicos para a secao de contato.`,
    });
  }

  if (proofCount < manifest.eligibility.minProofItems) {
    issues.push({
      key: "proofs",
      label: "Provas",
      description: `Adicione pelo menos ${manifest.eligibility.minProofItems} provas publicas.`,
    });
  }

  if (linkCount + proofCount < manifest.eligibility.minLinkOrProofItems) {
    issues.push({
      key: "linksOrProofs",
      label: "Links ou provas",
      description: `Garanta pelo menos ${manifest.eligibility.minLinkOrProofItems} links ou provas publicas.`,
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

async function upsertCanonicalTemplate(
  db: DbClient,
  manifest: CanonicalTemplateManifest
) {
  await ensureCanonicalTemplatePublicAssets(manifest);

  const template = await db.template.upsert({
    where: { slug: manifest.slug },
    update: {
      name: manifest.name,
      description: manifest.description,
      thumbnail: createTemplateAssetUrl(manifest, "cover"),
      version: manifest.version,
      source: manifest.source,
      sourceNodeId: null,
      theme: asInputJsonValue(manifest.theme),
      isActive: true,
    },
    create: {
      name: manifest.name,
      slug: manifest.slug,
      description: manifest.description,
      thumbnail: createTemplateAssetUrl(manifest, "cover"),
      version: manifest.version,
      source: manifest.source,
      sourceNodeId: null,
      theme: asInputJsonValue(manifest.theme),
      isActive: true,
    },
  });

  const blockKeys = manifest.blocks.map((block) => block.key);
  await db.templateBlockDef.deleteMany({
    where: {
      templateId: template.id,
      key: { notIn: blockKeys },
    },
  });

  for (const block of manifest.blocks) {
    await db.templateBlockDef.upsert({
      where: {
        templateId_key: {
          templateId: template.id,
          key: block.key,
        },
      },
      update: {
        blockType: block.blockType,
        label: block.label,
        category: block.category,
        version: block.version,
        defaultOrder: block.defaultOrder,
        required: block.required,
        defaultConfig: asInputJsonValue(block.defaultConfig),
        defaultProps: asInputJsonValue(block.defaultProps),
        editableFields: asInputJsonValue(block.editableFields),
        assetFields: asInputJsonValue(block.assetFields),
        allowedChildren: asInputJsonValue(block.allowedChildren),
      },
      create: {
        templateId: template.id,
        key: block.key,
        blockType: block.blockType,
        label: block.label,
        category: block.category,
        version: block.version,
        defaultOrder: block.defaultOrder,
        required: block.required,
        defaultConfig: asInputJsonValue(block.defaultConfig),
        defaultProps: asInputJsonValue(block.defaultProps),
        editableFields: asInputJsonValue(block.editableFields),
        assetFields: asInputJsonValue(block.assetFields),
        allowedChildren: asInputJsonValue(block.allowedChildren),
      },
    });
  }
}

export async function syncCanonicalTemplates(db: DbClient) {
  for (const manifest of listCanonicalTemplateManifests()) {
    await upsertCanonicalTemplate(db, manifest);
  }
}

export function syncCanonicalTemplatesOnce(db: DbClient) {
  canonicalTemplateSyncPromise ??= syncCanonicalTemplates(db);
  return canonicalTemplateSyncPromise;
}

export async function listCanonicalTemplates(
  db: DbClient
): Promise<CanonicalTemplateListItem[]> {
  await syncCanonicalTemplatesOnce(db);

  const manifests = listCanonicalTemplateManifests();
  const manifestMap = new Map(manifests.map((manifest) => [manifest.slug, manifest]));
  const templates = await db.template.findMany({
    where: {
      isActive: true,
      slug: {
        in: manifests.map((manifest) => manifest.slug),
      },
    },
    include: templateListInclude,
    orderBy: [{ slug: "asc" }],
  });

  return templates
    .map((template) => {
      const manifest = manifestMap.get(template.slug);
      if (!manifest) return null;

      return {
        ...template,
        category: manifest.library.category,
        tags: manifest.library.tags,
        libraryStatus: manifest.library.status,
        origin: manifest.library.origin ?? null,
        summary: manifest.library.summary,
        detail: manifest.library.detail,
        sortOrder: manifest.library.sortOrder,
        coverUrl: createTemplateAssetUrl(manifest, "cover") ?? "",
        referenceUrl: manifest.assets.reference
          ? createTemplateAssetUrl(manifest, "reference")
          : null,
        detailHref: `/templates/${template.slug}`,
        useHref: `/templates/${template.slug}`,
        editorReady: manifest.library.status === "editor-ready" || manifest.library.status === "available",
        isCanonical: true as const,
      };
    })
    .filter((template): template is CanonicalTemplateListItem => template !== null)
    .sort((left, right) => left.sortOrder - right.sortOrder);
}

export async function getCanonicalTemplateBySlug(
  db: DbClient,
  slug: string
): Promise<CanonicalTemplateListItem | null> {
  await syncCanonicalTemplatesOnce(db);

  const manifest = getCanonicalTemplateManifest(slug);
  if (!manifest) return null;

  const template = await db.template.findUnique({
    where: { slug },
    include: templateListInclude,
  });

  if (!template || !template.isActive) return null;

  return {
    ...template,
    category: manifest.library.category,
    tags: manifest.library.tags,
    libraryStatus: manifest.library.status,
    origin: manifest.library.origin ?? null,
    summary: manifest.library.summary,
    detail: manifest.library.detail,
    sortOrder: manifest.library.sortOrder,
    coverUrl: createTemplateAssetUrl(manifest, "cover") ?? "",
    referenceUrl: manifest.assets.reference
      ? createTemplateAssetUrl(manifest, "reference")
      : null,
    detailHref: `/templates/${template.slug}`,
    useHref: `/templates/${template.slug}`,
    editorReady: manifest.library.status === "editor-ready" || manifest.library.status === "available",
    isCanonical: true as const,
  };
}
