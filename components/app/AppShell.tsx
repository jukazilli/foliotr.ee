import { Header } from "@/components/app/Header";
import { FeedbackModeProvider } from "@/components/feedback/FeedbackModeProvider";

interface AppShellProps {
  userName?: string;
  userImage?: string;
  userUsername?: string | null;
  userRole?: "USER" | "DEVELOPER";
  children: React.ReactNode;
}

export function AppShell({
  userName,
  userImage,
  userUsername,
  userRole = "USER",
  children,
}: AppShellProps) {
  return (
    <div className="app-shell min-h-screen bg-paper text-ink">
      <FeedbackModeProvider isDeveloper={userRole === "DEVELOPER"}>
        <Header userName={userName} userImage={userImage} userUsername={userUsername} />

        <div className="min-h-screen w-full">
          <main className="app-main min-w-0 px-3 pb-24 pt-4 sm:px-4 md:pb-8 md:pt-20 lg:px-4 xl:px-6 2xl:px-8">
            <div className="app-container">{children}</div>
          </main>
        </div>
      </FeedbackModeProvider>
    </div>
  );
}
