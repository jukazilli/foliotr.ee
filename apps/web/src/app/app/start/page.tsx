import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";

export default function StartPage() {
  return (
    <AppShell
      title="Start your profile"
      body="Create the central source that will feed every version, page, and resume."
      actions={<Button href="/app/profile">Use demo profile</Button>}
    >
      <form className="grid gap-4 rounded-2xl bg-white p-6 shadow-sm md:grid-cols-2">
        <Field label="Display name" name="displayName" placeholder="Alex Morgan" />
        <Field label="Slug" name="slug" placeholder="alex-morgan" />
        <Field label="Headline" name="headline" placeholder="Product designer with proof" className="md:col-span-2" />
        <Field label="Short bio" name="bio" multiline className="md:col-span-2" />
        <div className="md:col-span-2">
          <Button type="submit">Create profile base</Button>
        </div>
      </form>
    </AppShell>
  );
}
