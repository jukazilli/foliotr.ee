import Link from "next/link";
import { Button } from "@/components/ui/button";

export function PublicShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-[var(--ft-neutral-100)]">
      <header className="sticky top-0 z-20 border-b border-[rgba(15,17,21,0.08)] bg-[rgba(244,247,251,0.86)] backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
          <Link href="/" className="font-display text-xl font-[800] tracking-[-0.04em]">
            FolioTree
          </Link>
          <nav className="hidden items-center gap-6 text-sm font-semibold text-[rgba(15,17,21,0.68)] sm:flex">
            <Link href="/p/demo">Sample page</Link>
            <Link href="/cv/demo">Resume mode</Link>
            <Link href="/login">Login</Link>
          </nav>
          <Button href="/register" className="hidden sm:inline-flex">
            Create my FolioTree
          </Button>
        </div>
      </header>
      {children}
    </main>
  );
}
