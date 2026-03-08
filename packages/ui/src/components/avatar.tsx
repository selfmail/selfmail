import type { HTMLAttributes, ImgHTMLAttributes } from "react";
import { cn } from "../lib/cn";

export type AvatarProps = HTMLAttributes<HTMLDivElement>;
export type AvatarImageProps = ImgHTMLAttributes<HTMLImageElement>;
export type AvatarFallbackProps = HTMLAttributes<HTMLSpanElement>;

export function Avatar({ className, ...props }: AvatarProps) {
  return (
    <div
      className={cn(
        "relative flex size-10 shrink-0 overflow-hidden rounded-full border border-[rgb(var(--border))] bg-[rgb(var(--muted))]",
        className
      )}
      {...props}
    />
  );
}

export function AvatarImage({ className, alt = "", ...props }: AvatarImageProps) {
  return <img alt={alt} className={cn("aspect-square size-full object-cover", className)} {...props} />;
}

export function AvatarFallback({ className, ...props }: AvatarFallbackProps) {
  return (
    <span
      className={cn(
        "flex size-full items-center justify-center bg-[rgb(var(--muted))] text-sm font-medium text-[rgb(var(--muted-foreground))]",
        className
      )}
      {...props}
    />
  );
}
