import { z } from "zod";

// ---------------------------------------------------------------------------
// Base schemas
// ---------------------------------------------------------------------------

export const usernameSchema = z
  .string()
  .min(3, "Nome de usuário deve ter pelo menos 3 caracteres")
  .max(20, "Nome de usuário deve ter no máximo 20 caracteres")
  .regex(
    /^[a-z0-9-]+$/,
    "Apenas letras minúsculas, números e hifens são permitidos"
  );

// ---------------------------------------------------------------------------
// Auth schemas
// ---------------------------------------------------------------------------

export const loginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(8, "Senha deve ter pelo menos 8 caracteres"),
});

export const registerSchema = z
  .object({
    name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
    email: z.string().email("E-mail inválido"),
    password: z.string().min(8, "Senha deve ter pelo menos 8 caracteres"),
    confirmPassword: z.string().min(1, "Confirme sua senha"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

// ---------------------------------------------------------------------------
// Onboarding schema
// ---------------------------------------------------------------------------

export const onboardingSchema = z.object({
  username: usernameSchema,
  headline: z
    .string()
    .min(5, "Título profissional deve ter pelo menos 5 caracteres")
    .max(120, "Título profissional deve ter no máximo 120 caracteres"),
  focus: z
    .enum(
      ["developer", "designer", "product", "marketing", "freelancer", "other"],
      {
        errorMap: () => ({ message: "Selecione uma área de atuação válida" }),
      }
    )
    .optional(),
});

// ---------------------------------------------------------------------------
// Profile schema
// ---------------------------------------------------------------------------

export const profileSchema = z.object({
  displayName: z.string().optional(),
  headline: z.string().max(120, "Título deve ter no máximo 120 caracteres").optional(),
  bio: z
    .string()
    .max(500, "Bio deve ter no máximo 500 caracteres")
    .optional(),
  location: z.string().optional(),
  pronouns: z.string().optional(),
  websiteUrl: z
    .string()
    .url("URL do site inválida")
    .optional()
    .or(z.literal("")),
  publicEmail: z
    .string()
    .email("E-mail público inválido")
    .optional()
    .or(z.literal("")),
  phone: z.string().optional(),
});

// ---------------------------------------------------------------------------
// Experience schema
// ---------------------------------------------------------------------------

export const experienceSchema = z.object({
  company: z.string().min(1, "Empresa é obrigatória"),
  role: z.string().min(1, "Cargo é obrigatório"),
  description: z.string().optional(),
  startDate: z.coerce.date({
    errorMap: () => ({ message: "Data de início inválida" }),
  }),
  endDate: z.coerce.date().optional().nullable(),
  current: z.boolean().default(false),
  location: z.string().optional(),
  logoUrl: z
    .string()
    .url("URL do logo inválida")
    .optional()
    .or(z.literal("")),
});

// ---------------------------------------------------------------------------
// Education schema
// ---------------------------------------------------------------------------

export const educationSchema = z.object({
  institution: z.string().min(1, "Instituição é obrigatória"),
  degree: z.string().optional(),
  field: z.string().optional(),
  startDate: z.coerce.date({
    errorMap: () => ({ message: "Data de início inválida" }),
  }),
  endDate: z.coerce.date().optional().nullable(),
  current: z.boolean().default(false),
  description: z.string().optional(),
  logoUrl: z
    .string()
    .url("URL do logo inválida")
    .optional()
    .or(z.literal("")),
});

// ---------------------------------------------------------------------------
// Skill schema
// ---------------------------------------------------------------------------

export const skillSchema = z.object({
  name: z.string().min(1, "Nome da habilidade é obrigatório"),
  category: z.string().optional(),
  level: z
    .enum(["beginner", "intermediate", "advanced", "expert"], {
      errorMap: () => ({ message: "Nível inválido" }),
    })
    .optional(),
});

// ---------------------------------------------------------------------------
// Project schema
// ---------------------------------------------------------------------------

export const projectSchema = z.object({
  title: z.string().min(1, "Título do projeto é obrigatório"),
  description: z.string().optional(),
  imageUrl: z
    .string()
    .url("URL da imagem inválida")
    .optional()
    .or(z.literal("")),
  url: z
    .string()
    .url("URL do projeto inválida")
    .optional()
    .or(z.literal("")),
  repoUrl: z
    .string()
    .url("URL do repositório inválida")
    .optional()
    .or(z.literal("")),
  tags: z.array(z.string()).default([]),
  featured: z.boolean().default(false),
  startDate: z.coerce.date().optional().nullable(),
  endDate: z.coerce.date().optional().nullable(),
});

// ---------------------------------------------------------------------------
// Achievement schema
// ---------------------------------------------------------------------------

export const achievementSchema = z.object({
  title: z.string().min(1, "Título da conquista é obrigatório"),
  description: z.string().optional(),
  date: z.coerce.date().optional().nullable(),
  metric: z.string().optional(),
});

// ---------------------------------------------------------------------------
// Version schema
// ---------------------------------------------------------------------------

export const versionSchema = z.object({
  name: z.string().min(1, "Nome da versão é obrigatório"),
  description: z.string().optional(),
  context: z.string().optional(),
  emoji: z
    .string()
    .max(2, "Emoji deve ter no máximo 2 caracteres")
    .optional(),
  customHeadline: z.string().optional(),
  customBio: z.string().optional(),
});

// ---------------------------------------------------------------------------
// Inferred types
// ---------------------------------------------------------------------------

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type UsernameInput = z.infer<typeof usernameSchema>;
export type OnboardingInput = z.infer<typeof onboardingSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
export type ExperienceInput = z.infer<typeof experienceSchema>;
export type EducationInput = z.infer<typeof educationSchema>;
export type SkillInput = z.infer<typeof skillSchema>;
export type ProjectInput = z.infer<typeof projectSchema>;
export type AchievementInput = z.infer<typeof achievementSchema>;
export type VersionInput = z.infer<typeof versionSchema>;
