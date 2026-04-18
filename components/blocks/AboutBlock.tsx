import { MapPin, ExternalLink } from "lucide-react"
import { getPlatformLabel, getPlatformUrl } from "@/lib/utils"
import type { BlockProps } from "./types"

interface AboutConfig {
  title?: string
  showLocation?: boolean
  showLinks?: boolean
}

export default function AboutBlock({ profile, config, version }: BlockProps) {
  const {
    title = "Sobre mim",
    showLocation = true,
    showLinks = true,
  } = config as AboutConfig

  const bio = version?.customBio ?? profile?.bio
  const location = profile?.location
  const links: any[] = profile?.links ?? []

  if (!bio && !location) return null

  return (
    <section className="bg-white py-12">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <h2 className="font-display text-xl font-bold text-neutral-900">{title}</h2>
        <div className="mt-1 h-0.5 w-10 rounded-full bg-lime-500" />

        {bio && (
          <p className="mt-5 max-w-2xl text-base leading-8 text-neutral-600 whitespace-pre-line">
            {bio}
          </p>
        )}

        {showLocation && location && (
          <div className="mt-4 flex items-center gap-1.5 text-neutral-400">
            <MapPin size={14} />
            <span className="text-sm">{location}</span>
          </div>
        )}

        {showLinks && links.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-2">
            {links.map((link: any) => {
              const url = getPlatformUrl(link.platform, link.url)
              const label = link.label ?? getPlatformLabel(link.platform)
              return (
                <a
                  key={link.id}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                >
                  {label}
                  <ExternalLink size={12} />
                </a>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
