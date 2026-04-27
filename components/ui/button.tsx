import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap border-2 border-transparent text-sm font-extrabold uppercase transition-transform hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "border-line bg-pink text-ink hover:bg-pink/80",
        primary: "border-line bg-pink text-ink hover:bg-pink/80",
        outline: "border-line bg-white text-ink shadow-app hover:bg-cream",
        ghost: "bg-transparent text-ink hover:bg-cream",
        destructive: "border-line bg-pink text-ink hover:bg-pink/80",
        soft: "bg-pink text-ink hover:bg-pink/80",
        rest: "bg-cream text-ink hover:bg-cream/80",
        accent: "border-line bg-pink text-ink hover:bg-pink/80",
      },
      size: {
        sm: "h-9 px-3 text-xs",
        default: "h-11 px-5 text-sm",
        lg: "h-12 px-6 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      loading,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";
    const content =
      asChild && React.isValidElement<{ children?: React.ReactNode }>(children) ? (
        React.cloneElement(children, {
          children: (
            <>
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {children.props.children}
            </>
          ),
        })
      ) : (
        <>
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {children}
        </>
      );

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {content}
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
