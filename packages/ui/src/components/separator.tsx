import { Root as SeparatorPrimitiveRoot } from "@radix-ui/react-separator";
import type { ComponentProps } from "react";
import { cn } from "../lib/cn";

function Separator({
  className,
  orientation = "horizontal",
  decorative = true,
  ...props
}: ComponentProps<typeof SeparatorPrimitiveRoot>) {
  return (
    <SeparatorPrimitiveRoot
      className={cn(
        "shrink-0 bg-border data-[orientation=horizontal]:h-px data-[orientation=vertical]:h-full data-[orientation=horizontal]:w-full data-[orientation=vertical]:w-px",
        className
      )}
      data-slot="separator"
      decorative={decorative}
      orientation={orientation}
      {...props}
    />
  );
}

export { Separator };
