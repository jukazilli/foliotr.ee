import { demoProfile } from "@foliotree/domain";
import Image from "next/image";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";

export default function ProjectsPage() {
  return (
    <AppShell title="Projects" body="Cases, work samples, results, and images that support your value.">
      <div className="grid gap-4 lg:grid-cols-[1fr_0.8fr]">
        <div className="grid gap-4 md:grid-cols-2">
          {demoProfile.projects.map((project) => (
            <article key={project.id} className="overflow-hidden rounded-2xl bg-white shadow-sm">
              {project.imageUrl ? (
                <Image
                  src={project.imageUrl}
                  alt={project.title}
                  width={900}
                  height={520}
                  className="aspect-video w-full object-cover"
                />
              ) : null}
              <div className="p-5">
                <h3 className="font-display text-2xl font-[700] tracking-[-0.035em]">{project.title}</h3>
                <p className="mt-2 text-sm font-semibold text-[var(--ft-blue-500)]">{project.result}</p>
                <p className="mt-3 text-sm font-medium leading-6 text-[rgba(15,17,21,0.66)]">{project.summary}</p>
              </div>
            </article>
          ))}
        </div>
        <form className="rounded-2xl bg-white p-6 shadow-sm">
          <Field label="Title" name="title" />
          <Field label="Result" name="result" placeholder="+41% recruiter engagement" className="mt-4" />
          <Field label="Image URL" name="imageUrl" className="mt-4" />
          <Field label="Summary" name="summary" multiline className="mt-4" />
          <Button type="submit" className="mt-5">Add project</Button>
        </form>
      </div>
    </AppShell>
  );
}
