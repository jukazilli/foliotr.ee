import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Sidebar } from "@/components/app/Sidebar";
import { Header } from "@/components/app/Header";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = session.user as typeof session.user & {
    id: string;
    username?: string;
  };

  // Verifica onboarding a partir do Profile no banco
  const profile = await prisma.profile.findUnique({
    where: { userId: user.id },
    select: { onboardingDone: true },
  });

  if (!profile?.onboardingDone) {
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
