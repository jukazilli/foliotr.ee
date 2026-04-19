import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-lg text-[13px] font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-500 focus-visible:ring-offset-1",
  {
    variants: {
      variant: {
        default: "bg-green-500 text-green-900 hover:bg-green-400 active:bg-green-500",
        primary: "liquid-button text-lime-900 hover:bg-lime-400 active:bg-lime-500",
        outline:
          "border border-white/78 bg-white/62 text-neutral-900 backdrop-blur hover:bg-white active:bg-white",
        ghost: "bg-transparent text-neutral-700 hover:bg-white/62 active:bg-white/78",
        destructive: "bg-coral-500 text-white hover:bg-coral-600 active:bg-coral-700",
      },
      size: {
        sm: "h-[32px] px-3 text-[13px]",
        default: "h-[40px] px-4 text-[13px]",
        lg: "h-[48px] px-6 text-sm",
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
