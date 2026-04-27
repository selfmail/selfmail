import type { ComponentProps } from "react";
import { cn } from "../lib/cn";

type InputProps = ComponentProps<"input">;

function Input({ className, type = "text", ...props }: InputProps) {
  return (
    <input
      className={cn(
        "flex h-12 w-full rounded-full border-2 border-neutral-200 bg-background px-6 py-3 text-base text-foreground outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-neutral-400 focus-visible:ring-2 focus-visible:ring-neutral-200 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20 dark:border-neutral-700 dark:bg-neutral-900 dark:focus-visible:border-neutral-500 dark:focus-visible:ring-neutral-700",
        className
      )}
      type={type}
      {...props}
    />
  );
}

export { Input };
