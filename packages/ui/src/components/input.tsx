import type { ComponentProps } from "react";
import { cn } from "../lib/cn";

type InputProps = ComponentProps<"input">;

function Input({ className, type = "text", ...props }: InputProps) {
  return (
    <input
      className={cn(
        "flex h-12 w-full rounded-full border-2 border-border bg-background px-6 py-3 text-base text-foreground outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/25 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20",
        className
      )}
      type={type}
      {...props}
    />
  );
}

export { Input };
