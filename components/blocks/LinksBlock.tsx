import { ExternalLink } from "lucide-react"
import { getPlatformLabel, getPlatformUrl } from "@/lib/utils"
import type { BlockProps } from "./types"

interface LinksConfig {
  title?: string
  layout?: "grid" | "list"
}

export default function LinksBlock({ profile, config }: BlockProps) {
  const { title = "Links", layout = "grid" } = config as LinksConfig

  const links: any[] = profile?.links ?? []

  if (links.length === 0) return null

  return (
    <section className="bg-white py-12">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <h2 className="font-display text-xl font-bold text-neutral-900">{title}</h2>
        <div className="mt-1 h-0.5 w-10 rounded-full bg-lime-500" />

        {layout === "grid" ? (
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {links.map((link: any) => {
              const url = getPlatformUrl(link.platform, link.url)
              const label = link.label ?? getPlatformLabel(link.platform)
              return (
                <a
                  key={link.id}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-between gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm font-medium text-neutral-700 hover:border-blue-300 hover:bg-blue-50/50 hover:text-blue-700 transition-colors"
                >
                  <span className="truncate">{label}</span>
                  <ExternalLink
                    size={13}
                    className="flex-shrink-0 text-neutral-300 group-hover:text-blue-400 transition-colors"
                  />
                </a>
              )
            })}
          </div>
        ) : (
          <ul className="mt-6 flex flex-col gap-2">
            {links.map((link: any) => {
              const url = getPlatformUrl(link.platform, link.url)
              const label = link.label ?? getPlatformLabel(link.platform)
              return (
                <li key={link.id}>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-2 text-sm font-medium text-neutral-700 hover:text-blue-600 transition-colors"
                  >
                    <ExternalLink size={13} className="text-neutral-300 group-hover:text-blue-400" />
                    {label}
                    <span className="text-xs text-neutral-400 font-normal font-mono truncate max-w-xs">
                      {url}
                    </span>
                  </a>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </section>
  )
}
