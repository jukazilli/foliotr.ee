import { z } from "zod";
import { questions } from "./questions";

export const METHOD_VERSION = "vocational-v1";

export const userMomentSchema = z.enum([
  "escolhendoFaculdade",
  "migracaoCarreira",
  "insatisfacaoProfissional",
  "autoconhecimento",
  "outro",
]);

export const userProfileSchema = z.object({
  name: z.string().trim().max(120).default(""),
  moment: userMomentSchema.default("escolhendoFaculdade"),
  goal: z.string().trim().max(1200).default(""),
});

export const answersSchema = z.record(
  z.string(),
  z.coerce.number().int().min(1).max(5)
);

export const saveSessionSchema = z.object({
  profile: userProfileSchema,
  answers: answersSchema,
  currentQuestionIndex: z.coerce
    .number()
    .int()
    .min(0)
    .max(questions.length - 1)
    .default(0),
});

export const completeSessionSchema = z.object({
  profile: userProfileSchema,
  answers: answersSchema,
});

export function getMissingRequiredAnswers(answers: Record<string, number>) {
  return questions
    .filter((question) => !Number.isInteger(answers[question.id]))
    .map((question) => question.id);
}

export function assertCompleteAnswers(answers: Record<string, number>) {
  const missing = getMissingRequiredAnswers(answers);

  if (missing.length > 0) {
    return {
      ok: false as const,
      missing,
    };
  }

  return { ok: true as const };
}
