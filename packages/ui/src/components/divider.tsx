import type { ComponentProps } from "react";
import { cn } from "../lib/cn";
import { Separator } from "./separator";

function Divider({ className, ...props }: ComponentProps<typeof Separator>) {
  return (
    <Separator
      className={cn("data-[orientation=vertical]:h-4", className)}
      data-slot="divider"
      {...props}
    />
  );
}

export { Divider };
