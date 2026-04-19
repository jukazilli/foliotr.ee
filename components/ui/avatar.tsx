import * as React from "react";
import { cn } from "@/lib/utils";

const avatarSizes = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-base",
  xl: "h-20 w-20 text-xl",
};

interface AvatarRootProps extends React.HTMLAttributes<HTMLSpanElement> {
  size?: keyof typeof avatarSizes;
}

const AvatarRoot = React.forwardRef<HTMLSpanElement, AvatarRootProps>(
  ({ className, size = "md", ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        "relative flex shrink-0 overflow-hidden rounded-full",
        avatarSizes[size],
        className
      )}
      {...props}
    />
  )
);
AvatarRoot.displayName = "AvatarRoot";

const AvatarImage = React.forwardRef<
  HTMLImageElement,
  React.ImgHTMLAttributes<HTMLImageElement>
>(({ className, alt = "", ...props }, ref) => (
  // eslint-disable-next-line @next/next/no-img-element
  <img ref={ref} alt={alt} className={cn("aspect-square h-full w-full object-cover", className)} {...props} />
));
AvatarImage.displayName = "AvatarImage";

const AvatarFallback = React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>(
  ({ className, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        "flex h-full w-full items-center justify-center rounded-full bg-neutral-200 font-mono font-medium text-neutral-600",
        className
      )}
      {...props}
    />
  )
);
AvatarFallback.displayName = "AvatarFallback";

export { AvatarRoot, AvatarImage, AvatarFallback };
