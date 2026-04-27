"use client";

import { useState } from "react";
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
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-shell min-h-screen bg-paper text-ink">
      <Header
        userName={userName}
        userImage={userImage}
        userUsername={userUsername}
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen((open) => !open)}
      />

      <div
        className={`min-h-screen w-full transition-[padding] duration-200 ease-out ${
          sidebarOpen ? "lg:pl-[17rem]" : "lg:pl-[5.25rem]"
        }`}
      >
        <main className="app-main min-w-0 px-3 pb-8 pt-24 sm:px-4 lg:px-4 lg:pt-24 xl:px-6 2xl:px-8">
          <div className="app-container">{children}</div>
        </main>
      </div>
    </div>
  );
}
