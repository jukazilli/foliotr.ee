import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap border-0 text-sm font-extrabold uppercase transition-transform hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-orange text-white hover:bg-orange/90",
        primary: "bg-orange text-white hover:bg-orange/90",
        outline:
          "border-2 border-line bg-white text-ink shadow-hard-sm hover:bg-cream",
        ghost: "bg-transparent text-ink hover:bg-cream",
        destructive: "bg-rose text-white hover:bg-rose/90",
        soft: "bg-pink text-ink hover:bg-pink/80",
        rest: "bg-cream text-ink hover:bg-cream/80",
        accent: "bg-lime text-ink hover:bg-lime/80",
      },
      size: {
        sm: "h-10 px-4 text-xs",
        default: "h-12 px-6 text-sm",
        lg: "h-14 px-8 text-base",
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
