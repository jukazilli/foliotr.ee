import type { PublicPage } from "@foliotree/domain";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function PublicPageRenderer({ page }: { page: PublicPage }) {
  const profile = page.version.profile;
  const visibleBlocks = page.blocks.filter((block) => block.visible).sort((a, b) => a.order - b.order);

  return (
    <main className="min-h-screen bg-[#fbf8cc] text-[#03045e]">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-8">
        <strong className="font-display text-xl font-[800] tracking-[-0.04em]">
          {profile.displayName}
        </strong>
        <nav className="hidden gap-8 text-sm font-semibold sm:flex">
          <a href="#about">About</a>
          <a href="#work">Work</a>
          <a href="#contact">Contact</a>
        </nav>
      </header>

      <section className="mx-auto grid max-w-7xl gap-10 px-6 pb-24 pt-12 lg:grid-cols-[1fr_0.86fr] lg:items-center">
        <div>
          <p className="font-ui text-2xl font-medium">Hello, I am</p>
          <h1 className="mt-3 max-w-3xl font-display text-6xl font-[900] leading-[0.88] tracking-[-0.06em] sm:text-8xl">
            {profile.headline}
          </h1>
          <p className="mt-5 font-ui text-xl font-semibold">based in {profile.location}</p>
          <Button href="/cv/demo" variant="outline" className="mt-8 border-[#474306] bg-[#f5ee84] text-[#474306]">
            Resume
          </Button>
        </div>
        <div className="relative">
          {profile.avatarUrl ? (
            <Image
              src={profile.avatarUrl}
              alt={profile.displayName}
              width={600}
              height={600}
              className="aspect-square w-full max-w-[440px] rounded-[44%] border-[10px] border-[#f5ee84] object-cover shadow-[18px_18px_0_#474306]"
            />
          ) : null}
        </div>
      </section>

      {visibleBlocks.map((block) => {
        if (block.type === "about") {
          return (
            <section id="about" key={block.id} className="mx-auto max-w-7xl px-6 py-20">
              <h2 className="font-display text-7xl font-[900] tracking-[-0.06em] text-[#f7f197]">
                about.
              </h2>
              <p className="mt-8 max-w-4xl text-xl font-medium leading-10 text-[#03045e]">
                {profile.bio}
              </p>
            </section>
          );
        }

        if (block.type === "experienceTimeline") {
          return (
            <section key={block.id} className="mx-auto max-w-4xl px-6 py-12">
              <div className="space-y-10">
                {profile.experiences.map((item) => (
                  <article key={item.id} className="grid gap-4 border-l-2 border-[#03045e] pl-6 sm:grid-cols-[180px_1fr]">
                    <p className="font-data text-sm font-bold">
                      {item.startDate} - {item.endDate ?? "Present"}
                    </p>
                    <div>
                      <h3 className="font-display text-2xl font-[800] tracking-[-0.035em]">
                        {item.role}
                      </h3>
                      <p className="mt-1 font-semibold">{item.company}</p>
                      <p className="mt-3 text-base font-medium leading-7">{item.summary}</p>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          );
        }

        if (block.type === "projectGrid") {
          return (
            <section id="work" key={block.id} className="mx-auto max-w-7xl px-6 py-20">
              <h2 className="font-display text-7xl font-[900] tracking-[-0.06em] text-[#f7f197]">
                work.
              </h2>
              <div className="mt-10 grid gap-8 md:grid-cols-2">
                {profile.projects.map((project) => (
                  <article key={project.id}>
                    {project.imageUrl ? (
                      <Image
                        src={project.imageUrl}
                        alt={project.title}
                        width={900}
                        height={640}
                        className="aspect-[1.4] w-full rounded-lg object-cover"
                      />
                    ) : null}
                    <p className="mt-4 font-data text-xs font-semibold text-[#474306]">
                      {project.role}
                    </p>
                    <h3 className="mt-2 font-display text-2xl font-[800] tracking-[-0.035em]">
                      {project.title}
                    </h3>
                    <p className="mt-3 font-medium leading-7">{project.summary}</p>
                    {project.result ? <Badge tone="lime" className="mt-4">{project.result}</Badge> : null}
                  </article>
                ))}
              </div>
            </section>
          );
        }

        if (block.type === "proofList") {
          return (
            <section key={block.id} className="mx-auto max-w-7xl px-6 py-10">
              <div className="grid gap-4 md:grid-cols-2">
                {profile.proofs.map((proof) => (
                  <article key={proof.id} className="rounded-xl border border-[#474306]/20 bg-[#f5ee84] p-6">
                    <p className="font-data text-3xl font-bold text-[#474306]">
                      {proof.metricValue}
                    </p>
                    <h3 className="mt-3 font-display text-2xl font-[800] tracking-[-0.035em]">
                      {proof.title}
                    </h3>
                    <p className="mt-2 font-medium leading-7">{proof.summary}</p>
                  </article>
                ))}
              </div>
            </section>
          );
        }

        if (block.type === "contact") {
          return (
            <section id="contact" key={block.id} className="mx-auto grid max-w-7xl gap-10 px-6 py-24 md:grid-cols-[0.8fr_1fr]">
              <h2 className="font-display text-7xl font-[900] tracking-[-0.06em] text-[#f7f197]">
                contact.
              </h2>
              <div>
                <p className="max-w-xl text-xl font-medium leading-9">
                  Everything that proves value, ready for the next opportunity.
                </p>
                <div className="mt-8 space-y-2 font-ui text-lg font-semibold">
                  {profile.links.map((link) => (
                    <a key={link.id} href={link.url} className="block underline underline-offset-4">
                      {link.label}
                    </a>
                  ))}
                </div>
              </div>
            </section>
          );
        }

        return null;
      })}
    </main>
  );
}
