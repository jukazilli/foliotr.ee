import { z } from "zod";

export const PublishStatusSchema = z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]);
export const AssetKindSchema = z.enum(["IMAGE", "DOCUMENT", "VIDEO", "EXTERNAL"]);
export const VisibilitySchema = z.enum(["PUBLIC", "PRIVATE", "UNLISTED"]);
export const VersionGoalSchema = z.enum([
  "GENERAL",
  "RECRUITER",
  "CLIENT",
  "FREELANCE",
  "PORTFOLIO",
  "CUSTOM",
]);
export const BlockTypeSchema = z.enum([
  "hero",
  "about",
  "experienceTimeline",
  "projectGrid",
  "proofList",
  "links",
  "contact",
  "image",
  "resumeCta",
  "socialLinks",
]);

export type PublishStatus = z.infer<typeof PublishStatusSchema>;
export type AssetKind = z.infer<typeof AssetKindSchema>;
export type Visibility = z.infer<typeof VisibilitySchema>;
export type VersionGoal = z.infer<typeof VersionGoalSchema>;
export type BlockType = z.infer<typeof BlockTypeSchema>;

export const LinkSchema = z.object({
  id: z.string(),
  label: z.string().min(1),
  url: z.string().url(),
  kind: z.string().default("link"),
  order: z.number().int().nonnegative().default(0),
});

export const ProofSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  summary: z.string().default(""),
  metricLabel: z.string().optional(),
  metricValue: z.string().optional(),
  url: z.string().url().optional(),
});

export const ProjectSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  summary: z.string().default(""),
  role: z.string().optional(),
  result: z.string().optional(),
  imageUrl: z.string().url().optional(),
  url: z.string().url().optional(),
});

export const ExperienceSchema = z.object({
  id: z.string(),
  company: z.string().min(1),
  role: z.string().min(1),
  startDate: z.string(),
  endDate: z.string().optional(),
  summary: z.string().default(""),
});

export const AchievementSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  summary: z.string().default(""),
  year: z.string().optional(),
});

export const HighlightSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  body: z.string().default(""),
  order: z.number().int().nonnegative().default(0),
});

export const ProfileSchema = z.object({
  id: z.string(),
  slug: z.string().min(3),
  displayName: z.string().min(1),
  headline: z.string().min(1),
  location: z.string().optional(),
  bio: z.string().default(""),
  avatarUrl: z.string().url().optional(),
  links: z.array(LinkSchema).default([]),
  proofs: z.array(ProofSchema).default([]),
  projects: z.array(ProjectSchema).default([]),
  experiences: z.array(ExperienceSchema).default([]),
  achievements: z.array(AchievementSchema).default([]),
  highlights: z.array(HighlightSchema).default([]),
});

export const TemplateBlockSchema = z.object({
  id: z.string(),
  type: BlockTypeSchema,
  name: z.string(),
  order: z.number().int().nonnegative(),
  required: z.boolean().default(false),
  defaultVisible: z.boolean().default(true),
  contentSchema: z.record(z.string(), z.unknown()).default({}),
  styleSchema: z.record(z.string(), z.unknown()).default({}),
  defaultContent: z.record(z.string(), z.unknown()).default({}),
});

export const TemplateSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  description: z.string().default(""),
  version: z.string(),
  blocks: z.array(TemplateBlockSchema),
});

export const PageBlockSchema = z.object({
  id: z.string(),
  type: BlockTypeSchema,
  name: z.string(),
  order: z.number().int().nonnegative(),
  visible: z.boolean().default(true),
  content: z.record(z.string(), z.unknown()).default({}),
  style: z.record(z.string(), z.unknown()).default({}),
  assetRefs: z.array(z.string()).default([]),
});

export const VersionSchema = z.object({
  id: z.string(),
  name: z.string(),
  goal: VersionGoalSchema,
  status: PublishStatusSchema,
  audience: z.string().optional(),
  summary: z.string().default(""),
  profile: ProfileSchema,
});

export const PublicPageSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  status: PublishStatusSchema,
  template: TemplateSchema,
  version: VersionSchema,
  blocks: z.array(PageBlockSchema),
});

export const ResumeViewSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  status: PublishStatusSchema,
  density: z.enum(["COMPACT", "COMFORTABLE"]).default("COMFORTABLE"),
  version: VersionSchema,
  visibleSections: z.array(z.string()).default([
    "summary",
    "experience",
    "projects",
    "proof",
    "links",
  ]),
});

export type Link = z.infer<typeof LinkSchema>;
export type Proof = z.infer<typeof ProofSchema>;
export type Project = z.infer<typeof ProjectSchema>;
export type Experience = z.infer<typeof ExperienceSchema>;
export type Achievement = z.infer<typeof AchievementSchema>;
export type Highlight = z.infer<typeof HighlightSchema>;
export type Profile = z.infer<typeof ProfileSchema>;
export type TemplateBlock = z.infer<typeof TemplateBlockSchema>;
export type Template = z.infer<typeof TemplateSchema>;
export type PageBlock = z.infer<typeof PageBlockSchema>;
export type Version = z.infer<typeof VersionSchema>;
export type PublicPage = z.infer<typeof PublicPageSchema>;
export type ResumeView = z.infer<typeof ResumeViewSchema>;

