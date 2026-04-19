import type { ResumeConfig } from "@prisma/client";
import type { ProfileForBlocks, VersionForBlocks } from "@/components/blocks/types";
import type { RenderablePageBlock } from "@/components/templates/types";

export interface ResumeProjectionInput {
  templateSlug: string;
  blocks: RenderablePageBlock[];
  profile: ProfileForBlocks;
  version?: VersionForBlocks | null;
  config?: ResumeConfig | null;
}

export interface ResumeProjectionLink {
  label: string;
  href: string;
  kind: "contact" | "link" | "proof";
}

export interface ResumeProjectionHeader {
  displayName: string;
  headline: string;
  summary: string;
  location: string;
  publicEmail: string;
  phone: string;
  avatarUrl: string;
  links: ResumeProjectionLink[];
}

export interface ResumeProjectionSummarySection {
  key: "summary";
  title: string;
  body: string;
}

export interface ResumeProjectionExperienceItem {
  id: string;
  company: string;
  role: string;
  period: string;
  location: string;
  description: string;
  current: boolean;
}

export interface ResumeProjectionExperienceSection {
  key: "experience";
  title: string;
  items: ResumeProjectionExperienceItem[];
}

export interface ResumeProjectionProjectItem {
  id: string;
  title: string;
  description: string;
  href: string;
  tags: string[];
}

export interface ResumeProjectionProjectSection {
  key: "projects";
  title: string;
  items: ResumeProjectionProjectItem[];
}

export interface ResumeProjectionHighlightItem {
  id: string;
  title: string;
  metric: string;
  description: string;
}

export interface ResumeProjectionHighlightSection {
  key: "highlights";
  title: string;
  items: ResumeProjectionHighlightItem[];
}

export interface ResumeProjectionSkillsSection {
  key: "skills";
  title: string;
  groups: Array<{ category: string; items: string[] }>;
}

export interface ResumeProjectionLinksSection {
  key: "links";
  title: string;
  items: ResumeProjectionLink[];
}

export type ResumeProjectionSection =
  | ResumeProjectionSummarySection
  | ResumeProjectionExperienceSection
  | ResumeProjectionProjectSection
  | ResumeProjectionHighlightSection
  | ResumeProjectionSkillsSection
  | ResumeProjectionLinksSection;

export interface ResumeProjectionTheme {
  background: string;
  surface: string;
  ink: string;
  muted: string;
  accent: string;
  accentSoft: string;
  border: string;
  fontFamily: string;
}

export interface ResumeProjectionRules {
  enters: string[];
  collapses: string[];
  hides: string[];
  textOnly: string[];
}

export interface ResumeProjection {
  templateSlug: string;
  theme: ResumeProjectionTheme;
  header: ResumeProjectionHeader;
  sections: ResumeProjectionSection[];
  showPhoto: boolean;
  showLinks: boolean;
  rules: ResumeProjectionRules;
}
