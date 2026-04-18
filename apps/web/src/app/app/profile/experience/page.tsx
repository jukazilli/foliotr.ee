import { demoProfile } from "@foliotree/domain";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";

export default function ExperiencePage() {
  return (
    <AppShell title="Experience" body="A clear timeline for roles, companies, and outcomes.">
      <div className="grid gap-4 lg:grid-cols-[1fr_0.8fr]">
        <div className="space-y-4">
          {demoProfile.experiences.map((item) => (
            <article key={item.id} className="rounded-2xl bg-white p-6 shadow-sm">
              <p className="font-data text-sm font-semibold text-[rgba(15,17,21,0.52)]">{item.startDate} - {item.endDate}</p>
              <h3 className="mt-2 font-display text-2xl font-[700] tracking-[-0.035em]">{item.role}</h3>
              <p className="mt-1 font-semibold text-[var(--ft-blue-500)]">{item.company}</p>
              <p className="mt-3 text-sm font-medium leading-6 text-[rgba(15,17,21,0.66)]">{item.summary}</p>
            </article>
          ))}
        </div>
        <form className="rounded-2xl bg-white p-6 shadow-sm">
          <Field label="Role" name="role" />
          <Field label="Company" name="company" className="mt-4" />
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="Start" name="startDate" />
            <Field label="End" name="endDate" />
          </div>
          <Field label="Summary" name="summary" multiline className="mt-4" />
          <Button type="submit" className="mt-5">Add experience</Button>
        </form>
      </div>
    </AppShell>
  );
}
