import { demoVersion } from "@foliotree/domain";
import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";

export default async function VersionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <AppShell
      title={`Version: ${id}`}
      body="Control audience, summary, and what this version includes before publishing outputs."
      actions={<Badge tone="violet">{demoVersion.status}</Badge>}
    >
      <form className="grid gap-4 rounded-2xl bg-white p-6 shadow-sm md:grid-cols-2">
        <Field label="Name" name="name" defaultValue={demoVersion.name} />
        <Field label="Audience" name="audience" defaultValue={demoVersion.audience ?? ""} />
        <Field label="Summary" name="summary" defaultValue={demoVersion.summary} multiline className="md:col-span-2" />
        <div className="md:col-span-2 flex flex-wrap gap-3">
          <Button type="submit">Save version</Button>
          <Button href="/app/pages/demo/preview" variant="outline">Preview page</Button>
          <Button href="/app/resumes/demo/preview" variant="outline">Preview resume</Button>
        </div>
      </form>
    </AppShell>
  );
}
