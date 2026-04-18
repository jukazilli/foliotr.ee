import Link from "next/link";
import { appNav } from "@/lib/routes";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function AppShell({
  title,
  body,
  children,
  actions,
}: {
  title: string;
  body?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-[var(--ft-neutral-100)]">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-72 border-r border-[rgba(15,17,21,0.08)] bg-white px-5 py-6 lg:block">
        <Link href="/app/profile" className="font-display text-2xl font-[800] tracking-[-0.04em]">
          FolioTree
        </Link>
        <div className="mt-6 rounded-xl bg-[var(--ft-cyan-100)] p-4 text-[var(--ft-cyan-900)]">
          <Badge tone="cyan">MVP</Badge>
          <p className="mt-3 text-sm font-semibold leading-6">
            Profile feeds versions. Versions create pages and resumes.
          </p>
        </div>
        <nav className="mt-8 space-y-1">
          {appNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block rounded-lg px-3 py-3 text-sm font-semibold text-[rgba(15,17,21,0.66)] transition hover:bg-[var(--ft-neutral-100)] hover:text-[var(--ft-neutral-900)]"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-10 border-b border-[rgba(15,17,21,0.08)] bg-[rgba(244,247,251,0.9)] backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
            <Link href="/app/profile" className="font-display text-xl font-[800] tracking-[-0.04em] lg:hidden">
              FolioTree
            </Link>
            <div className="hidden items-center gap-3 lg:flex">
              <Badge tone="lime">Profile</Badge>
              <span className="text-sm font-semibold text-[rgba(15,17,21,0.56)]">
                Versions
              </span>
              <span className="text-sm font-semibold text-[rgba(15,17,21,0.56)]">
                Pages / Resumes
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Button href="/p/demo" variant="outline" className="min-h-10 px-4 py-2">
                View demo
              </Button>
            </div>
          </div>
        </header>

        <section className="mx-auto max-w-6xl px-5 py-8 sm:px-8 lg:py-10">
          <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="font-display text-4xl font-[650] leading-[1.04] tracking-[-0.045em] text-[var(--ft-neutral-900)] sm:text-5xl">
                {title}
              </h1>
              {body ? (
                <p className="mt-3 max-w-2xl text-base font-medium leading-7 text-[rgba(15,17,21,0.62)]">
                  {body}
                </p>
              ) : null}
            </div>
            {actions}
          </div>
          {children}
        </section>
      </div>
    </main>
  );
}
