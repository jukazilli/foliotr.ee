import { z } from "zod";

const storageProviderSchema = z.enum(["disabled", "vercel-blob", "s3"]);
const optionalUrlSchema = z.string().url().optional().or(z.literal(""));
const postgresUrlSchema = z
  .string()
  .url()
  .refine(
    (value) => value.startsWith("postgresql://") || value.startsWith("postgres://"),
    "must be a PostgreSQL connection URL"
  );

export const serverEnvSchema = z
  .object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    DATABASE_URL: postgresUrlSchema,
    DIRECT_URL: postgresUrlSchema,
    AUTH_SECRET: z.string().min(32, "AUTH_SECRET must have at least 32 characters"),
    NEXT_PUBLIC_APP_URL: z
      .string()
      .url("NEXT_PUBLIC_APP_URL must be a valid URL")
      .default("http://localhost:3000"),
    NEXT_PUBLIC_APP_NAME: z.string().min(1).default("FolioTree"),
    STORAGE_PROVIDER: storageProviderSchema.default("disabled"),
    STORAGE_MAX_FILE_SIZE_MB: z.coerce.number().int().positive().max(25).default(5),
    STORAGE_ALLOWED_IMAGE_TYPES: z
      .string()
      .min(1)
      .default("image/jpeg,image/png,image/webp"),
    STORAGE_S3_ENDPOINT: optionalUrlSchema,
    STORAGE_S3_REGION: z.string().trim().optional(),
    STORAGE_S3_BUCKET: z.string().trim().optional(),
    STORAGE_S3_ACCESS_KEY_ID: z.string().trim().optional(),
    STORAGE_S3_SECRET_ACCESS_KEY: z.string().trim().optional(),
    STORAGE_S3_TLS_REJECT_UNAUTHORIZED: z.coerce.boolean().default(true),
    STORAGE_PUBLIC_BASE_URL: optionalUrlSchema,
    NEXT_PUBLIC_SUPABASE_URL: optionalUrlSchema,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().trim().optional(),
  })
  .superRefine((env, ctx) => {
    if (env.STORAGE_PROVIDER !== "s3") return;

    for (const key of [
      "STORAGE_S3_ENDPOINT",
      "STORAGE_S3_REGION",
      "STORAGE_S3_BUCKET",
      "STORAGE_S3_ACCESS_KEY_ID",
      "STORAGE_S3_SECRET_ACCESS_KEY",
    ] as const) {
      if (!env[key]) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: [key],
          message: `${key} is required when STORAGE_PROVIDER=s3`,
        });
      }
    }
  });

export type ServerEnv = z.infer<typeof serverEnvSchema>;
export type StorageProvider = z.infer<typeof storageProviderSchema>;

let cachedEnv: ServerEnv | null = null;

export function parseServerEnv(input: NodeJS.ProcessEnv) {
  return serverEnvSchema.safeParse(input);
}

export function getEnv(): ServerEnv {
  if (cachedEnv) return cachedEnv;

  const parsed = parseServerEnv(process.env);
  if (!parsed.success) {
    throw new Error("Invalid environment configuration.");
  }

  cachedEnv = parsed.data;
  return cachedEnv;
}
