import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium leading-4 transition-colors",
  {
    variants: {
      variant: {
        default: "bg-neutral-100 text-neutral-700",
        info: "bg-cyan-100 text-cyan-900",
        version: "bg-violet-100 text-violet-900",
        success: "bg-green-100 text-green-900",
        warning: "bg-lime-100 text-lime-900",
        destructive: "bg-coral-100 text-coral-900",
        premium: "bg-brown-100 text-brown-900",
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
