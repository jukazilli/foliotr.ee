import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";

export default function SettingsPage() {
  return (
    <AppShell title="Settings" body="Minimum operational settings for the MVP foundation.">
      <form className="grid gap-4 rounded-2xl bg-white p-6 shadow-sm md:grid-cols-2">
        <Field label="Public base URL" name="publicBaseUrl" defaultValue="https://foliotree.app" />
        <Field label="API URL" name="apiUrl" defaultValue="http://localhost:4000" />
        <Field label="Default visibility" name="visibility" defaultValue="Unlisted before publish" className="md:col-span-2" />
        <div className="md:col-span-2">
          <Button type="submit">Save settings</Button>
        </div>
      </form>
    </AppShell>
  );
}
