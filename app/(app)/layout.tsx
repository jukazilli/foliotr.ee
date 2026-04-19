import { Header } from "@/components/app/Header";
import { getAppShellViewer } from "@/lib/server/app-viewer";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const viewer = await getAppShellViewer();

  return (
    <div className="soft-grid-bg min-h-screen bg-neutral-100">
      <div className="flex min-h-screen w-full flex-col gap-2 pb-3">
        <Header
          userName={viewer.user.name ?? viewer.profile.displayName ?? undefined}
          userImage={viewer.profile.avatarUrl ?? undefined}
          userUsername={viewer.user.username}
        />

        <main className="mx-2 min-w-0 flex-1 rounded-2xl border border-white/70 bg-white/82 px-4 py-4 shadow-sm backdrop-blur sm:mx-3 sm:px-4 lg:px-5 xl:mx-4 2xl:mx-5">
          {children}
        </main>
      </div>
    </div>
  );
}
