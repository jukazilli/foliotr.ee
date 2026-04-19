import { portfolioCommunitySemanticStrategy } from "@/lib/templates/semantic/portfolio-community";
import type { SemanticSeedStrategy } from "@/lib/templates/semantic/types";

const TEMPLATE_SEMANTIC_STRATEGIES: Record<string, SemanticSeedStrategy> = {
  "portfolio-community": portfolioCommunitySemanticStrategy,
};

export function resolveTemplateSemanticStrategy(
  slug: string
): SemanticSeedStrategy | null {
  return TEMPLATE_SEMANTIC_STRATEGIES[slug] ?? null;
}

