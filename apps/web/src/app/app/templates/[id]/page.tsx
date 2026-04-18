import { communityPortfolioTemplate } from "@foliotree/domain";
import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";

export default async function TemplateDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <AppShell title={`Template: ${id}`} body="Template definition, block rules, and editable surfaces.">
      <div className="grid gap-3">
        {communityPortfolioTemplate.blocks.map((block) => (
          <article key={block.id} className="rounded-2xl bg-white p-5 shadow-sm">
            <Badge tone={block.required ? "lime" : "neutral"}>
              {block.required ? "Required" : "Optional"}
            </Badge>
            <h2 className="mt-3 font-display text-2xl font-[700] tracking-[-0.035em]">{block.name}</h2>
            <p className="mt-1 font-data text-sm font-semibold text-[rgba(15,17,21,0.5)]">
              {block.type} / order {block.order}
            </p>
          </article>
        ))}
      </div>
    </AppShell>
  );
}
