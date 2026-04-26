import { cn } from "@/lib/utils";
import Link from "next/link";

interface FolioTreeLogoProps {
  href?: string;
  className?: string;
  markClassName?: string;
  wordmarkClassName?: string;
  compact?: boolean;
}

function LogoMark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn("inline-flex h-6 w-6 shrink-0 items-center justify-center", className)}
    >
      <svg viewBox="0 0 24 24" className="h-full w-full" fill="none" aria-hidden="true">
        <path
          d="M7.5 12.5C4.9 12.5 3 10.6 3 8s1.9-4.5 4.5-4.5h3.1v4H7.5a.5.5 0 0 0 0 1h4.9v4H7.5Z"
          fill="currentColor"
        />
        <path
          d="M13.4 20.5h-3.1v-4h3.1a.5.5 0 0 0 0-1H8.5v-4h4.9c2.6 0 4.6 1.9 4.6 4.5s-2 4.5-4.6 4.5Z"
          fill="currentColor"
        />
        <path d="M10 14.5 14.5 10" stroke="currentColor" strokeWidth="4" />
      </svg>
    </span>
  );
}

export function FolioTreeLogo({
  href,
  className,
  markClassName,
  wordmarkClassName,
  compact = false,
}: FolioTreeLogoProps) {
  const content = (
    <>
      <LogoMark className={markClassName} />
      {!compact && (
        <span
          className={cn(
            "text-xl font-extrabold uppercase tracking-[-0.08em]",
            wordmarkClassName
          )}
        >
          LINKFOLIO
        </span>
      )}
    </>
  );

  const classes = cn("inline-flex items-center gap-1 text-ink", className);

  if (href) {
    return (
      <Link href={href} className={classes} aria-label="LINKFOLIO">
        {content}
      </Link>
    );
  }

  return (
    <span className={classes} aria-label="LINKFOLIO">
      {content}
    </span>
  );
}
