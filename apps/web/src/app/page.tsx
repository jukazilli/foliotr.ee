import { ArrowRight, BadgeCheck, Sparkles } from "lucide-react";
import { PublicShell } from "@/components/layout/public-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/ui/section";

const valueModules = [
  {
    title: "Profile",
    body: "One structured source for your professional identity, proof, links, projects, and story.",
    tone: "cyan" as const,
  },
  {
    title: "Versions",
    body: "Adapt the same base for recruiters, clients, freelance work, or a specific opportunity.",
    tone: "violet" as const,
  },
  {
    title: "Pages / Resumes",
    body: "Publish expressive pages and fast reading resumes from the same information.",
    tone: "coral" as const,
  },
];

export default function HomePage() {
  return (
    <PublicShell>
      <section className="relative overflow-hidden bg-[var(--ft-blue-500)] text-white">
        <div className="mx-auto grid min-h-[calc(100vh-76px)] max-w-7xl gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[1fr_0.92fr] lg:items-center">
          <div>
            <Badge tone="lime">LinkedIn shows. FolioTree proves.</Badge>
            <h1 className="mt-6 max-w-4xl font-display text-6xl font-[900] leading-[0.88] tracking-[-0.065em] text-[var(--ft-lime-500)] sm:text-7xl lg:text-8xl">
              Show more than a profile.
            </h1>
            <p className="mt-7 max-w-xl font-ui text-xl font-medium leading-8 text-white/86">
              Turn your trajectory, achievements, projects, and proof into a clear professional presence people understand in seconds.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Button href="/register">Create my FolioTree</Button>
              <Button href="/p/demo" variant="outline" className="bg-white/10 text-white">
                See sample page
              </Button>
            </div>
          </div>

          <div className="relative">
            <div className="rounded-2xl bg-white p-5 text-[var(--ft-neutral-900)] shadow-[0_24px_90px_rgba(0,0,0,0.18)]">
              <div className="rounded-xl bg-[var(--ft-neutral-100)] p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-data text-xs font-semibold uppercase tracking-[0.08em] text-[rgba(15,17,21,0.48)]">
                      Live profile
                    </p>
                    <h2 className="mt-2 font-display text-3xl font-[800] tracking-[-0.04em]">
                      Alex Morgan
                    </h2>
                  </div>
                  <Sparkles className="text-[var(--ft-blue-500)]" />
                </div>
                <div className="mt-6 grid gap-3">
                  {["Public page", "Resume mode", "Client snapshot"].map((item, index) => (
                    <div key={item} className="rounded-lg bg-white p-4">
                      <div className="flex items-center justify-between">
                        <p className="font-ui text-sm font-bold">{item}</p>
                        <span className="font-data text-xs font-semibold text-[var(--ft-green-900)]">
                          v{index + 1}
                        </span>
                      </div>
                      <div className="mt-3 h-2 rounded-full bg-[var(--ft-neutral-200)]">
                        <div
                          className="h-2 rounded-full bg-[var(--ft-lime-500)]"
                          style={{ width: `${72 - index * 12}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl space-y-24 px-5 py-20 sm:px-8">
        <Section
          eyebrow="Why it exists"
          title="Stop rebuilding your story for every opportunity."
          body="FolioTree keeps the source clear. Your pages, resumes, portfolios, and opportunity snapshots come from the same structured professional evidence."
        >
          <div className="grid gap-4 md:grid-cols-3">
            {valueModules.map((item) => (
              <article key={item.title} className="rounded-2xl border border-[rgba(15,17,21,0.08)] bg-white p-6">
                <Badge tone={item.tone}>{item.title}</Badge>
                <p className="mt-5 text-base font-semibold leading-7 text-[rgba(15,17,21,0.72)]">
                  {item.body}
                </p>
              </article>
            ))}
          </div>
        </Section>

        <Section
          eyebrow="MVP foundations"
          title="Templates with structure. Expression without chaos."
          body="Blocks can be edited, hidden, reordered, removed, and added while the template keeps the page coherent."
        >
          <div className="grid gap-4 lg:grid-cols-3">
            {[
              ["Editable blocks", "Hero, about, proof, projects, experience, links, contact."],
              ["Resume mode", "The same profile becomes a clean, recruiter-friendly reading view."],
              ["Versioning", "Each opportunity can have a focused version without duplicating everything."],
            ].map(([title, body]) => (
              <article key={title} className="rounded-2xl bg-[var(--ft-cyan-100)] p-6 text-[var(--ft-cyan-900)]">
                <BadgeCheck />
                <h3 className="mt-4 font-display text-2xl font-[700] tracking-[-0.035em]">{title}</h3>
                <p className="mt-3 text-sm font-semibold leading-6">{body}</p>
              </article>
            ))}
          </div>
        </Section>

        <section className="rounded-2xl bg-[var(--ft-lime-500)] p-8 text-[var(--ft-lime-900)] sm:p-10">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="font-ui text-xs font-bold uppercase tracking-[0.08em]">Start with clarity</p>
              <h2 className="mt-3 max-w-3xl font-display text-5xl font-[900] leading-[0.9] tracking-[-0.06em]">
                Your trajectory, clear in seconds.
              </h2>
            </div>
            <Button href="/register" variant="outline" className="border-[var(--ft-lime-900)] bg-white/40">
              Create my proof <ArrowRight className="ml-2 size-4" />
            </Button>
          </div>
        </section>
      </div>
    </PublicShell>
  );
}
