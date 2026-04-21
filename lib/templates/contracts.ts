import { z } from "zod";

export const TEMPLATE_BLOCK_TYPES = [
  "hero",
  "about",
  "experience",
  "education",
  "skills",
  "projects",
  "achievements",
  "proof",
  "links",
  "contact",
  "portfolio.hero",
  "portfolio.about",
  "portfolio.education",
  "portfolio.experience",
  "portfolio.work",
  "portfolio.contact",
  "portfolio.custom-section",
] as const;

export type TemplateBlockType = (typeof TEMPLATE_BLOCK_TYPES)[number];

export const templateBlockTypeSchema = z.enum(TEMPLATE_BLOCK_TYPES);

function safeText(max: number) {
  return z.string().max(max).refine((value) => !/<\/?[a-z][\s\S]*>/i.test(value), {
    message: "HTML nao e permitido em campos de bloco",
  });
}

const safeTextSchema = safeText(4000);
const safeShortTextSchema = safeText(180);

const safeUrlSchema = z
  .string()
  .url()
  .refine((value) => ["http:", "https:"].includes(new URL(value).protocol), {
    message: "URL deve usar HTTP ou HTTPS",
  });

const safeContactUrlSchema = z
  .string()
  .url()
  .refine((value) => ["http:", "https:", "mailto:"].includes(new URL(value).protocol), {
    message: "URL deve usar HTTP, HTTPS ou mailto",
  });

const safeHrefSchema = z
  .string()
  .max(500)
  .refine(
    (value) =>
      value.startsWith("/") ||
      (value.startsWith("http://") || value.startsWith("https://")),
    { message: "Link deve ser relativo ou usar HTTP/HTTPS" }
  );

const safeAssetPathSchema = z
  .string()
  .max(500)
  .refine(
    (value) =>
      value.startsWith("/") ||
      (value.startsWith("https://") && !value.toLowerCase().startsWith("javascript:")),
    { message: "Imagem deve ser um caminho local publico ou URL HTTPS" }
  );

export const editableFieldSchema = z.object({
  key: z.string().min(1).max(80),
  label: z.string().min(1).max(120),
  element: z.enum([
    "section",
    "div",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "text",
    "image",
    "icon",
    "link",
    "button",
    "list",
    "group",
    "repeater",
  ]),
  kind: z.enum(["text", "longText", "url", "image", "boolean", "list"]),
  required: z.boolean().default(false),
});

export type EditableField = z.infer<typeof editableFieldSchema>;

const imageSchema = z.object({
  src: safeAssetPathSchema,
  alt: safeShortTextSchema.default(""),
  fitMode: z.enum(["fit", "fill", "crop"]).default("fill"),
  positionX: z.number().min(0).max(100).default(50),
  positionY: z.number().min(0).max(100).default(50),
});

const linkSchema = z.object({
  label: safeShortTextSchema,
  href: safeUrlSchema,
});

const portfolioHeroConfigSchema = z.object({
  eyebrow: safeShortTextSchema.default("Ola, eu sou"),
  name: safeShortTextSchema.optional(),
  headline: safeShortTextSchema.optional(),
  locationLine: safeShortTextSchema.optional(),
  ctaLabel: safeShortTextSchema.default("Curriculo"),
  ctaHref: safeHrefSchema.default("/resume"),
  portrait: imageSchema.optional(),
  navLinks: z.array(linkSchema).max(4).default([]),
  showSocialIcons: z.boolean().default(true),
  showPlusCluster: z.boolean().default(true),
  showSlashMarks: z.boolean().default(true),
});

const portfolioAboutConfigSchema = z.object({
  title: safeShortTextSchema.default("sobre."),
  body: safeTextSchema.optional(),
});

const portfolioExperienceConfigSchema = z.object({
  title: safeShortTextSchema.default("experiencia"),
  maxItems: z.number().int().min(1).max(8).default(3),
});

const portfolioWorkConfigSchema = z.object({
  title: safeShortTextSchema.default("projetos."),
  intro: safeTextSchema.optional(),
  maxItems: z.number().int().min(1).max(6).default(2),
  hiddenProjectIds: z.array(z.string().trim().min(1)).max(40).default([]),
  fallbackProjects: z
    .array(
      z.object({
        title: safeShortTextSchema,
        description: safeTextSchema,
        date: safeShortTextSchema.default("24 de novembro de 2019"),
        image: imageSchema.optional(),
        href: safeUrlSchema.optional(),
        hidden: z.boolean().default(false),
      })
    )
    .max(6)
    .default([]),
});

const portfolioContactConfigSchema = z.object({
  title: safeShortTextSchema.default("contato."),
  body: safeTextSchema.optional(),
  image: imageSchema.optional(),
  links: z.array(
    z.object({
      label: safeShortTextSchema,
      href: safeContactUrlSchema,
    })
  ).max(6).default([]),
});

const portfolioCustomSectionConfigSchema = z.object({
  title: safeShortTextSchema.default("nova secao"),
  body: safeTextSchema.optional(),
  image: imageSchema.optional(),
  imageAlign: z.enum(["left", "center", "right"]).default("center"),
  listItems: z
    .array(
      z.object({
        text: safeShortTextSchema,
      })
    )
    .max(8)
    .default([]),
});

const genericKnownConfigSchema = z
  .object({
    title: safeShortTextSchema.optional(),
    layout: safeShortTextSchema.optional(),
    maxItems: z.number().int().min(1).max(20).optional(),
    showImages: z.boolean().optional(),
    showLinks: z.boolean().optional(),
    showLocation: z.boolean().optional(),
    showAvatar: z.boolean().optional(),
    showBanner: z.boolean().optional(),
    ctaText: safeShortTextSchema.optional(),
    ctaUrl: safeUrlSchema.optional(),
  })
  .passthrough();

const blockConfigSchemas = {
  "portfolio.hero": portfolioHeroConfigSchema,
  "portfolio.about": portfolioAboutConfigSchema,
  "portfolio.education": genericKnownConfigSchema,
  "portfolio.experience": portfolioExperienceConfigSchema,
  "portfolio.work": portfolioWorkConfigSchema,
  "portfolio.contact": portfolioContactConfigSchema,
  "portfolio.custom-section": portfolioCustomSectionConfigSchema,
  hero: genericKnownConfigSchema,
  about: genericKnownConfigSchema,
  experience: genericKnownConfigSchema,
  education: genericKnownConfigSchema,
  skills: genericKnownConfigSchema,
  projects: genericKnownConfigSchema,
  achievements: genericKnownConfigSchema,
  proof: genericKnownConfigSchema,
  links: genericKnownConfigSchema,
  contact: genericKnownConfigSchema,
} satisfies Record<TemplateBlockType, z.ZodTypeAny>;

export function getBlockConfigSchema(blockType: string) {
  const typeResult = templateBlockTypeSchema.safeParse(blockType);

  if (!typeResult.success) {
    return null;
  }

  return blockConfigSchemas[typeResult.data];
}

export function validateBlockConfig(blockType: string, config: unknown) {
  const schema = getBlockConfigSchema(blockType);

  if (!schema) {
    return null;
  }

  return schema.parse(config ?? {});
}

export function safeParseBlockConfig(blockType: string, config: unknown) {
  const schema = getBlockConfigSchema(blockType);

  if (!schema) {
    return { success: false as const, data: null };
  }

  const result = schema.safeParse(config ?? {});
  return result.success
    ? { success: true as const, data: result.data }
    : { success: false as const, data: null };
}
