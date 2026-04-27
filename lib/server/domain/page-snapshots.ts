import { Prisma } from "@/generated/prisma-client";
import type { ResumeConfig } from "@/generated/prisma-client";
import type {
  RenderablePageBlock,
  TemplateProfile,
} from "@/components/templates/types";
import type { VersionForBlocks } from "@/components/blocks/types";
import {
  getVersionSelectionIds,
  type ProfileAggregate,
  type VersionAggregate,
} from "@/lib/server/domain/includes";

export interface PageEditorSnapshot {
  profile: TemplateProfile;
  version: VersionForBlocks;
}

export interface PublishedPageSnapshot extends PageEditorSnapshot {
  blocks: RenderablePageBlock[];
}

export interface PublishedResumeSnapshot extends PublishedPageSnapshot {
  config: {
    sections: string[];
    layout: string;
    accentColor: string | null;
    showPhoto: boolean;
    showLinks: boolean;
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function toSerializable<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export function asInputJsonValue<T>(value: T): Prisma.InputJsonValue {
  return toSerializable(value) as Prisma.InputJsonValue;
}

export function buildEditorSnapshot(
  profile: ProfileAggregate,
  version: VersionAggregate
): PageEditorSnapshot {
  return {
    profile: toSerializable({
      id: profile.id,
      userId: profile.userId,
      displayName: profile.displayName,
      headline: profile.headline,
      bio: profile.bio,
      avatarUrl: profile.avatarUrl,
      bannerUrl: profile.bannerUrl,
      location: profile.location,
      pronouns: profile.pronouns,
      websiteUrl: profile.websiteUrl,
      publicEmail: profile.publicEmail,
      phone: profile.phone,
      birthDate: profile.birthDate,
      defaultPresentationId: profile.defaultPresentationId,
      openToOpportunities: profile.openToOpportunities,
      opportunityMotivation: profile.opportunityMotivation,
      showOpportunityMotivation: profile.showOpportunityMotivation,
      onboardingDone: profile.onboardingDone,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
      user: profile.user
        ? {
            name: profile.user.name,
            username: profile.user.username,
          }
        : null,
      experiences: profile.experiences,
      educations: profile.educations,
      skills: profile.skills,
      projects: profile.projects,
      achievements: profile.achievements,
      links: profile.links,
      proofs: profile.proofs,
      presentations: profile.presentations,
    }) as TemplateProfile,
    version: {
      customHeadline: version.customHeadline,
      customBio: version.customBio,
      presentationId: version.presentationId,
      presentation: version.presentation,
      ...getVersionSelectionIds(version),
    },
  };
}

export function buildPublishedPageSnapshot(args: {
  editorSnapshot: PageEditorSnapshot;
  blocks: RenderablePageBlock[];
}): PublishedPageSnapshot {
  return {
    profile: toSerializable(args.editorSnapshot.profile),
    version: toSerializable(args.editorSnapshot.version),
    blocks: toSerializable(args.blocks),
  };
}

export function buildPublishedResumeSnapshot(args: {
  editorSnapshot: PageEditorSnapshot;
  blocks: RenderablePageBlock[];
  config: Pick<
    ResumeConfig,
    "sections" | "layout" | "accentColor" | "showPhoto" | "showLinks"
  >;
}): PublishedResumeSnapshot {
  return {
    ...buildPublishedPageSnapshot({
      editorSnapshot: args.editorSnapshot,
      blocks: args.blocks,
    }),
    config: {
      sections: [...args.config.sections],
      layout: args.config.layout,
      accentColor: args.config.accentColor ?? null,
      showPhoto: args.config.showPhoto,
      showLinks: args.config.showLinks,
    },
  };
}

export function readPageEditorSnapshot(value: unknown): PageEditorSnapshot | null {
  if (!isRecord(value) || !isRecord(value.profile) || !isRecord(value.version)) {
    return null;
  }

  return value as unknown as PageEditorSnapshot;
}

export function readPublishedPageSnapshot(
  value: unknown
): PublishedPageSnapshot | null {
  if (!isRecord(value) || !Array.isArray(value.blocks)) {
    return null;
  }

  const editorSnapshot = readPageEditorSnapshot(value);
  if (!editorSnapshot) return null;

  return value as unknown as PublishedPageSnapshot;
}

export function readPublishedResumeSnapshot(
  value: unknown
): PublishedResumeSnapshot | null {
  const pageSnapshot = readPublishedPageSnapshot(value);
  if (!pageSnapshot || !isRecord(value) || !isRecord(value.config)) {
    return null;
  }

  return value as unknown as PublishedResumeSnapshot;
}
