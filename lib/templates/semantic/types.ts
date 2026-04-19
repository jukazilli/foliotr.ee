import type { TemplateBlockDef } from "@prisma/client";
import type {
  ProfileAggregate,
  VersionAggregate,
} from "@/lib/server/domain/includes";
import type { CanonicalTemplateManifest } from "@/lib/templates/manifest";

export interface SemanticSeedContext {
  manifest: CanonicalTemplateManifest;
  profile: ProfileAggregate;
  version: VersionAggregate;
}

export interface SemanticSeededBlock {
  key: string;
  blockType: string;
  order: number;
  visible: boolean;
  config: Record<string, unknown>;
  props: Record<string, unknown>;
  assets: Record<string, unknown>;
}

export interface SemanticSeedStrategy {
  slug: string;
  seedBlocks(args: {
    blockDefs: TemplateBlockDef[];
    context: SemanticSeedContext;
  }): SemanticSeededBlock[];
}
