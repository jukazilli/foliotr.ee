import type { PageBlock, Profile } from "@/generated/prisma-client";
import type { ProfileForBlocks, VersionForBlocks } from "@/components/blocks/types";

export type RenderablePageBlock = PageBlock & {
  children?: RenderablePageBlock[];
};

export type TemplateProfile = ProfileForBlocks &
  Profile & {
    user?: {
      name?: string | null;
      email?: string | null;
      username?: string | null;
    } | null;
  };

export interface TemplateRendererProps {
  templateSlug: string;
  blocks: RenderablePageBlock[];
  profile: TemplateProfile;
  version?: VersionForBlocks | null;
  templateSourcePackage?: unknown;
  renderHiddenBlocks?: boolean;
}
