import type { ComponentProps } from "react";
import { cn } from "../lib/cn";

type TextareaProps = ComponentProps<"textarea">;

function Textarea({ className, ...props }: TextareaProps) {
  return (
    <textarea
      className={cn(
        "flex min-h-24 w-full rounded-3xl border-2 border-neutral-200 bg-background px-6 py-4 text-base text-foreground outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-neutral-400 focus-visible:ring-2 focus-visible:ring-neutral-200 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20 dark:border-neutral-700 dark:bg-neutral-900 dark:focus-visible:border-neutral-500 dark:focus-visible:ring-neutral-700",
        className
      )}
      {...props}
    />
  );
}

export { Textarea };
