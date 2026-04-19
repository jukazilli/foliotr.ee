import type { TemplateBlockDef } from "@/generated/prisma-client";
import { getTemplateImplementationOrThrow } from "@/lib/templates/template-registry";
import type {
  SemanticSeedContext,
  SemanticSeededBlock,
} from "@/lib/templates/semantic/types";

export function mapTemplateInitialBlocks(args: {
  templateSlug: string;
  blockDefs: TemplateBlockDef[];
  context: SemanticSeedContext;
}): SemanticSeededBlock[] {
  return getTemplateImplementationOrThrow(args.templateSlug).semanticMapper({
    blockDefs: args.blockDefs,
    context: args.context,
  });
}
