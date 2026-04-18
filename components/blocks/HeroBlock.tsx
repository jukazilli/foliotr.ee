import { MapPin, ExternalLink, ArrowRight } from "lucide-react"
import { getPlatformLabel, getPlatformUrl, getInitials } from "@/lib/utils"
import type { BlockProps } from "./types"

interface HeroConfig {
  showAvatar?: boolean
  showBanner?: boolean
  ctaText?: string
  ctaUrl?: string
  layout?: "centered" | "left"
}

export default function HeroBlock({ profile, config, version }: BlockProps) {
  const {
    showAvatar = true,
    ctaText = "Entre em contato",
    ctaUrl,
    layout = "centered",
  } = config as HeroConfig

  const displayName = profile?.displayName ?? profile?.user?.name ?? "Sem nome"
  const headline = version?.customHeadline ?? profile?.headline
  const location = profile?.location
  const avatarUrl = profile?.avatarUrl
  const links: any[] = profile?.links ?? []

  const isCentered = layout === "centered"

  return (
    <section className="bg-white py-16">
      <div
        className={`mx-auto max-w-4xl px-4 sm:px-6 ${
          isCentered ? "flex flex-col items-center text-center" : "flex flex-col items-start"
        }`}
      >
        {/* Avatar */}
        {showAvatar && (
          <div className="mb-6">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={displayName}
                className="h-24 w-24 rounded-full object-cover ring-4 ring-neutral-100 shadow-md"
              />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-3xl font-bold text-white ring-4 ring-neutral-100 shadow-md">
                {getInitials(displayName)}
              </div>
            )}
          </div>
        )}

        {/* Name */}
        <h1 className="font-display text-4xl font-extrabold tracking-tight text-neutral-900 sm:text-5xl">
          {displayName}
        </h1>

        {/* Headline */}
        {headline && (
          <p className="mt-3 text-xl font-medium text-neutral-500 sm:text-2xl">{headline}</p>
        )}

        {/* Location */}
        {location && (
          <div className="mt-3 flex items-center gap-1.5 text-neutral-400">
            <MapPin size={15} />
            <span className="text-sm">{location}</span>
          </div>
        )}

        {/* Social links */}
        {links.length > 0 && (
          <div className={`mt-6 flex flex-wrap gap-2 ${isCentered ? "justify-center" : ""}`}>
            {links.map((link: any) => {
              const url = getPlatformUrl(link.platform, link.url)
              const label = link.label ?? getPlatformLabel(link.platform)
              return (
                <a
                  key={link.id}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-sm font-medium text-neutral-700 hover:border-neutral-300 hover:bg-neutral-100 transition-colors"
                >
                  {label}
                  <ExternalLink size={12} className="text-neutral-400" />
                </a>
              )
            })}
          </div>
        )}

        {/* CTA */}
        {ctaUrl && (
          <a
            href={ctaUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-lime-500 px-6 py-3 text-base font-bold text-lime-900 hover:bg-lime-400 transition-colors"
          >
            {ctaText}
            <ArrowRight size={16} />
          </a>
        )}
      </div>
    </section>
  )
}
