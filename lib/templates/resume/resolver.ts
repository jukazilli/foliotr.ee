import type { ResumeProjection, ResumeProjectionInput } from "@/lib/templates/resume/types";
import { getTemplateImplementationOrThrow } from "@/lib/templates/template-registry";

export function resolveTemplateResumeProjection(
  input: ResumeProjectionInput
): ResumeProjection {
  return getTemplateImplementationOrThrow(input.templateSlug).resumeProjector(input);
}
