import type {
  Achievement,
  Education,
  Experience,
  Profile,
  ProfileLink,
  ProfilePresentation,
  Project,
  Proof,
  Skill,
} from "@/generated/prisma-client";

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

export type ProfileForBlocks = Profile & {
  user?: {
    name?: string | null;
    email?: string | null;
    username?: string | null;
  } | null;
  experiences: Experience[];
  educations: Education[];
  skills: Skill[];
  projects: Project[];
  achievements: Achievement[];
  links: ProfileLink[];
  proofs?: Proof[];
  presentations?: ProfilePresentation[];
  defaultPresentationId?: string | null;
};

export interface VersionForBlocks {
  customHeadline?: string | null;
  customBio?: string | null;
  presentationId?: string | null;
  presentation?: {
    id: string;
    title: string;
    body: string;
    context?: string | null;
  } | null;
  selectedExperienceIds: string[];
  selectedEducationIds?: string[];
  selectedProjectIds: string[];
  selectedSkillIds: string[];
  selectedAchievementIds: string[];
  selectedProofIds?: string[];
  selectedHighlightIds?: string[];
  selectedLinkIds?: string[];
}

export interface BlockProps {
  config: Record<string, unknown>;
  profile: ProfileForBlocks;
  version?: VersionForBlocks | null;
  isPreview?: boolean;
}
