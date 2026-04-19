import { BLOCK_REGISTRY } from "@/components/blocks";
import type { BlockType } from "@/components/blocks";
import PortfolioCommunityRenderer from "@/components/templates/portfolio-community/PortfolioCommunityRenderer";
import type { TemplateRendererProps } from "@/components/templates/types";

export default function TemplateRenderer(props: TemplateRendererProps) {
  if (props.templateSlug === "portfolio-community") {
    return <PortfolioCommunityRenderer {...props} />;
  }

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
      {props.blocks
        .filter((block) => block.visible && !block.parentId)
        .sort((a, b) => a.order - b.order)
        .map((block) => {
          const BlockComponent = BLOCK_REGISTRY[block.blockType as BlockType];
          if (!BlockComponent) return null;

          return (
            <BlockComponent
              key={block.id}
              config={block.config as Record<string, unknown>}
              profile={props.profile}
              version={props.version}
            />
          );
        })}
    </div>
  );
}
