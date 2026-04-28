import {
  Indicator as ProgressPrimitiveIndicator,
  Root as ProgressPrimitiveRoot,
} from "@radix-ui/react-progress";
import type { ComponentProps } from "react";
import { cn } from "../lib/cn";

function Progress({
  className,
  style,
  value = 0,
  ...props
}: ComponentProps<typeof ProgressPrimitiveRoot>) {
  const progress = Math.max(0, Math.min(value ?? 0, 100));

  return (
    <ProgressPrimitiveRoot
      className={cn(
        "relative h-3 w-full overflow-hidden rounded-full bg-muted",
        className
      )}
      data-slot="progress"
      style={style}
      value={progress}
      {...props}
    >
      <ProgressPrimitiveIndicator
        className="size-full flex-1 bg-primary transition-transform"
        data-slot="progress-indicator"
        style={{ transform: `translateX(-${100 - progress}%)` }}
      />
    </ProgressPrimitiveRoot>
  );
}

export { Progress };
