import Link from "next/link";

export function AuthShell({
  title,
  body,
  children,
}: {
  title: string;
  body: string;
  children: React.ReactNode;
}) {
  return (
    <main className="grid min-h-screen bg-[var(--ft-neutral-100)] lg:grid-cols-[0.9fr_1.1fr]">
      <section className="flex flex-col justify-between bg-[var(--ft-blue-500)] p-8 text-white lg:p-12">
        <Link href="/" className="font-display text-2xl font-[800] tracking-[-0.04em]">
          FolioTree
        </Link>
        <div className="max-w-xl py-16">
          <p className="mb-4 font-ui text-xs font-bold uppercase tracking-[0.08em] text-[var(--ft-lime-500)]">
            Living professional evidence
          </p>
          <h1 className="font-display text-5xl font-[800] leading-[0.96] tracking-[-0.06em] text-[var(--ft-lime-500)] sm:text-6xl">
            Show more than a profile.
          </h1>
          <p className="mt-6 max-w-md font-ui text-lg font-medium leading-7 text-white/84">
            Organize your professional story once and publish pages, resumes, and focused versions from the same source.
          </p>
        </div>
        <p className="font-ui text-sm font-medium text-white/68">
          LinkedIn shows. FolioTree proves.
        </p>
      </section>
      <section className="flex items-center justify-center px-5 py-12">
        <div className="w-full max-w-md rounded-2xl border border-[rgba(15,17,21,0.08)] bg-white p-6 shadow-[0_20px_70px_rgba(15,17,21,0.08)] sm:p-8">
          <h2 className="font-display text-3xl font-[700] tracking-[-0.045em]">{title}</h2>
          <p className="mt-3 text-sm font-medium leading-6 text-[rgba(15,17,21,0.62)]">
            {body}
          </p>
          <div className="mt-8">{children}</div>
        </div>
      </section>
    </main>
  );
}
