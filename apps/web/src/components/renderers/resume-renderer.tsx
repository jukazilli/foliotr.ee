import type { ResumeView } from "@foliotree/domain";
import { Button } from "@/components/ui/button";

export function ResumeRenderer({ resume }: { resume: ResumeView }) {
  const profile = resume.version.profile;

  return (
    <main className="min-h-screen bg-white text-[var(--ft-neutral-900)]">
      <div className="no-print border-b border-[rgba(15,17,21,0.08)] bg-[var(--ft-neutral-100)] px-5 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <p className="font-display text-xl font-[800] tracking-[-0.04em]">FolioTree Resume</p>
          <Button href="/cv/demo" variant="outline" className="min-h-10 px-4 py-2">
            Reading mode
          </Button>
        </div>
      </div>

      <article className="mx-auto max-w-5xl px-6 py-10 sm:py-14">
        <header className="border-b border-[rgba(15,17,21,0.16)] pb-8">
          <h1 className="font-display text-5xl font-[800] leading-none tracking-[-0.055em]">
            {profile.displayName}
          </h1>
          <p className="mt-3 max-w-3xl text-xl font-semibold leading-7 text-[var(--ft-blue-900)]">
            {profile.headline}
          </p>
          <div className="mt-5 flex flex-wrap gap-3 text-sm font-semibold text-[rgba(15,17,21,0.64)]">
            {profile.location ? <span>{profile.location}</span> : null}
            {profile.links.map((link) => (
              <a key={link.id} href={link.url} className="underline underline-offset-4">
                {link.label}
              </a>
            ))}
          </div>
        </header>

        <section className="grid gap-8 border-b border-[rgba(15,17,21,0.12)] py-8 md:grid-cols-[180px_1fr]">
          <h2 className="font-ui text-sm font-bold uppercase tracking-[0.08em] text-[rgba(15,17,21,0.52)]">
            Summary
          </h2>
          <p className="text-base font-medium leading-8">{profile.bio}</p>
        </section>

        <section className="grid gap-8 border-b border-[rgba(15,17,21,0.12)] py-8 md:grid-cols-[180px_1fr]">
          <h2 className="font-ui text-sm font-bold uppercase tracking-[0.08em] text-[rgba(15,17,21,0.52)]">
            Experience
          </h2>
          <div className="space-y-7">
            {profile.experiences.map((item) => (
              <article key={item.id}>
                <div className="flex flex-wrap items-baseline justify-between gap-3">
                  <h3 className="font-display text-2xl font-[700] tracking-[-0.035em]">
                    {item.role}
                  </h3>
                  <p className="font-data text-sm font-semibold">
                    {item.startDate} - {item.endDate ?? "Present"}
                  </p>
                </div>
                <p className="mt-1 font-semibold text-[var(--ft-blue-900)]">{item.company}</p>
                <p className="mt-3 text-sm font-medium leading-7 text-[rgba(15,17,21,0.72)]">
                  {item.summary}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="grid gap-8 border-b border-[rgba(15,17,21,0.12)] py-8 md:grid-cols-[180px_1fr]">
          <h2 className="font-ui text-sm font-bold uppercase tracking-[0.08em] text-[rgba(15,17,21,0.52)]">
            Projects
          </h2>
          <div className="space-y-7">
            {profile.projects.map((project) => (
              <article key={project.id}>
                <h3 className="font-display text-2xl font-[700] tracking-[-0.035em]">
                  {project.title}
                </h3>
                <p className="mt-1 text-sm font-semibold text-[var(--ft-blue-900)]">
                  {project.role} {project.result ? `- ${project.result}` : ""}
                </p>
                <p className="mt-3 text-sm font-medium leading-7 text-[rgba(15,17,21,0.72)]">
                  {project.summary}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="grid gap-8 py-8 md:grid-cols-[180px_1fr]">
          <h2 className="font-ui text-sm font-bold uppercase tracking-[0.08em] text-[rgba(15,17,21,0.52)]">
            Proof
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {profile.proofs.map((proof) => (
              <article key={proof.id} className="rounded-lg bg-[var(--ft-neutral-100)] p-5">
                <p className="font-data text-2xl font-bold text-[var(--ft-blue-900)]">
                  {proof.metricValue}
                </p>
                <h3 className="mt-2 font-ui text-base font-bold">{proof.title}</h3>
                <p className="mt-2 text-sm font-medium leading-6 text-[rgba(15,17,21,0.68)]">
                  {proof.summary}
                </p>
              </article>
            ))}
          </div>
        </section>
      </article>
    </main>
  );
}
