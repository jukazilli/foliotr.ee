import { AppShell } from "@/components/app/AppShell";
import { getAppShellViewer } from "@/lib/server/app-viewer";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const viewer = await getAppShellViewer();

  return (
    <AppShell
      userName={viewer.user.name ?? viewer.profile.displayName ?? undefined}
      userImage={viewer.profile.avatarUrl ?? undefined}
      userUsername={viewer.user.username}
    >
      {children}
    </AppShell>
  );
}
