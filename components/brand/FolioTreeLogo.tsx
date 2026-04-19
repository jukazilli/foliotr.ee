import Link from "next/link";
import { cn } from "@/lib/utils";

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
      className={cn("relative inline-flex h-6 w-6 shrink-0", className)}
    >
      <span className="absolute left-0 top-0 h-4 w-4 bg-current" />
      <span className="absolute bottom-0 right-0 h-4 w-4 rounded-full bg-lime-500" />
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
        <span className={cn("font-display text-xl font-bold", wordmarkClassName)}>
          foliotree
        </span>
      )}
    </>
  );

  const classes = cn("inline-flex items-center gap-2 text-neutral-900", className);

  if (href) {
    return (
      <Link href={href} className={classes} aria-label="FolioTree">
        {content}
      </Link>
    );
  }

  return (
    <span className={classes} aria-label="FolioTree">
      {content}
    </span>
  );
}
