import Link from "next/link";
import { cn } from "@/lib/utils";

type ButtonProps = {
  children: React.ReactNode;
  href?: string;
  variant?: "primary" | "secondary" | "ghost" | "outline";
  className?: string;
  type?: "button" | "submit" | "reset";
};

const variants = {
  primary:
    "bg-[var(--ft-lime-500)] text-[var(--ft-lime-900)] shadow-[0_14px_30px_rgba(83,94,19,0.14)]",
  secondary:
    "bg-[var(--ft-blue-500)] text-white shadow-[0_14px_30px_rgba(47,102,208,0.18)]",
  ghost: "bg-transparent text-[var(--ft-neutral-900)] hover:bg-white/70",
  outline:
    "border border-[rgba(15,17,21,0.18)] bg-white text-[var(--ft-neutral-900)]",
};

export function Button({
  children,
  href,
  variant = "primary",
  className,
  type = "button",
}: ButtonProps) {
  const classes = cn(
    "inline-flex min-h-11 items-center justify-center rounded-lg px-5 py-3 font-ui text-[15px] font-semibold leading-none transition hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-[var(--ft-blue-500)] focus:ring-offset-2",
    variants[variant],
    className,
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} className={classes}>
      {children}
    </button>
  );
}
