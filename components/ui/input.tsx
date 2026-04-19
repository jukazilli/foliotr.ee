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
          "w-full rounded-lg border border-white/80 bg-white/76 px-2.5 py-1.5 text-sm font-medium text-neutral-900 shadow-sm backdrop-blur placeholder:text-neutral-400 transition-colors",
          "focus:border-transparent focus:outline-none focus:ring-2 focus:ring-lime-500",
          "disabled:cursor-not-allowed disabled:opacity-50",
          error && "border-coral-500 focus:ring-coral-500",
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
