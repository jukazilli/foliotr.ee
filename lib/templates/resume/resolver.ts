import type { ResumeProjection, ResumeProjectionInput } from "@/lib/templates/resume/types";
import { projectPortfolioCommunityResume } from "@/lib/templates/resume/portfolio-community";

export function resolveTemplateResumeProjection(
  input: ResumeProjectionInput
): ResumeProjection {
  if (input.templateSlug === "portfolio-community") {
    return projectPortfolioCommunityResume(input);
  }

  return projectPortfolioCommunityResume(input);
}
