import Link from "next/link"
import { ArrowRight, Sparkles } from "lucide-react"

export default function Hero() {
  return (
    <section className="relative min-h-[calc(100vh-4rem)] bg-blue-900 overflow-hidden">
      {/* Subtle background texture */}
      <div className="pointer-events-none absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-lime-500 via-transparent to-transparent" />
      </div>

      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl flex-col items-center justify-center gap-12 px-4 py-16 sm:px-6 lg:flex-row lg:items-center lg:gap-16 lg:py-24">
        {/* Left column — copy */}
        <div className="flex flex-1 flex-col items-start gap-8">
          {/* Eyebrow */}
          <span className="inline-flex items-center gap-2 rounded-full border border-lime-500/30 bg-lime-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-lime-500">
            <Sparkles size={12} />
            Presença profissional real
          </span>

          {/* Headline */}
          <div className="font-display">
            <h1 className="text-5xl font-extrabold leading-tight tracking-tight text-lime-500 sm:text-6xl lg:text-7xl">
              Mostre mais
            </h1>
            <h1 className="text-5xl font-extrabold leading-tight tracking-tight text-white sm:text-6xl lg:text-7xl">
              do que um perfil.
            </h1>
          </div>

          {/* Subheadline */}
          <p className="max-w-md text-lg leading-relaxed text-white/75">
            Organize sua trajetória profissional em um só lugar e mostre seu valor com muito mais presença.
          </p>

          {/* CTAs */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href="/cadastro"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-lime-500 px-7 py-3.5 text-base font-bold text-lime-900 shadow-lg shadow-lime-500/20 hover:bg-lime-400 transition-colors"
            >
              Criar minha conta
              <ArrowRight size={18} />
            </Link>
            <a
              href="#exemplos"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/30 px-7 py-3.5 text-base font-medium text-white hover:bg-white/10 transition-colors"
            >
              Ver exemplo
            </a>
          </div>

          {/* Social proof */}
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              {["MB", "LC", "RK", "AP"].map((initials) => (
                <div
                  key={initials}
                  className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-blue-900 bg-blue-700 text-xs font-bold text-white"
                >
                  {initials}
                </div>
              ))}
            </div>
            <p className="text-sm text-white/60">
              <span className="font-semibold text-white">+2.400 pessoas</span> já criaram seu FolioTree
            </p>
          </div>
        </div>

        {/* Right column — mockup visual */}
        <div className="w-full max-w-sm flex-shrink-0 lg:max-w-md" id="exemplos">
          <div className="relative rounded-2xl bg-white p-6 shadow-2xl shadow-black/40 ring-1 ring-white/10">
            {/* Card header: avatar + name */}
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-xl font-bold text-white shadow-md">
                AM
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-neutral-900">Ana Martins</h3>
                <p className="text-sm text-neutral-500">Product Designer · São Paulo</p>
                <div className="mt-1 flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-lime-500" />
                  <span className="text-xs text-neutral-400">Disponível para projetos</span>
                </div>
              </div>
            </div>

            {/* Skill chips */}
            <div className="mt-4 flex flex-wrap gap-2">
              {["Figma", "Design System", "UX Research", "Prototyping", "Hotjar"].map((skill) => (
                <span
                  key={skill}
                  className="rounded-md bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-700"
                >
                  {skill}
                </span>
              ))}
            </div>

            {/* Divider */}
            <div className="my-4 h-px bg-neutral-100" />

            {/* Mini project cards */}
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-neutral-400">Projetos em destaque</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-neutral-100 bg-neutral-50 p-3">
                <div className="mb-2 h-16 rounded-lg bg-gradient-to-br from-blue-100 to-blue-200" />
                <p className="text-xs font-semibold text-neutral-800">App de Onboarding</p>
                <p className="mt-0.5 text-xs text-neutral-400">↑ 38% retenção</p>
              </div>
              <div className="rounded-xl border border-neutral-100 bg-neutral-50 p-3">
                <div className="mb-2 h-16 rounded-lg bg-gradient-to-br from-lime-100 to-lime-200" />
                <p className="text-xs font-semibold text-neutral-800">Design System</p>
                <p className="mt-0.5 text-xs text-neutral-400">3 produtos, 1 base</p>
              </div>
            </div>

            {/* Bottom link indicator */}
            <div className="mt-4 flex items-center justify-between rounded-lg bg-blue-900/5 px-3 py-2">
              <span className="text-xs text-neutral-500 font-mono">foliotr.ee/anamartins</span>
              <span className="rounded-full bg-lime-500 px-2.5 py-0.5 text-xs font-bold text-lime-900">Publicado</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
