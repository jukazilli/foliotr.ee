import { Header } from "@/components/app/Header";
import { getAppShellViewer } from "@/lib/server/app-viewer";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const viewer = await getAppShellViewer();

  return (
    <div className="soft-grid-bg min-h-screen bg-neutral-100">
      <div className="flex min-h-screen w-full flex-col gap-4 pb-4">
        <Header
          userName={viewer.user.name ?? viewer.profile.displayName ?? undefined}
          userImage={viewer.profile.avatarUrl ?? undefined}
          userUsername={viewer.user.username}
        />

        <main className="mx-3 min-w-0 flex-1 rounded-[32px] border border-white/70 bg-white/82 px-5 py-6 shadow-sm backdrop-blur sm:mx-5 sm:px-6 lg:px-8 xl:mx-6 2xl:mx-8">
          {children}
        </main>
      </div>
    </div>
  );
}
