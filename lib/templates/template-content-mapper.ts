import type { TemplateBlockDef } from "@prisma/client";
import { resolveTemplateSemanticStrategy } from "@/lib/templates/template-resolver";
import type {
  SemanticSeedContext,
  SemanticSeededBlock,
} from "@/lib/templates/semantic/types";

export function mapTemplateInitialBlocks(args: {
  templateSlug: string;
  blockDefs: TemplateBlockDef[];
  context: SemanticSeedContext;
}): SemanticSeededBlock[] {
  const strategy = resolveTemplateSemanticStrategy(args.templateSlug);

  if (!strategy) {
    return args.blockDefs.map((blockDef) => ({
      key: blockDef.key,
      blockType: blockDef.blockType,
      order: blockDef.defaultOrder,
      visible: true,
      config:
        typeof blockDef.defaultConfig === "object" && blockDef.defaultConfig
          ? (blockDef.defaultConfig as Record<string, unknown>)
          : {},
      props:
        typeof blockDef.defaultProps === "object" && blockDef.defaultProps
          ? (blockDef.defaultProps as Record<string, unknown>)
          : {},
      assets: {},
    }));
  }

  return strategy.seedBlocks({
    blockDefs: args.blockDefs,
    context: args.context,
  });
}
