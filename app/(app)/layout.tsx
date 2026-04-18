import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Sidebar } from "@/components/app/Sidebar";
import { Header } from "@/components/app/Header";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  // Se o onboarding não foi concluído, redireciona
  const user = session.user as typeof session.user & {
    username?: string;
    onboardingDone?: boolean;
  };

  if (!user.onboardingDone) {
    redirect("/onboarding");
  }

  return (
    <div className="flex h-screen overflow-hidden bg-neutral-100">
      <Sidebar
        userName={user.name ?? undefined}
        userImage={user.image ?? undefined}
        userUsername={user.username}
      />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Header
          userName={user.name ?? undefined}
          userImage={user.image ?? undefined}
          userUsername={user.username}
        />
        <main className="flex-1 overflow-y-auto px-6 py-8">{children}</main>
      </div>
    </div>
  );
}
