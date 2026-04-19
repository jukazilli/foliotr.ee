import { portfolioCommunityManifest } from "@/assets/template/portfolio-community/manifest";
import {
  assertCanonicalTemplateFiles,
  canonicalTemplateManifestSchema,
  type CanonicalTemplateManifest,
} from "@/lib/templates/manifest";

const canonicalTemplateManifests = [portfolioCommunityManifest].map((manifest) => {
  const parsedManifest = canonicalTemplateManifestSchema.parse(manifest);
  assertCanonicalTemplateFiles(parsedManifest);
  return parsedManifest;
});

export function listCanonicalTemplateManifests(): CanonicalTemplateManifest[] {
  return [...canonicalTemplateManifests].sort(
    (left, right) => left.library.sortOrder - right.library.sortOrder
  );
}

export function getCanonicalTemplateManifest(
  slug: string
): CanonicalTemplateManifest | null {
  return (
    canonicalTemplateManifests.find((manifest) => manifest.slug === slug) ?? null
  );
}

export function isCanonicalTemplateSlug(slug: string) {
  return canonicalTemplateManifests.some((manifest) => manifest.slug === slug);
}

