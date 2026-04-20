import { GraduationCap } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { BlockProps } from "./types";

interface EducationConfig {
  title?: string;
  maxItems?: number;
  showInstitutionLogo?: boolean;
}

function formatPeriod(
  startDate: string | Date,
  endDate: string | Date | null,
  current: boolean
): string {
  const start = formatDate(startDate, "year-month");
  if (current) return `${start} - Atual`;
  if (!endDate) return start;
  const end = formatDate(endDate, "year-month");
  return `${start} - ${end}`;
}

export default function EducationBlock({ profile, config, version }: BlockProps) {
  const {
    title = "Formacao",
    maxItems,
    showInstitutionLogo = true,
  } = config as EducationConfig;

  let educations = profile.educations;
  if (version?.selectedEducationIds?.length) {
    educations = educations.filter((education) =>
      version.selectedEducationIds?.includes(education.id)
    );
  }

  educations = [...educations].sort((left, right) => {
    if (left.order !== right.order) return left.order - right.order;
    return new Date(right.startDate).getTime() - new Date(left.startDate).getTime();
  });

  if (maxItems) educations = educations.slice(0, maxItems);
  if (educations.length === 0) return null;

  return (
    <section className="bg-white py-12">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <h2 className="font-display text-xl font-bold text-neutral-900">{title}</h2>
        <div className="mt-1 h-0.5 w-10 rounded-full bg-lime-500" />

        <div className="mt-6 flex flex-col gap-6">
          {educations.map((education) => (
            <div key={education.id} className="flex gap-4">
              {showInstitutionLogo ? (
                <div className="flex-shrink-0">
                  {education.logoUrl ? (
                    <img
                      src={education.logoUrl}
                      alt={education.institution}
                      className="h-11 w-11 rounded-lg border border-neutral-100 bg-white object-contain p-1"
                    />
                  ) : (
                    <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-neutral-100 bg-neutral-50">
                      <GraduationCap size={20} className="text-neutral-400" />
                    </div>
                  )}
                </div>
              ) : null}

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-display text-base font-semibold text-neutral-900">
                    {[education.degree, education.field].filter(Boolean).join(" - ") ||
                      education.institution}
                  </span>
                  {education.current ? (
                    <span className="rounded-md bg-lime-100 px-2 py-0.5 text-xs font-bold text-lime-800">
                      Atual
                    </span>
                  ) : null}
                </div>

                <p className="mt-0.5 text-sm font-medium text-neutral-600">
                  {education.institution}
                </p>
                <p className="mt-1 text-xs text-neutral-400">
                  {formatPeriod(education.startDate, education.endDate, education.current)}
                </p>

                {education.description ? (
                  <p className="mt-2 whitespace-pre-line text-sm leading-6 text-neutral-600">
                    {education.description}
                  </p>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
