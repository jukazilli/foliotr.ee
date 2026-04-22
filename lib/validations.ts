import { z } from "zod";

export const usernameSchema = z
  .string()
  .trim()
  .min(3, "Nome de usuario deve ter pelo menos 3 caracteres")
  .max(20, "Nome de usuario deve ter no maximo 20 caracteres")
  .regex(
    /^[a-z0-9._-]+$/,
    "Apenas letras minusculas, numeros, ponto, underline e hifen sao permitidos"
  );

const cuidSchema = z.string().cuid("Identificador invalido");

const emailSchema = z
  .string()
  .trim()
  .email("E-mail invalido")
  .transform((email) => email.toLowerCase());

export const passwordSchema = z
  .string()
  .min(8, "Senha deve ter pelo menos 8 caracteres")
  .max(128, "Senha deve ter no maximo 128 caracteres");

function isInternalAssetProxyUrl(value: string) {
  return value.startsWith("/api/assets/proxy?key=");
}

function isInternalAssetUrl(value: string) {
  return isInternalAssetProxyUrl(value) || value.startsWith("/uploads/");
}

const nullableUrlSchema = z.string().url("URL invalida").optional().or(z.literal(""));
export const nullableAssetUrlSchema = z
  .string()
  .trim()
  .refine(
    (value) =>
      value.length === 0 ||
      isInternalAssetUrl(value) ||
      z.string().url().safeParse(value).success,
    {
      message: "URL invalida",
    }
  )
  .optional()
  .or(z.literal(""));
const nullableStringSchema = z.string().optional().or(z.literal(""));

export const publishStateSchema = z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"], {
  errorMap: () => ({ message: "Estado de publicacao invalido" }),
});

export const assetKindSchema = z.enum(
  ["IMAGE", "DOCUMENT", "VIDEO", "AUDIO", "OTHER"],
  {
    errorMap: () => ({ message: "Tipo de asset invalido" }),
  }
);

export const assetStatusSchema = z.enum(["PENDING", "READY", "FAILED"], {
  errorMap: () => ({ message: "Status de asset invalido" }),
});

const safeAssetMetadataValueSchema = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.null(),
]);

const safeJsonValueSchema: z.ZodType<unknown> = z.lazy(() =>
  z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.null(),
    z.array(safeJsonValueSchema),
    z.record(safeJsonValueSchema),
  ])
);

export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const registerSchema = z
  .object({
    name: z.string().trim().min(2, "Nome deve ter pelo menos 2 caracteres"),
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Confirme sua senha"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas nao coincidem",
    path: ["confirmPassword"],
  });

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z
  .object({
    token: z.string().trim().min(32, "Token invalido").max(256, "Token invalido"),
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Confirme sua senha"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas nao coincidem",
    path: ["confirmPassword"],
  });

export const onboardingSchema = z.object({
  username: usernameSchema,
  headline: z
    .string()
    .min(5, "Titulo profissional deve ter pelo menos 5 caracteres")
    .max(120, "Titulo profissional deve ter no maximo 120 caracteres"),
  focus: z
    .enum(["developer", "designer", "product", "marketing", "freelancer", "other"], {
      errorMap: () => ({ message: "Selecione uma area de atuacao valida" }),
    })
    .optional(),
});

export const profileSchema = z.object({
  displayName: z.string().max(120, "Nome muito longo").optional(),
  avatarUrl: nullableAssetUrlSchema,
  headline: z.string().max(120, "Titulo deve ter no maximo 120 caracteres").optional(),
  bio: z.string().max(500, "Bio deve ter no maximo 500 caracteres").optional(),
  location: z.string().max(120, "Localizacao muito longa").optional(),
  pronouns: z.string().max(40, "Pronomes muito longos").optional(),
  websiteUrl: nullableUrlSchema,
  publicEmail: z.string().email("E-mail publico invalido").optional().or(z.literal("")),
  phone: z.string().max(40, "Telefone muito longo").optional(),
  birthDate: z.coerce.date().optional().nullable(),
});

export const assetInputSchema = z.object({
  id: cuidSchema.optional(),
  kind: assetKindSchema.default("IMAGE"),
  status: assetStatusSchema.default("READY"),
  url: z
    .string()
    .trim()
    .refine(
      (value) => isInternalAssetUrl(value) || z.string().url().safeParse(value).success,
      {
        message: "URL do asset invalida",
      }
    ),
  storageKey: z.string().trim().min(1, "Storage key obrigatoria").max(255),
  name: nullableStringSchema,
  altText: nullableStringSchema,
  mimeType: z.string().trim().min(1, "Mime type obrigatorio").max(120),
  size: z
    .number()
    .int()
    .min(0, "Tamanho invalido")
    .max(25 * 1024 * 1024),
  width: z.number().int().min(1).max(12000).optional().nullable(),
  height: z.number().int().min(1).max(12000).optional().nullable(),
  metadata: z.record(safeAssetMetadataValueSchema).default({}),
});

