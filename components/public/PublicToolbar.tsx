import Link from "next/link";
import PublicPrintButton from "@/components/public/PublicPrintButton";

interface PublicToolbarProps {
  templateHref: string;
  resumeHref?: string | null;
  activeMode: "template" | "resume";
}

function chipClassName(active: boolean) {
  return active
    ? "rounded-full bg-white/66 px-3 py-2 text-neutral-950 shadow-sm"
    : "rounded-full px-3 py-2 text-neutral-700 transition hover:bg-white/30 hover:text-neutral-950";
}

export default function PublicToolbar({
  templateHref,
  resumeHref,
  activeMode,
}: PublicToolbarProps) {
  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-30 print:hidden">
      <div className="flex w-full justify-center px-3 sm:justify-end sm:px-5 lg:px-8 xl:px-10">
        <div className="pointer-events-auto flex w-full max-w-full flex-wrap items-center justify-center gap-1 rounded-[24px] border border-white/40 bg-white/16 px-2 py-2 text-xs font-semibold text-neutral-900 shadow-[0_18px_60px_rgba(15,17,21,0.14)] backdrop-blur-2xl sm:max-w-max sm:gap-2 sm:rounded-full sm:text-sm">
          <Link href="/" className="rounded-full px-3 py-2 text-neutral-950 transition hover:bg-white/24">
            FolioTree
          </Link>
          <nav className="flex items-center gap-1 rounded-full bg-black/0">
            <Link href={templateHref} className={chipClassName(activeMode === "template")}>
              Template visual
            </Link>
            {resumeHref ? (
              <Link href={resumeHref} className={chipClassName(activeMode === "resume")}>
                Curriculo
              </Link>
            ) : (
              <span className="rounded-full px-3 py-2 text-neutral-500">Curriculo</span>
            )}
          </nav>
          <PublicPrintButton compact />
        </div>
      </div>
    </div>
  );
}
