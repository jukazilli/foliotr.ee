export function ShellLoading() {
  return (
    <div className="soft-grid-bg min-h-screen bg-neutral-100">
      <div className="flex min-h-screen w-full gap-4 px-3 py-3 sm:px-5 xl:px-6 2xl:px-8">
        <aside className="hidden w-72 shrink-0 lg:block">
          <div className="h-full rounded-[28px] border border-white/70 bg-white/85 p-5 shadow-sm">
            <div className="h-7 w-32 animate-pulse rounded-full bg-neutral-200" />
            <div className="mt-10 space-y-2">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="h-11 animate-pulse rounded-2xl bg-neutral-100"
                />
              ))}
            </div>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <div className="rounded-[28px] border border-white/70 bg-white/88 px-5 py-4 shadow-sm">
            <div className="h-6 w-40 animate-pulse rounded-full bg-neutral-200" />
            <div className="mt-3 flex gap-2 lg:hidden">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="h-9 w-24 animate-pulse rounded-full bg-neutral-100"
                />
              ))}
            </div>
          </div>

          <div className="rounded-[28px] border border-white/70 bg-white/84 p-6 shadow-sm">
            <div className="h-5 w-28 animate-pulse rounded-full bg-neutral-200" />
            <div className="mt-4 h-12 w-72 animate-pulse rounded-full bg-neutral-100" />
            <div className="mt-4 h-4 max-w-xl animate-pulse rounded-full bg-neutral-100" />
            <div className="mt-8 grid gap-4 xl:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="h-36 animate-pulse rounded-3xl bg-neutral-100"
                />
              ))}
            </div>
            <div className="mt-6 grid gap-4 xl:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="h-48 animate-pulse rounded-3xl bg-neutral-100"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
