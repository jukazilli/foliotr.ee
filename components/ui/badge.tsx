import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border-2 border-line px-3 py-1 text-xs font-extrabold uppercase tracking-[0.12em] leading-4 transition-colors",
  {
    variants: {
      variant: {
        default: "bg-cream text-ink",
        info: "bg-cyan text-ink",
        version: "bg-pink text-ink",
        success: "bg-lime text-ink",
        warning: "bg-peach text-ink",
        destructive: "bg-rose text-white",
        premium: "bg-orange text-white",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
