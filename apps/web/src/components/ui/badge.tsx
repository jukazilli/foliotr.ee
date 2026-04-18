import { cn } from "@/lib/utils";

type BadgeProps = {
  children: React.ReactNode;
  tone?: "neutral" | "lime" | "blue" | "cyan" | "violet" | "coral" | "brown" | "green";
  className?: string;
};

const tones = {
  neutral: "bg-white text-[var(--ft-neutral-700)]",
  lime: "bg-[var(--ft-lime-500)] text-[var(--ft-lime-900)]",
  blue: "bg-[var(--ft-blue-500)] text-white",
  cyan: "bg-[var(--ft-cyan-100)] text-[var(--ft-cyan-900)]",
  violet: "bg-[var(--ft-violet-100)] text-[var(--ft-violet-900)]",
  coral: "bg-[var(--ft-coral-100)] text-[var(--ft-coral-900)]",
  brown: "bg-[var(--ft-brown-100)] text-[var(--ft-brown-900)]",
  green: "bg-[var(--ft-green-500)] text-[var(--ft-green-900)]",
};

export function Badge({ children, tone = "neutral", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex rounded-md px-2.5 py-1 font-ui text-[11px] font-bold uppercase tracking-[0.06em]",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
