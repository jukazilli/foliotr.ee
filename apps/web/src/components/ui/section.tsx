import { cn } from "@/lib/utils";

type SectionProps = {
  eyebrow?: string;
  title: string;
  body?: string;
  children?: React.ReactNode;
  className?: string;
};

export function Section({ eyebrow, title, body, children, className }: SectionProps) {
  return (
    <section className={cn("space-y-6", className)}>
      <div className="max-w-3xl">
        {eyebrow ? (
          <p className="mb-3 font-ui text-xs font-bold uppercase tracking-[0.08em] text-[var(--ft-blue-500)]">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="font-display text-4xl font-[650] leading-[1.02] tracking-[-0.04em] text-[var(--ft-neutral-900)] sm:text-5xl">
          {title}
        </h2>
        {body ? (
          <p className="mt-4 max-w-2xl font-ui text-base font-medium leading-7 text-[rgba(15,17,21,0.66)]">
            {body}
          </p>
        ) : null}
      </div>
      {children}
    </section>
  );
}