export const experienceSchema = z.object({
  id: cuidSchema.optional(),
  company: z.string().min(1, "Empresa e obrigatoria"),
  role: z.string().min(1, "Cargo e obrigatorio"),
  description: z.string().max(2000, "Descricao muito longa").optional(),
  startDate: z.coerce.date({
    errorMap: () => ({ message: "Data de inicio invalida" }),
  }),
  endDate: z.coerce.date().optional().nullable(),
  current: z.boolean().default(false),
  location: z.string().max(120, "Localizacao muito longa").optional(),
  logoUrl: nullableAssetUrlSchema,
  logoAssetId: cuidSchema.optional().nullable(),
});

export const educationSchema = z.object({
  id: cuidSchema.optional(),
  institution: z.string().min(1, "Instituicao e obrigatoria"),
  degree: z.string().optional(),
  field: z.string().optional(),
  startDate: z.coerce.date({
    errorMap: () => ({ message: "Data de inicio invalida" }),
  }),
  endDate: z.coerce.date().optional().nullable(),
  current: z.boolean().default(false),
  description: z.string().optional(),
  logoUrl: nullableAssetUrlSchema,
});

export const skillSchema = z.object({
  id: cuidSchema.optional(),
  name: z.string().min(1, "Nome da habilidade e obrigatorio"),
  category: z.string().optional(),
  level: z
    .enum(["beginner", "intermediate", "advanced", "expert"], {
      errorMap: () => ({ message: "Nivel invalido" }),
    })
    .optional(),
});

export const projectSchema = z.object({
  id: cuidSchema.optional(),
  title: z.string().min(1, "Titulo do projeto e obrigatorio"),
  description: z.string().max(2000, "Descricao muito longa").optional(),
  imageUrl: nullableAssetUrlSchema,
  url: nullableUrlSchema,
  repoUrl: nullableUrlSchema,
  tags: z.array(z.string().trim().min(1)).default([]),
  featured: z.boolean().default(false),
  coverAssetId: cuidSchema.optional().nullable(),
  coverFitMode: z.enum(["fit", "fill", "crop"]).default("crop"),
  coverPositionX: z.coerce.number().int().min(0).max(100).default(50),
  coverPositionY: z.coerce.number().int().min(0).max(100).default(50),
  startDate: z.coerce.date().optional().nullable(),
  endDate: z.coerce.date().optional().nullable(),
});

export const achievementSchema = z.object({
  id: cuidSchema.optional(),
  title: z.string().min(1, "Titulo da conquista e obrigatorio"),
  description: z.string().max(500, "Descricao muito longa").optional(),
  date: z.coerce.date().optional().nullable(),
  metric: z.string().max(140, "Metrica muito longa").optional(),
  imageUrl: nullableAssetUrlSchema,
  assetId: cuidSchema.optional().nullable(),
});

export const highlightSchema = z.object({
  id: cuidSchema.optional(),
  title: z.string().trim().min(1, "Titulo do highlight e obrigatorio"),
  description: z.string().max(500, "Descricao muito longa").optional(),
  metric: z.string().max(140, "Metrica muito longa").optional(),
  assetId: cuidSchema.optional().nullable(),
});

export const proofSchema = z.object({
  id: cuidSchema.optional(),
  title: z.string().trim().min(1, "Titulo da prova e obrigatorio"),
  description: z.string().max(500, "Descricao muito longa").optional(),
  metric: z.string().max(140, "Metrica muito longa").optional(),
  url: nullableUrlSchema,
  imageUrl: nullableAssetUrlSchema,
  assetId: cuidSchema.optional().nullable(),
  tags: z.array(z.string().trim().min(1)).default([]),
});

export const profileLinkSchema = z.object({
  id: cuidSchema.optional(),
  platform: z.string().trim().min(1, "Plataforma e obrigatoria").max(60),
  url: z.string().url("URL do link invalida"),
  label: nullableStringSchema,
});

export const versionSelectionSchema = z.object({
  experienceIds: z.array(cuidSchema).default([]),
  educationIds: z.array(cuidSchema).default([]),
  projectIds: z.array(cuidSchema).default([]),
  skillIds: z.array(cuidSchema).default([]),
  achievementIds: z.array(cuidSchema).default([]),
  proofIds: z.array(cuidSchema).default([]),
  highlightIds: z.array(cuidSchema).default([]),
  linkIds: z.array(cuidSchema).default([]),
});

