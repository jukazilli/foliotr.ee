import type { Prisma } from "@prisma/client";
import { getCanonicalTemplateManifest } from "@/lib/templates/registry";

const manifest = getCanonicalTemplateManifest("portfolio-community");

if (!manifest) {
  throw new Error("Canonical template manifest not found: portfolio-community");
}

export const PORTFOLIO_COMMUNITY_TEMPLATE = {
  slug: manifest.slug,
  name: manifest.name,
  version: manifest.version,
  source: manifest.source,
  sourceNodeId: null,
  description: manifest.description,
  thumbnail: "/template-assets/portfolio-community/cover.png",
  theme: manifest.theme as Prisma.InputJsonValue,
  blocks: manifest.blocks.map((block) => ({
    key: block.key,
    blockType: block.blockType,
    label: block.label,
    category: block.category,
    defaultOrder: block.defaultOrder,
    required: block.required,
    defaultConfig: block.defaultConfig as Prisma.InputJsonValue,
    defaultProps: block.defaultProps as Prisma.InputJsonValue,
    editableFields: block.editableFields as Prisma.InputJsonValue,
    assetFields: block.assetFields as Prisma.InputJsonValue,
    allowedChildren: block.allowedChildren as Prisma.InputJsonValue,
  })),
};
