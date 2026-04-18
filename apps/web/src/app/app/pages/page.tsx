import { demoPage } from "@foliotree/domain";
import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function PagesPage() {
  return (
    <AppShell title="Pages" body="Public presence outputs generated from profile versions.">
      <article className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <Badge tone="lime">{demoPage.status}</Badge>
            <h2 className="mt-5 font-display text-3xl font-[700] tracking-[-0.04em]">{demoPage.title}</h2>
            <p className="mt-2 text-sm font-semibold text-[rgba(15,17,21,0.58)]">/p/{demoPage.slug}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button href="/app/pages/demo">Edit</Button>
            <Button href="/p/demo" variant="outline">Open public</Button>
          </div>
        </div>
      </article>
    </AppShell>
  );
}
