import type { TemplateRendererProps } from "@/components/templates/types";
import { getPageTemplateRendererOrThrow } from "@/components/templates/template-renderer-registry";

export default function TemplateRenderer(props: TemplateRendererProps) {
  const PageRenderer = getPageTemplateRendererOrThrow(props.templateSlug);

  return <PageRenderer {...props} />;
}
