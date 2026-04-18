import { demoResume } from "@foliotree/domain";
import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default async function ResumeEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <AppShell
      title={`Resume mode: ${id}`}
      body="Choose readable sections and keep visual noise out of recruiter-friendly output."
      actions={<Button href="/app/resumes/demo/preview">Preview</Button>}
    >
      <div className="grid gap-3">
        {demoResume.visibleSections.map((section, index) => (
          <article key={section} className="flex items-center justify-between rounded-xl bg-white p-5 shadow-sm">
            <div>
              <Badge tone="cyan">Section {index + 1}</Badge>
              <h2 className="mt-3 font-display text-2xl font-[700] tracking-[-0.035em] capitalize">{section}</h2>
            </div>
            <Button variant="outline">Hide</Button>
          </article>
        ))}
      </div>
    </AppShell>
  );
}
