import { demoVersion } from "@foliotree/domain";
import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function VersionsPage() {
  return (
    <AppShell
      title="Versions"
      body="Focused adaptations of your profile for different audiences and objectives."
      actions={<Button href="/app/versions/demo">Open version</Button>}
    >
      <article className="rounded-2xl bg-white p-6 shadow-sm">
        <Badge tone="violet">{demoVersion.goal}</Badge>
        <h2 className="mt-5 font-display text-3xl font-[700] tracking-[-0.04em]">{demoVersion.name}</h2>
        <p className="mt-3 max-w-2xl text-sm font-medium leading-6 text-[rgba(15,17,21,0.66)]">
          {demoVersion.summary}
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button href="/app/pages/demo" variant="outline">Create page</Button>
          <Button href="/app/resumes/demo" variant="outline">Create resume</Button>
        </div>
      </article>
    </AppShell>
  );
}
