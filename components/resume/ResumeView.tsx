import { formatDate, getPlatformLabel, getPlatformUrl } from "@/lib/utils"

interface ResumeViewProps {
  profile: any
  version?: any
  config?: any
}

function formatPeriod(startDate: string | Date, endDate: string | Date | null, current: boolean): string {
  const start = formatDate(startDate, "year-month")
  if (current) return `${start} – Atual`
  if (!endDate) return start
  const end = formatDate(endDate, "year-month")
  return `${start} – ${end}`
}

export default function ResumeView({ profile, version, config }: ResumeViewProps) {
  const accentColor = config?.accentColor ?? "#2756AF" // blue-600 default
  const showPhoto = config?.showPhoto ?? false // resume: sem foto por padrão
  const showLinks = config?.showLinks ?? true

  const displayName = profile?.displayName ?? profile?.user?.name ?? ""
  const headline = version?.customHeadline ?? profile?.headline
  const bio = version?.customBio ?? profile?.bio
  const location = profile?.location
  const publicEmail = profile?.publicEmail ?? profile?.user?.email
  const phone = profile?.phone
  const links: any[] = profile?.links ?? []

  // Gather all data, then filter by version if needed
  let experiences: any[] = profile?.experiences ?? []
  let educations: any[] = profile?.educations ?? []
  let skills: any[] = profile?.skills ?? []
  let projects: any[] = profile?.projects ?? []
  let achievements: any[] = profile?.achievements ?? []

  if (version?.selectedExperienceIds?.length) {
    experiences = experiences.filter((e: any) => version.selectedExperienceIds.includes(e.id))
  }
  if (version?.selectedProjectIds?.length) {
    projects = projects.filter((p: any) => version.selectedProjectIds.includes(p.id))
  }
  if (version?.selectedSkillIds?.length) {
    skills = skills.filter((s: any) => version.selectedSkillIds.includes(s.id))
  }
  if (version?.selectedAchievementIds?.length) {
    achievements = achievements.filter((a: any) => version.selectedAchievementIds.includes(a.id))
  }

  // Sort
  experiences = [...experiences].sort((a, b) => {
    if (a.order !== b.order) return a.order - b.order
    return new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
  })
  educations = [...educations].sort((a, b) => {
    if (a.order !== b.order) return a.order - b.order
    return new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
  })
  skills = [...skills].sort((a, b) => a.order - b.order)
  projects = [...projects].sort((a, b) => {
    if (a.featured !== b.featured) return b.featured ? 1 : -1
    return a.order - b.order
  })
  achievements = [...achievements].sort((a, b) => a.order - b.order)

  // Group skills by category
  const skillGroups = skills.reduce<Record<string, any[]>>((acc, skill) => {
    const cat = skill.category ?? "Geral"
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(skill)
    return acc
  }, {})

  return (
    <div
      className="bg-white font-sans text-neutral-900 print:text-black"
      style={{ "--accent": accentColor } as React.CSSProperties}
    >
      {/* ── HEADER ─────────────────────────────────────────────────── */}
      <header className="border-b border-neutral-200 pb-6 print:pb-4">
        <h1
          className="font-display text-3xl font-extrabold tracking-tight"
          style={{ color: accentColor }}
        >
          {displayName}
        </h1>

        {headline && (
          <p className="mt-1 text-lg font-medium text-neutral-600">{headline}</p>
        )}

        {/* Contact line */}
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-neutral-500">
          {location && <span>{location}</span>}
          {publicEmail && (
            <a
              href={`mailto:${publicEmail}`}
              className="hover:text-neutral-700 transition-colors"
              style={{ color: accentColor }}
            >
              {publicEmail}
            </a>
          )}
          {phone && <span>{phone}</span>}
          {showLinks &&
            links.map((link: any) => {
              const url = getPlatformUrl(link.platform, link.url)
              const label = link.label ?? getPlatformLabel(link.platform)
              return (
                <a
                  key={link.id}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:underline"
                  style={{ color: accentColor }}
                >
                  {label}
                </a>
              )
            })}
        </div>
      </header>

      {/* ── BODY ───────────────────────────────────────────────────── */}
      <div className="mt-6 flex flex-col gap-8 print:gap-6">
        {/* Resumo profissional */}
        {bio && (
          <section>
            <SectionTitle color={accentColor}>Resumo profissional</SectionTitle>
            <p className="mt-2 text-sm leading-7 text-neutral-700 whitespace-pre-line">{bio}</p>
          </section>
        )}

        {/* Experiência */}
        {experiences.length > 0 && (
          <section>
            <SectionTitle color={accentColor}>Experiência</SectionTitle>
            <div className="mt-3 flex flex-col gap-5">
              {experiences.map((exp: any) => (
                <div key={exp.id}>
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <div>
                      <span className="font-semibold text-neutral-900">{exp.company}</span>
                      <span className="mx-2 text-neutral-300">·</span>
                      <span className="text-neutral-700">{exp.role}</span>
                      {exp.current && (
                        <span
                          className="ml-2 rounded px-1.5 py-0.5 text-xs font-bold"
                          style={{ backgroundColor: `${accentColor}15`, color: accentColor }}
                        >
                          Atual
                        </span>
                      )}
                    </div>
                    <span className="flex-shrink-0 text-xs text-neutral-400">
                      {formatPeriod(exp.startDate, exp.endDate, exp.current)}
                      {exp.location ? ` · ${exp.location}` : ""}
                    </span>
                  </div>
                  {exp.description && (
                    <p className="mt-1.5 text-sm leading-6 text-neutral-600 whitespace-pre-line">
                      {exp.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Formação */}
        {educations.length > 0 && (
          <section>
            <SectionTitle color={accentColor}>Formação</SectionTitle>
            <div className="mt-3 flex flex-col gap-4">
              {educations.map((edu: any) => (
                <div key={edu.id}>
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <div>
                      <span className="font-semibold text-neutral-900">{edu.institution}</span>
                      {(edu.degree || edu.field) && (
                        <>
                          <span className="mx-2 text-neutral-300">·</span>
                          <span className="text-neutral-700">
                            {[edu.degree, edu.field].filter(Boolean).join(", ")}
                          </span>
                        </>
                      )}
                    </div>
                    <span className="flex-shrink-0 text-xs text-neutral-400">
                      {formatPeriod(edu.startDate, edu.endDate, edu.current)}
                    </span>
                  </div>
                  {edu.description && (
                    <p className="mt-1 text-sm text-neutral-600">{edu.description}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Habilidades */}
        {skills.length > 0 && (
          <section>
            <SectionTitle color={accentColor}>Habilidades</SectionTitle>
            <div className="mt-3 flex flex-col gap-2">
              {Object.entries(skillGroups).map(([cat, items]) => (
                <div key={cat} className="flex flex-wrap items-start gap-x-1 text-sm">
                  {Object.keys(skillGroups).length > 1 && (
                    <span className="font-semibold text-neutral-700 mr-1">{cat}:</span>
                  )}
                  <span className="text-neutral-600">{items.map((s) => s.name).join(", ")}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Projetos */}
        {projects.length > 0 && (
          <section>
            <SectionTitle color={accentColor}>Projetos</SectionTitle>
            <div className="mt-3 flex flex-col gap-4">
              {projects.map((proj: any) => (
                <div key={proj.id}>
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <span className="font-semibold text-neutral-900">{proj.title}</span>
                    {proj.url && (
                      <a
                        href={proj.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs hover:underline"
                        style={{ color: accentColor }}
                      >
                        {proj.url}
                      </a>
                    )}
                  </div>
                  {proj.description && (
                    <p className="mt-1 text-sm leading-6 text-neutral-600">{proj.description}</p>
                  )}
                  {proj.tags?.length > 0 && (
                    <p className="mt-1 text-xs text-neutral-400">{proj.tags.join(" · ")}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Conquistas */}
        {achievements.length > 0 && (
          <section>
            <SectionTitle color={accentColor}>Conquistas</SectionTitle>
            <div className="mt-3 flex flex-col gap-4">
              {achievements.map((ach: any) => (
                <div key={ach.id}>
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <span className="font-semibold text-neutral-900">{ach.title}</span>
                    {ach.date && (
                      <span className="text-xs text-neutral-400">
                        {formatDate(ach.date, "year-month")}
                      </span>
                    )}
                  </div>
                  {ach.metric && (
                    <p className="text-sm font-medium" style={{ color: accentColor }}>
                      {ach.metric}
                    </p>
                  )}
                  {ach.description && (
                    <p className="mt-1 text-sm text-neutral-600">{ach.description}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}

function SectionTitle({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <div className="flex items-center gap-3">
      <h2 className="font-display text-sm font-bold uppercase tracking-widest" style={{ color }}>
        {children}
      </h2>
      <div className="flex-1 h-px bg-neutral-200" />
    </div>
  )
}
