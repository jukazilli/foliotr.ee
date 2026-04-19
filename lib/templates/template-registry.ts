import type { TemplateBlockDef } from "@/generated/prisma-client";
import { projectPortfolioCommunityResume } from "@/lib/templates/resume/portfolio-community";
import type {
  ResumeProjection,
  ResumeProjectionInput,
} from "@/lib/templates/resume/types";
import { portfolioCommunitySemanticStrategy } from "@/lib/templates/semantic/portfolio-community";
import type {
  SemanticSeedContext,
  SemanticSeedStrategy,
  SemanticSeededBlock,
} from "@/lib/templates/semantic/types";

export interface TemplateImplementation {
  slug: string;
  resumeProjector: (input: ResumeProjectionInput) => ResumeProjection;
  seedStrategy: SemanticSeedStrategy;
  semanticMapper: (args: {
    blockDefs: TemplateBlockDef[];
    context: SemanticSeedContext;
  }) => SemanticSeededBlock[];
}

function createTemplateImplementation(
  slug: string,
  resumeProjector: (input: ResumeProjectionInput) => ResumeProjection,
  seedStrategy: SemanticSeedStrategy
): TemplateImplementation {
  return {
    slug,
    resumeProjector,
    seedStrategy,
    semanticMapper: ({ blockDefs, context }) =>
      seedStrategy.seedBlocks({
        blockDefs,
        context,
      }),
  };
}

const TEMPLATE_REGISTRY: Record<string, TemplateImplementation> = {
  "portfolio-community": createTemplateImplementation(
    "portfolio-community",
    projectPortfolioCommunityResume,
    portfolioCommunitySemanticStrategy
  ),
};

export function getTemplateImplementation(slug: string): TemplateImplementation | null {
  return TEMPLATE_REGISTRY[slug] ?? null;
}

export function getTemplateImplementationOrThrow(slug: string): TemplateImplementation {
  const implementation = getTemplateImplementation(slug);

  if (!implementation) {
    throw new Error(
      `Missing template implementation for slug "${slug}". Register page renderer, resume projector, and seed strategy in lib/templates/template-registry.ts.`
    );
  }

  return implementation;
}
