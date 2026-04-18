import { MapPin, Building2 } from "lucide-react"
import { formatDate, getInitials } from "@/lib/utils"
import type { BlockProps } from "./types"

interface ExperienceConfig {
  title?: string
  maxItems?: number
  showCompanyLogo?: boolean
  showCurrentBadge?: boolean
}

function formatPeriod(startDate: string | Date, endDate: string | Date | null, current: boolean): string {
  const start = formatDate(startDate, "year-month")
  if (current) return `${start} · Atual`
  if (!endDate) return start
  const end = formatDate(endDate, "year-month")
  return `${start} — ${end}`
}

export default function ExperienceBlock({ profile, config, version }: BlockProps) {
  const {
    title = "Experiência",
    maxItems,
    showCompanyLogo = true,
    showCurrentBadge = true,
  } = config as ExperienceConfig

  // Filter by version selectedExperienceIds if present
  let experiences: any[] = profile?.experiences ?? []
  if (version?.selectedExperienceIds?.length) {
    experiences = experiences.filter((e: any) =>
      version.selectedExperienceIds.includes(e.id)
    )
  }

  // Sort by order then by startDate desc
  experiences = [...experiences].sort((a, b) => {
    if (a.order !== b.order) return a.order - b.order
    return new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
  })

  if (maxItems) experiences = experiences.slice(0, maxItems)

  if (experiences.length === 0) return null

  return (
    <section className="bg-white py-12">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <h2 className="font-display text-xl font-bold text-neutral-900">{title}</h2>
        <div className="mt-1 h-0.5 w-10 rounded-full bg-lime-500" />

        <div className="mt-6 flex flex-col gap-6">
          {experiences.map((exp: any) => (
            <div key={exp.id} className="flex gap-4">
              {/* Logo */}
              {showCompanyLogo && (
                <div className="flex-shrink-0">
                  {exp.logoUrl ? (
                    <img
                      src={exp.logoUrl}
                      alt={exp.company}
                      className="h-11 w-11 rounded-lg object-contain border border-neutral-100 bg-white p-1"
                    />
                  ) : (
                    <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-neutral-100 bg-neutral-50">
                      <Building2 size={20} className="text-neutral-400" />
                    </div>
                  )}
                </div>
              )}

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-display text-base font-semibold text-neutral-900">
                    {exp.role}
                  </span>
                  {showCurrentBadge && exp.current && (
                    <span className="rounded-md bg-lime-100 px-2 py-0.5 text-xs font-bold text-lime-800">
                      Atual
                    </span>
                  )}
                </div>

                <p className="mt-0.5 text-sm font-medium text-neutral-600">{exp.company}</p>

                <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-neutral-400">
                  <span>{formatPeriod(exp.startDate, exp.endDate, exp.current)}</span>
                  {exp.location && (
                    <span className="flex items-center gap-1">
                      <MapPin size={11} />
                      {exp.location}
                    </span>
                  )}
                </div>

                {exp.description && (
                  <p className="mt-2 text-sm leading-6 text-neutral-600 whitespace-pre-line">
                    {exp.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
