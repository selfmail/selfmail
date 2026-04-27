import { Root as LabelPrimitiveRoot } from "@radix-ui/react-label";
import type { ComponentProps } from "react";
import { cn } from "../lib/cn";

function Label({
  className,
  ...props
}: ComponentProps<typeof LabelPrimitiveRoot>) {
  return (
    <LabelPrimitiveRoot
      className={cn(
        "text-foreground text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
        className
      )}
      data-slot="label"
      {...props}
    />
  );
}

export { Label };
