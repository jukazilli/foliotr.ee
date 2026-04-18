import { demoProfile } from "@foliotree/domain";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";

export default function LinksPage() {
  return (
    <AppShell title="Links" body="Professional links, social links, email, and proof destinations.">
      <div className="grid gap-4 lg:grid-cols-[1fr_0.8fr]">
        <div className="space-y-3">
          {demoProfile.links.map((link) => (
            <article key={link.id} className="rounded-xl bg-white p-5 shadow-sm">
              <p className="font-ui font-bold">{link.label}</p>
              <a href={link.url} className="mt-1 block text-sm font-semibold text-[var(--ft-blue-500)]">
                {link.url}
              </a>
            </article>
          ))}
        </div>
        <form className="rounded-2xl bg-white p-6 shadow-sm">
          <Field label="Label" name="label" placeholder="Portfolio" />
          <Field label="URL" name="url" placeholder="https://..." className="mt-4" />
          <Button type="submit" className="mt-5">Add link</Button>
        </form>
      </div>
    </AppShell>
  );
}
