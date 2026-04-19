// ---------------------------------------------------------------------------
// Block Types
// ---------------------------------------------------------------------------

export type BlockType =
  | "hero"
  | "about"
  | "experience"
  | "education"
  | "skills"
  | "projects"
  | "achievements"
  | "proof"
  | "links"
  | "contact";

// ---------------------------------------------------------------------------
// Block Config interfaces
// ---------------------------------------------------------------------------

export interface HeroBlockConfig {
  showAvatar: boolean;
  showBanner: boolean;
  ctaText: string;
  layout: "centered" | "left" | "right";
  ctaUrl?: string;
}

export interface AboutBlockConfig {
  title: string;
  showLocation: boolean;
  showLinks: boolean;
}

export interface ExperienceBlockConfig {
  title: string;
  maxItems: number;
  showCompanyLogo: boolean;
  showCurrentBadge: boolean;
}

export interface EducationBlockConfig {
  title: string;
  maxItems: number;
  showInstitutionLogo?: boolean;
}

export interface SkillsBlockConfig {
  title: string;
  layout: "tags" | "list" | "grid";
  showLevel: boolean;
  showCategory: boolean;
}

export interface ProjectsBlockConfig {
  title: string;
  layout: "grid" | "list" | "cards";
  maxItems: number;
  showImages: boolean;
  showTags?: boolean;
}

export interface AchievementsBlockConfig {
  title: string;
  showMetrics: boolean;
  showDates: boolean;
  maxItems?: number;
}

export interface ProofBlockConfig {
  title: string;
  showMetrics: boolean;
  maxItems?: number;
  showTags?: boolean;
}

export interface LinksBlockConfig {
  title: string;
  layout: "grid" | "list";
  showIcons?: boolean;
}

export interface ContactBlockConfig {
  title: string;
  showEmail: boolean;
  showPhone: boolean;
  showSocialLinks?: boolean;
}

// ---------------------------------------------------------------------------
// Union type for all block configs
// ---------------------------------------------------------------------------

export type BlockConfig =
  | HeroBlockConfig
  | AboutBlockConfig
  | ExperienceBlockConfig
  | EducationBlockConfig
  | SkillsBlockConfig
  | ProjectsBlockConfig
  | AchievementsBlockConfig
  | ProofBlockConfig
  | LinksBlockConfig
  | ContactBlockConfig;

// ---------------------------------------------------------------------------
// Resume section types
// ---------------------------------------------------------------------------

export type ResumeSectionType =
  | "header"
  | "experience"
  | "education"
  | "skills"
  | "projects"
  | "achievements"
  | "proof"
  | "links";

// ---------------------------------------------------------------------------
// Profile focus / area types
// ---------------------------------------------------------------------------

export type ProfileFocus =
  | "developer"
  | "designer"
  | "product"
  | "marketing"
  | "freelancer"
  | "other";

// ---------------------------------------------------------------------------
// NextAuth session type extensions
// ---------------------------------------------------------------------------

import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    username?: string | null;
  }

  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      username?: string | null;
    };
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id?: string;
    username?: string | null;
  }
}
