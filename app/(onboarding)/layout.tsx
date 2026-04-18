import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FolioTree — Configuração inicial",
};

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-neutral-100">
      <header className="border-b border-[rgba(15,17,21,0.08)] bg-white">
        <div className="mx-auto flex h-14 max-w-5xl items-center px-6">
          <span className="font-display text-xl font-bold text-neutral-900">
            FolioTree
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-12">{children}</main>
    </div>
  );
}
