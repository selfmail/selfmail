import type { ComponentPropsWithoutRef } from "react";
import {
  Dialog,
  DialogClose,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from "./dialog";
import { cn } from "../lib/cn";

export const Sheet = Dialog;
export const SheetTrigger = DialogTrigger;
export const SheetClose = DialogClose;

export function SheetContent({
  className,
  children,
  side = "right",
  ...props
}: ComponentPropsWithoutRef<"div"> & {
  side?: "top" | "right" | "bottom" | "left";
}) {
  const positions = {
    top: "inset-x-0 top-0 border-b",
    right: "inset-y-0 right-0 h-dvh w-[min(100vw,28rem)] border-l",
    bottom: "inset-x-0 bottom-0 border-t",
    left: "inset-y-0 left-0 h-dvh w-[min(100vw,28rem)] border-r",
  } as const;

  return (
    <DialogPortal>
      <DialogOverlay />
      <div
        className={cn(
          "fixed z-50 bg-[rgb(var(--card))] p-6 text-[rgb(var(--card-foreground))] shadow-xl",
          positions[side],
          className
        )}
        {...props}
      >
        {children}
      </div>
    </DialogPortal>
  );
}

export const SheetHeader = (props: ComponentPropsWithoutRef<"div">) => (
  <div className={cn("flex flex-col gap-2 text-left", props.className)} {...props} />
);

export const SheetFooter = (props: ComponentPropsWithoutRef<"div">) => (
  <div
    className={cn("mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", props.className)}
    {...props}
  />
);

export const SheetTitle = DialogTitle;
export const SheetDescription = DialogDescription;
