import {
  Content as TooltipPrimitiveContent,
  Portal as TooltipPrimitivePortal,
  Provider as TooltipPrimitiveProvider,
  Root as TooltipPrimitiveRoot,
  Trigger as TooltipPrimitiveTrigger,
} from "@radix-ui/react-tooltip";
import type { ComponentProps } from "react";
import { cn } from "../lib/cn";

const Tooltip = TooltipPrimitiveRoot;
const TooltipTrigger = TooltipPrimitiveTrigger;

function TooltipProvider({
  delayDuration = 0,
  ...props
}: ComponentProps<typeof TooltipPrimitiveProvider>) {
  return (
    <TooltipPrimitiveProvider
      data-slot="tooltip-provider"
      delayDuration={delayDuration}
      {...props}
    />
  );
}

function TooltipContent({
  className,
  sideOffset = 4,
  ...props
}: ComponentProps<typeof TooltipPrimitiveContent>) {
  return (
    <TooltipPrimitivePortal>
      <TooltipPrimitiveContent
        className={cn(
          "z-50 overflow-hidden rounded-md bg-foreground px-3 py-1.5 text-background text-xs",
          className
        )}
        data-slot="tooltip-content"
        sideOffset={sideOffset}
        {...props}
      />
    </TooltipPrimitivePortal>
  );
}

export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger };
