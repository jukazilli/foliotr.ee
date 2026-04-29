import { Header } from "@/components/app/Header";

interface AppShellProps {
  userName?: string;
  userImage?: string;
  userUsername?: string | null;
  children: React.ReactNode;
}

export function AppShell({
  userName,
  userImage,
  userUsername,
  children,
}: AppShellProps) {
  return (
    <div className="app-shell min-h-screen bg-paper text-ink">
      <Header userName={userName} userImage={userImage} userUsername={userUsername} />

      <div className="min-h-screen w-full">
        <main className="app-main min-w-0 px-3 pb-24 pt-4 sm:px-4 md:pb-8 md:pt-20 lg:px-4 xl:px-6 2xl:px-8">
          <div className="app-container">{children}</div>
        </main>
      </div>
    </div>
  );
}
