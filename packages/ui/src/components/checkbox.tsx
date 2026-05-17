import {
  Indicator as CheckboxPrimitiveIndicator,
  Root as CheckboxPrimitiveRoot,
} from "@radix-ui/react-checkbox";
import { CheckIcon } from "lucide-react";
import type { ComponentProps } from "react";
import { cn } from "../lib/cn";

function Checkbox({
  className,
  ...props
}: ComponentProps<typeof CheckboxPrimitiveRoot>) {
  return (
    <CheckboxPrimitiveRoot
      className={cn(
        "peer flex size-5 shrink-0 items-center justify-center rounded-md border-2 border-border bg-background outline-none transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/25 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20 data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
        className
      )}
      data-slot="checkbox"
      {...props}
    >
      <CheckboxPrimitiveIndicator
        className="flex items-center justify-center text-current"
        data-slot="checkbox-indicator"
      >
        <CheckIcon className="size-4" />
      </CheckboxPrimitiveIndicator>
    </CheckboxPrimitiveRoot>
  );
}

export { Checkbox };
