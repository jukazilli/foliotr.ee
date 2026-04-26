import { Header } from "@/components/app/Header";
import { getAppShellViewer } from "@/lib/server/app-viewer";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const viewer = await getAppShellViewer();

  return (
    <div className="min-h-screen bg-cream text-ink">
      <Header
        userName={viewer.user.name ?? viewer.profile.displayName ?? undefined}
        userImage={viewer.profile.avatarUrl ?? undefined}
        userUsername={viewer.user.username}
      />

      <div className="min-h-screen w-full lg:pl-[292px]">
        <main className="min-w-0 px-4 pb-8 pt-24 sm:px-6 lg:px-8 lg:pt-8">
          <div className="mx-auto w-full max-w-[1560px]">
          {children}
          </div>
        </main>
      </div>
    </div>
  );
}
