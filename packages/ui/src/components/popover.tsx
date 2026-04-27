import {
  Anchor as PopoverPrimitiveAnchor,
  Content as PopoverPrimitiveContent,
  Portal as PopoverPrimitivePortal,
  Root as PopoverPrimitiveRoot,
  Trigger as PopoverPrimitiveTrigger,
} from "@radix-ui/react-popover";
import type { ComponentProps } from "react";
import { cn } from "../lib/cn";

const Popover = PopoverPrimitiveRoot;
const PopoverAnchor = PopoverPrimitiveAnchor;
const PopoverTrigger = PopoverPrimitiveTrigger;

function PopoverContent({
  className,
  align = "center",
  sideOffset = 4,
  ...props
}: ComponentProps<typeof PopoverPrimitiveContent>) {
  return (
    <PopoverPrimitivePortal>
      <PopoverPrimitiveContent
        align={align}
        className={cn(
          "z-50 w-72 rounded-3xl border-2 border-neutral-200 bg-popover p-4 text-popover-foreground shadow-md outline-none dark:border-neutral-700",
          className
        )}
        data-slot="popover-content"
        sideOffset={sideOffset}
        {...props}
      />
    </PopoverPrimitivePortal>
  );
}

export { Popover, PopoverAnchor, PopoverContent, PopoverTrigger };
