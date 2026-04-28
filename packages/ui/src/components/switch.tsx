import {
  Root as SwitchPrimitiveRoot,
  Thumb as SwitchPrimitiveThumb,
} from "@radix-ui/react-switch";
import type { ComponentProps } from "react";
import { cn } from "../lib/cn";

function Switch({
  className,
  ...props
}: ComponentProps<typeof SwitchPrimitiveRoot>) {
  return (
    <SwitchPrimitiveRoot
      className={cn(
        "peer inline-flex h-6 w-11 shrink-0 items-center rounded-full border-2 border-transparent bg-muted outline-none transition-colors focus-visible:border-neutral-400 focus-visible:ring-2 focus-visible:ring-neutral-200 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary dark:focus-visible:border-neutral-500 dark:focus-visible:ring-neutral-700",
        className
      )}
      data-slot="switch"
      {...props}
    >
      <SwitchPrimitiveThumb
        className="pointer-events-none block size-5 rounded-full bg-background shadow-sm transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0"
        data-slot="switch-thumb"
      />
    </SwitchPrimitiveRoot>
  );
}

export { Switch };
