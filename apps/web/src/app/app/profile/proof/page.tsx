import { demoProfile } from "@foliotree/domain";
import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";

export default function ProofPage() {
  return (
    <AppShell title="Proof" body="Evidence that makes your trajectory convincing.">
      <div className="grid gap-4 lg:grid-cols-[1fr_0.8fr]">
        <div className="grid gap-4 md:grid-cols-2">
          {demoProfile.proofs.map((proof) => (
            <article key={proof.id} className="rounded-2xl bg-[var(--ft-cyan-100)] p-6 text-[var(--ft-cyan-900)]">
              <Badge tone="cyan">{proof.metricLabel}</Badge>
              <p className="mt-5 font-data text-3xl font-bold">{proof.metricValue}</p>
              <h3 className="mt-3 font-display text-2xl font-[700] tracking-[-0.035em]">{proof.title}</h3>
              <p className="mt-3 text-sm font-semibold leading-6">{proof.summary}</p>
            </article>
          ))}
        </div>
        <form className="rounded-2xl bg-white p-6 shadow-sm">
          <Field label="Title" name="title" />
          <Field label="Metric value" name="metricValue" placeholder="+38%" className="mt-4" />
          <Field label="Summary" name="summary" multiline className="mt-4" />
          <Button type="submit" className="mt-5">Add proof</Button>
        </form>
      </div>
    </AppShell>
  );
}