export const versionSchema = z.object({
  name: z.string().min(1, "Nome da versao e obrigatorio"),
  description: z.string().max(500, "Descricao muito longa").optional(),
  context: z.string().max(120, "Contexto muito longo").optional(),
  emoji: z.string().max(2, "Emoji deve ter no maximo 2 caracteres").optional(),
  customHeadline: z.string().max(120, "Headline muito longa").optional(),
  customBio: z.string().max(500, "Bio muito longa").optional(),
  isDefault: z.boolean().optional(),
  selections: versionSelectionSchema.optional(),
});

export const profileBaseSchema = profileSchema.extend({
  assets: z.array(assetInputSchema).optional(),
  highlights: z.array(highlightSchema).optional(),
  experiences: z.array(experienceSchema).optional(),
  educations: z.array(educationSchema).optional(),
  skills: z.array(skillSchema).optional(),
  projects: z.array(projectSchema).optional(),
  achievements: z.array(achievementSchema).optional(),
  proofs: z.array(proofSchema).optional(),
  links: z.array(profileLinkSchema).optional(),
});

export const pageOutputSchema = z.object({
  title: nullableStringSchema,
  slug: usernameSchema,
  templateId: cuidSchema,
  publishState: publishStateSchema.default("DRAFT"),
});

export const resumeOutputSchema = z.object({
  sections: z.array(z.string().trim().min(1)).default([]),
  layout: z.string().trim().min(1).max(40).default("classic"),
  accentColor: nullableStringSchema,
  showPhoto: z.boolean().default(true),
  showLinks: z.boolean().default(true),
  publishState: publishStateSchema.default("DRAFT"),
});

export const pageBlockCreateSchema = z.object({
  templateBlockKey: z.string().trim().min(1).max(120),
  parentId: cuidSchema.optional().nullable(),
  order: z.number().int().min(0).max(500).optional(),
  visible: z.boolean().optional(),
  config: z.record(safeJsonValueSchema).optional(),
  props: z.record(safeJsonValueSchema).optional(),
  assets: z.record(safeJsonValueSchema).optional(),
});

export const pageBlockUpdateSchema = z.object({
  parentId: cuidSchema.optional().nullable(),
  order: z.number().int().min(0).max(500).optional(),
  visible: z.boolean().optional(),
  config: z.record(safeJsonValueSchema).optional(),
  props: z.record(safeJsonValueSchema).optional(),
  assets: z.record(safeJsonValueSchema).optional(),
});

export const pageBlockReorderSchema = z.object({
  blockIds: z.array(cuidSchema).min(1).max(50),
});

export const pageBlockBulkItemSchema = z.object({
  id: z.string().min(1).max(120),
  templateBlockDefId: cuidSchema.nullable().optional(),
  parentId: z.string().min(1).max(120).nullable().optional(),
  key: z.string().min(1).max(180),
  blockType: z.string().min(1).max(120),
  order: z.number().int().min(0).max(500),
  visible: z.boolean().default(true),
  config: z.record(safeJsonValueSchema).default({}),
  props: z.record(safeJsonValueSchema).default({}),
  assets: z.record(safeJsonValueSchema).default({}),
});

export const pageBlockBulkSaveSchema = z.object({
  blocks: z.array(pageBlockBulkItemSchema).max(120),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type UsernameInput = z.infer<typeof usernameSchema>;
export type OnboardingInput = z.infer<typeof onboardingSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
export type ProfileBaseInput = z.infer<typeof profileBaseSchema>;
export type AssetInput = z.infer<typeof assetInputSchema>;
export type ExperienceInput = z.infer<typeof experienceSchema>;
export type EducationInput = z.infer<typeof educationSchema>;
export type SkillInput = z.infer<typeof skillSchema>;
export type ProjectInput = z.infer<typeof projectSchema>;
export type AchievementInput = z.infer<typeof achievementSchema>;
export type HighlightInput = z.infer<typeof highlightSchema>;
export type ProofInput = z.infer<typeof proofSchema>;
export type ProfileLinkInput = z.infer<typeof profileLinkSchema>;
export type VersionInput = z.infer<typeof versionSchema>;
export type VersionSelectionInput = z.infer<typeof versionSelectionSchema>;
export type PageOutputInput = z.infer<typeof pageOutputSchema>;
export type ResumeOutputInput = z.infer<typeof resumeOutputSchema>;
export type PageBlockCreateInput = z.infer<typeof pageBlockCreateSchema>;
export type PageBlockUpdateInput = z.infer<typeof pageBlockUpdateSchema>;
export type PageBlockReorderInput = z.infer<typeof pageBlockReorderSchema>;
export type PageBlockBulkSaveInput = z.infer<typeof pageBlockBulkSaveSchema>;
