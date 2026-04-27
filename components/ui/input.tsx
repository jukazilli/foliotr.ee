import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "w-full min-w-0 rounded-[14px] border-2 border-line bg-white px-4 py-3 text-sm font-semibold text-ink placeholder:text-muted/70 transition-shadow",
          "focus:outline-none focus:ring-4 focus:ring-pink/70",
          "disabled:cursor-not-allowed disabled:opacity-50",
          error && "ring-4 ring-rose/25 focus:ring-rose/30",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
