import { Button } from "@/components/ui/button";

type EmptyStateProps = {
  title: string;
  body: string;
  actionLabel?: string;
  actionHref?: string;
};

export function EmptyState({ title, body, actionLabel, actionHref }: EmptyStateProps) {
  return (
    <div className="rounded-2xl border border-dashed border-[rgba(15,17,21,0.16)] bg-white p-8">
      <h3 className="font-display text-2xl font-[650] tracking-[-0.03em]">{title}</h3>
      <p className="mt-3 max-w-xl text-sm font-medium leading-6 text-[rgba(15,17,21,0.62)]">
        {body}
      </p>
      {actionLabel && actionHref ? (
        <Button href={actionHref} className="mt-6">
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
