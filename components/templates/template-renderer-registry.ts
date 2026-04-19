import type { ComponentType } from "react";
import PortfolioCommunityRenderer from "@/components/templates/portfolio-community/PortfolioCommunityRenderer";
import type { TemplateRendererProps } from "@/components/templates/types";

const TEMPLATE_RENDERER_REGISTRY: Record<
  string,
  ComponentType<TemplateRendererProps>
> = {
  "portfolio-community": PortfolioCommunityRenderer,
};

export function getPageTemplateRendererOrThrow(
  slug: string
): ComponentType<TemplateRendererProps> {
  const renderer = TEMPLATE_RENDERER_REGISTRY[slug];

  if (!renderer) {
    throw new Error(
      `Missing page renderer for template slug "${slug}". Register it in components/templates/template-renderer-registry.ts.`
    );
  }

  return renderer;
}