export const communityPortfolioTemplate: Template = {
  id: "template-community-portfolio",
  slug: "community-portfolio",
  name: "Community Portfolio",
  description:
    "Portfolio editorial inspirado no template Figma Community, adaptado para os tokens FolioTree.",
  version: "0.1.0",
  blocks: [
    {
      id: "tpl-block-hero",
      type: "hero",
      name: "Hero",
      order: 0,
      required: true,
      defaultVisible: true,
      contentSchema: {},
      styleSchema: {},
      defaultContent: {
        eyebrow: "Hello, I am",
        ctaLabel: "Resume",
      },
    },
    {
      id: "tpl-block-social",
      type: "socialLinks",
      name: "Social links",
      order: 1,
      required: false,
      defaultVisible: true,
      contentSchema: {},
      styleSchema: {},
      defaultContent: {},
    },
    {
      id: "tpl-block-about",
      type: "about",
      name: "About",
      order: 2,
      required: false,
      defaultVisible: true,
      contentSchema: {},
      styleSchema: {},
      defaultContent: {},
    },
    {
      id: "tpl-block-experience",
      type: "experienceTimeline",
      name: "Experience",
      order: 3,
      required: false,
      defaultVisible: true,
      contentSchema: {},
      styleSchema: {},
      defaultContent: {},
    },
    {
      id: "tpl-block-work",
      type: "projectGrid",
      name: "Work",
      order: 4,
      required: false,
      defaultVisible: true,
      contentSchema: {},
      styleSchema: {},
      defaultContent: {},
    },
    {
      id: "tpl-block-proof",
      type: "proofList",
      name: "Proof",
      order: 5,
      required: false,
      defaultVisible: true,
      contentSchema: {},
      styleSchema: {},
      defaultContent: {},
    },
    {
      id: "tpl-block-contact",
      type: "contact",
      name: "Contact",
      order: 6,
      required: false,
      defaultVisible: true,
      contentSchema: {},
      styleSchema: {},
      defaultContent: {},
    },
  ],
};

export const demoProfile: Profile = {
  id: "profile-demo",
  slug: "demo",
  displayName: "Alex Morgan",
  headline: "Product designer turning scattered work into clear proof.",
  location: "Sao Paulo, BR",
  bio: "I connect product thinking, visual systems, and measurable delivery to make professional value easy to understand.",
  avatarUrl:
    "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=900&q=80",
  links: [
    { id: "link-1", label: "Portfolio", url: "https://example.com", kind: "portfolio", order: 0 },
    { id: "link-2", label: "LinkedIn", url: "https://linkedin.com", kind: "social", order: 1 },
    { id: "link-3", label: "Email", url: "mailto:alex@example.com", kind: "email", order: 2 },
  ],
  proofs: [
    {
      id: "proof-1",
      title: "Reduced onboarding drop-off",
      summary: "Redesigned the first-run flow around proof, clarity, and faster setup.",
      metricLabel: "Drop-off",
      metricValue: "-32%",
    },
    {
      id: "proof-2",
      title: "Launched modular profile system",
      summary: "Created reusable blocks for projects, highlights, links, and credentials.",
      metricLabel: "Time saved",
      metricValue: "18h/mo",
    },
  ],
  projects: [
    {
      id: "project-1",
      title: "Public proof page",
      summary: "A public professional presence that makes value clear before the first scroll.",
      role: "Design lead",
      result: "+41% recruiter engagement",
      imageUrl:
        "https://images.unsplash.com/photo-1559028012-481c04fa702d?auto=format&fit=crop&w=1200&q=80",
    },
    {
      id: "project-2",
      title: "Resume reading mode",
      summary: "A simplified version focused on structured, recruiter-friendly reading.",
      role: "Product designer",
      result: "2x faster screening",
      imageUrl:
        "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80",
    },
  ],
  experiences: [
    {
      id: "exp-1",
      company: "Northstar Studio",
      role: "Senior Product Designer",
      startDate: "2022",
      endDate: "Present",
      summary: "Design systems, product strategy, and proof-oriented public experiences.",
    },
    {
      id: "exp-2",
      company: "Bright Apps",
      role: "UX Designer",
      startDate: "2019",
      endDate: "2022",
      summary: "Led flows for onboarding, profile publishing, and customer activation.",
    },
  ],
  achievements: [
    {
      id: "ach-1",
      title: "Top portfolio redesign",
      summary: "Selected as a reference by a design community.",
      year: "2024",
    },
  ],
  highlights: [
    {
      id: "hl-1",
      title: "8 shipped products",
      body: "Across SaaS, creator tools, and marketplace experiences.",
      order: 0,
    },
    {
      id: "hl-2",
      title: "Proof-first systems",
      body: "Pages, resumes, and snapshots generated from one structured profile.",
      order: 1,
    },
  ],
};

export const demoVersion: Version = {
  id: "version-demo",
  name: "Recruiter snapshot",
  goal: "RECRUITER",
  status: "PUBLISHED",
  audience: "Recruiters and hiring managers",
  summary: "A fast reading version focused on outcomes, role clarity, and proof.",
  profile: demoProfile,
};

export const demoPage: PublicPage = {
  id: "page-demo",
  slug: "demo",
  title: "Alex Morgan",
  status: "PUBLISHED",
  template: communityPortfolioTemplate,
  version: demoVersion,
  blocks: communityPortfolioTemplate.blocks.map((block) => ({
    id: block.id.replace("tpl-", "page-"),
    type: block.type,
    name: block.name,
    order: block.order,
    visible: block.defaultVisible,
    content: block.defaultContent,
    style: {},
    assetRefs: [],
  })),
};

export const demoResume: ResumeView = {
  id: "resume-demo",
  slug: "demo",
  title: "Alex Morgan Resume",
  status: "PUBLISHED",
  density: "COMFORTABLE",
  version: demoVersion,
  visibleSections: ["summary", "experience", "projects", "proof", "links"],
};
