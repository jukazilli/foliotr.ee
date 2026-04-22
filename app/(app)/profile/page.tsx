import { ProfileEditor } from "@/components/profile/ProfileEditor";
import { getProfileEditorViewer } from "@/lib/server/app-viewer";

const allowedTabs = new Set([
  "dados",
  "formacao",
  "experiencias",
  "projetos",
  "reconhecimentos",
  "links",
  "provas",
]);

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const profile = await getProfileEditorViewer();
  const params = await searchParams;
  const initialProfile = JSON.parse(JSON.stringify(profile));
  const initialTab = allowedTabs.has(params.tab ?? "") ? params.tab : undefined;

  return <ProfileEditor initialProfile={initialProfile} initialTab={initialTab} />;
}
