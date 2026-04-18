import { demoPage } from "@foliotree/domain";
import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default async function PageEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <AppShell
      title={`Page blocks: ${id}`}
      body="Reorder, hide, remove, or add blocks without breaking the template structure."
      actions={<Button href="/app/pages/demo/preview">Preview</Button>}
    >
      <div className="space-y-3">
        {demoPage.blocks.map((block) => (
          <article key={block.id} className="flex flex-col gap-4 rounded-2xl bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div>
              <Badge tone={block.visible ? "green" : "neutral"}>{block.visible ? "Visible" : "Hidden"}</Badge>
              <h2 className="mt-3 font-display text-2xl font-[700] tracking-[-0.035em]">{block.name}</h2>
              <p className="mt-1 font-data text-sm font-semibold text-[rgba(15,17,21,0.5)]">{block.type}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline">Move</Button>
              <Button variant="outline">Hide</Button>
              <Button variant="outline">Edit</Button>
            </div>
          </article>
        ))}
      </div>
    </AppShell>
  );
}
