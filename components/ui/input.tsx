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
          "w-full rounded-[18px] border-0 bg-white px-5 py-4 text-sm font-bold text-ink placeholder:text-neutral-500 transition-shadow",
          "focus:outline-none focus:ring-4 focus:ring-pink",
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
