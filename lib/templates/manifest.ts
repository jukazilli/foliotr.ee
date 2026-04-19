import { existsSync } from "node:fs";
import path from "node:path";
import { z } from "zod";
import { editableFieldSchema } from "@/lib/templates/contracts";

const canonicalTemplateAssetSchema = z.object({
  cover: z.string().trim().min(1).max(120),
  reference: z.string().trim().min(1).max(120).optional().nullable(),
  notes: z.string().trim().min(1).max(120).default("notes.md"),
  codeDir: z.string().trim().min(1).max(240),
});

const canonicalTemplateEligibilitySchema = z.object({
  requiredProfileFields: z
    .array(z.enum(["displayName", "headline", "bio"]))
    .default([]),
  requiresAvatar: z.boolean().default(false),
  minExperienceItems: z.number().int().min(0).default(0),
  minProjectItems: z.number().int().min(0).default(0),
  minExperienceOrProjectItems: z.number().int().min(0).default(0),
  minLinkItems: z.number().int().min(0).default(0),
  minProofItems: z.number().int().min(0).default(0),
  minLinkOrProofItems: z.number().int().min(0).default(0),
});

const canonicalTemplateLibrarySchema = z.object({
  category: z.string().trim().min(1).max(80),
  tags: z.array(z.string().trim().min(1).max(40)).max(8).default([]),
  status: z.enum(["available", "editor-ready", "paused"]).default("available"),
  origin: z.string().trim().min(1).max(120).optional().nullable(),
  summary: z.string().trim().min(1).max(280),
  detail: z.string().trim().min(1).max(1000),
  sortOrder: z.number().int().min(0).default(0),
});

const canonicalTemplateResumeDefaultsSchema = z.object({
  sections: z.array(z.string().trim().min(1).max(60)).max(12).default([]),
  layout: z.string().trim().min(1).max(40).default("classic"),
  accentColor: z.string().trim().max(40).optional().nullable(),
  showPhoto: z.boolean().default(false),
  showLinks: z.boolean().default(true),
});

const semanticSlotBindingSchema = z.object({
  slot: z.string().trim().min(1).max(120),
  target: z.string().trim().min(1).max(120),
  source: z.enum(["profile", "version", "selection", "derived", "template"]),
  required: z.boolean().default(false),
  fallback: z.unknown().optional(),
  description: z.string().trim().max(240).optional(),
});

const templateBlockManifestSchema = z.object({
  key: z.string().trim().min(1).max(120),
  blockType: z.string().trim().min(1).max(120),
  label: z.string().trim().min(1).max(120),
  category: z.string().trim().min(1).max(80).default("section"),
  version: z.number().int().min(1).default(1),
  defaultOrder: z.number().int().min(0).max(500),
  required: z.boolean().default(false),
  repeatable: z.boolean().default(false),
  defaultConfig: z.record(z.unknown()).default({}),
  defaultProps: z.record(z.unknown()).default({}),
  editableFields: z.array(editableFieldSchema).default([]),
  assetFields: z.array(editableFieldSchema).default([]),
  allowedChildren: z.array(z.string().trim().min(1).max(120)).default([]),
  semanticSlots: z.array(semanticSlotBindingSchema).default([]),
});

const canonicalTemplateRestrictionsSchema = z.object({
  themeLocked: z.boolean().default(true),
  fontsLocked: z.boolean().default(true),
  colorsLocked: z.boolean().default(true),
  identityLocked: z.boolean().default(true),
  layoutLocked: z.boolean().default(true),
});

export const canonicalTemplateManifestSchema = z.object({
  slug: z.string().trim().min(1).max(80),
  name: z.string().trim().min(1).max(120),
  version: z.number().int().min(1),
  source: z.string().trim().min(1).max(80),
  description: z.string().trim().min(1).max(400),
  theme: z.record(z.string().trim().min(1).max(120)),
  assets: canonicalTemplateAssetSchema,
  library: canonicalTemplateLibrarySchema,
  eligibility: canonicalTemplateEligibilitySchema,
  resumeDefaults: canonicalTemplateResumeDefaultsSchema,
  restrictions: canonicalTemplateRestrictionsSchema,
  blocks: z.array(templateBlockManifestSchema).min(1).max(50),
});

export type CanonicalTemplateManifest = z.infer<
  typeof canonicalTemplateManifestSchema
>;
export type CanonicalTemplateBlockManifest = CanonicalTemplateManifest["blocks"][number];
export type CanonicalTemplateEligibility = CanonicalTemplateManifest["eligibility"];

export function getCanonicalTemplateRoot(slug: string) {
  return path.join(process.cwd(), "assets", "template", slug);
}

export function resolveCanonicalTemplateAssetPath(
  manifest: CanonicalTemplateManifest,
  asset: keyof CanonicalTemplateManifest["assets"]
) {
  const assetValue = manifest.assets[asset];
  if (!assetValue) return null;
  return path.join(getCanonicalTemplateRoot(manifest.slug), assetValue);
}

export function assertCanonicalTemplateFiles(manifest: CanonicalTemplateManifest) {
  const requiredPaths = [
    resolveCanonicalTemplateAssetPath(manifest, "cover"),
    resolveCanonicalTemplateAssetPath(manifest, "notes"),
    resolveCanonicalTemplateAssetPath(manifest, "codeDir"),
  ];

  for (const targetPath of requiredPaths) {
    if (!targetPath || !existsSync(targetPath)) {
      throw new Error(
        `Canonical template asset missing for ${manifest.slug}: ${targetPath ?? "unknown"}`
      );
    }
  }

  const referencePath = resolveCanonicalTemplateAssetPath(manifest, "reference");
  if (referencePath && !existsSync(referencePath)) {
    return {
      referenceAvailable: false,
    };
  }

  return {
    referenceAvailable: Boolean(referencePath),
  };
}
