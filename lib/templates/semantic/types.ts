import type { TemplateBlockDef } from "@/generated/prisma-client";
import type {
  ProfileAggregate,
  VersionAggregate,
} from "@/lib/server/domain/includes";

export interface SemanticSeedContext {
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
