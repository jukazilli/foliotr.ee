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
  "reviews",
]);

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const profile = await getProfileEditorViewer();
  const params = await searchParams;
  const initialProfile = JSON.parse(JSON.stringify(profile));
  const tabParam = params.tab === "provas" ? "reviews" : params.tab;
  const initialTab = allowedTabs.has(tabParam ?? "") ? tabParam : undefined;

  return <ProfileEditor initialProfile={initialProfile} initialTab={initialTab} />;
}
