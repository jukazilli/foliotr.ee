import { demoProfile } from "@foliotree/domain";
import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { profileNav } from "@/lib/routes";
import Link from "next/link";

export default function ProfilePage() {
  return (
    <AppShell
      title="Profile"
      body="Your central professional identity. Everything else starts here."
      actions={<Button href="/app/versions">Create version</Button>}
    >
      <div className="mb-6 flex flex-wrap gap-2">
        {profileNav.map((item) => (
          <Link key={item.href} href={item.href}>
            <Badge tone={item.href === "/app/profile" ? "lime" : "neutral"}>{item.label}</Badge>
          </Link>
        ))}
      </div>
      <form className="grid gap-4 rounded-2xl bg-white p-6 shadow-sm md:grid-cols-2">
        <Field label="Display name" name="displayName" defaultValue={demoProfile.displayName} />
        <Field label="Slug" name="slug" defaultValue={demoProfile.slug} />
        <Field label="Headline" name="headline" defaultValue={demoProfile.headline} className="md:col-span-2" />
        <Field label="Location" name="location" defaultValue={demoProfile.location ?? ""} />
        <Field label="Avatar URL" name="avatarUrl" defaultValue={demoProfile.avatarUrl ?? ""} />
        <Field label="Bio" name="bio" defaultValue={demoProfile.bio} multiline className="md:col-span-2" />
        <div className="md:col-span-2">
          <Button type="submit">Save profile</Button>
        </div>
      </form>
    </AppShell>
  );
}
