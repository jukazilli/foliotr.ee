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
      className={cn(
        "inline-flex h-6 w-6 shrink-0 items-center justify-center",
        className
      )}
    >
      <svg viewBox="0 0 24 24" className="h-full w-full" fill="none" aria-hidden="true">
        <path
          d="M9.4 14.6 8 16a3.6 3.6 0 0 1-5.1-5.1l3-3A3.6 3.6 0 0 1 11 7.9"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="3"
        />
        <path
          d="M14.6 9.4 16 8a3.6 3.6 0 0 1 5.1 5.1l-3 3a3.6 3.6 0 0 1-5.1 0"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="3"
        />
        <path
          d="m8.8 15.2 6.4-6.4"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="3"
        />
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
