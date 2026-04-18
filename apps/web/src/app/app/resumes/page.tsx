import { demoResume } from "@foliotree/domain";
import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function ResumesPage() {
  return (
    <AppShell title="Resumes" body="Reading-mode outputs generated from the same profile and version source.">
      <article className="rounded-2xl bg-white p-6 shadow-sm">
        <Badge tone="cyan">{demoResume.status}</Badge>
        <h2 className="mt-5 font-display text-3xl font-[700] tracking-[-0.04em]">{demoResume.title}</h2>
        <p className="mt-2 text-sm font-semibold text-[rgba(15,17,21,0.58)]">/cv/{demoResume.slug}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button href="/app/resumes/demo">Edit</Button>
          <Button href="/cv/demo" variant="outline">Open resume</Button>
        </div>
      </article>
    </AppShell>
  );
}
