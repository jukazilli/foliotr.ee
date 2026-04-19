import { ProfileEditor } from "@/components/profile/ProfileEditor";
import { getProfileEditorViewer } from "@/lib/server/app-viewer";

export default async function ProfilePage() {
  const profile = await getProfileEditorViewer();
  const initialProfile = JSON.parse(JSON.stringify(profile));

  return <ProfileEditor initialProfile={initialProfile} />;
}
