import { communityPortfolioTemplate } from "@foliotree/domain";
import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function TemplatesPage() {
  return (
    <AppShell title="Templates" body="Structured page systems. Editable without becoming chaotic.">
      <article className="rounded-2xl bg-white p-6 shadow-sm">
        <Badge tone="brown">Figma-ready</Badge>
        <h2 className="mt-5 font-display text-3xl font-[700] tracking-[-0.04em]">
          {communityPortfolioTemplate.name}
        </h2>
        <p className="mt-3 max-w-2xl text-sm font-medium leading-6 text-[rgba(15,17,21,0.66)]">
          {communityPortfolioTemplate.description}
        </p>
        <p className="mt-4 font-data text-sm font-semibold text-[rgba(15,17,21,0.52)]">
          {communityPortfolioTemplate.blocks.length} editable blocks
        </p>
        <Button href="/app/templates/community-portfolio" className="mt-6">View template</Button>
      </article>
    </AppShell>
  );
}
