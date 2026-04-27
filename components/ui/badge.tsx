import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border-2 border-line px-2.5 py-1 text-[0.68rem] font-extrabold uppercase tracking-[0.08em] leading-4 transition-colors",
  {
    variants: {
      variant: {
        default: "bg-cream text-ink",
        info: "bg-cream text-ink",
        version: "bg-pink text-ink",
        success: "bg-cream text-ink",
        warning: "bg-pink text-ink",
        destructive: "bg-pink text-ink",
        premium: "bg-pink text-ink",
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
