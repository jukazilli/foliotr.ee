import { demoProfile } from "@foliotree/domain";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";

export default function HighlightsPage() {
  return (
    <AppShell title="Highlights" body="Fast scan points that make the profile understandable in seconds.">
      <div className="grid gap-4 lg:grid-cols-[1fr_0.8fr]">
        <div className="grid gap-4 md:grid-cols-2">
          {demoProfile.highlights.map((item) => (
            <article key={item.id} className="rounded-2xl bg-[var(--ft-lime-500)] p-6 text-[var(--ft-lime-900)]">
              <h3 className="font-display text-3xl font-[800] tracking-[-0.045em]">{item.title}</h3>
              <p className="mt-3 text-sm font-semibold leading-6">{item.body}</p>
            </article>
          ))}
        </div>
        <form className="rounded-2xl bg-white p-6 shadow-sm">
          <Field label="Title" name="title" />
          <Field label="Body" name="body" multiline className="mt-4" />
          <Button type="submit" className="mt-5">Add highlight</Button>
        </form>
      </div>
    </AppShell>
  );
}
