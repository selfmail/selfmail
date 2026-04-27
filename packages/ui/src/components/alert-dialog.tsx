import {
  Action as AlertDialogPrimitiveAction,
  Cancel as AlertDialogPrimitiveCancel,
  Content as AlertDialogPrimitiveContent,
  Description as AlertDialogPrimitiveDescription,
  Overlay as AlertDialogPrimitiveOverlay,
  Portal as AlertDialogPrimitivePortal,
  Root as AlertDialogPrimitiveRoot,
  Title as AlertDialogPrimitiveTitle,
  Trigger as AlertDialogPrimitiveTrigger,
} from "@radix-ui/react-alert-dialog";
import type { ComponentProps } from "react";
import { cn } from "../lib/cn";
import { buttonVariants } from "./button";

const AlertDialog = AlertDialogPrimitiveRoot;
const AlertDialogPortal = AlertDialogPrimitivePortal;
const AlertDialogTrigger = AlertDialogPrimitiveTrigger;

function AlertDialogOverlay({
  className,
  ...props
}: ComponentProps<typeof AlertDialogPrimitiveOverlay>) {
  return (
    <AlertDialogPrimitiveOverlay
      className={cn("fixed inset-0 z-50 bg-black/50", className)}
      data-slot="alert-dialog-overlay"
      {...props}
    />
  );
}

function AlertDialogContent({
  className,
  children,
  ...props
}: ComponentProps<typeof AlertDialogPrimitiveContent>) {
  return (
    <AlertDialogPrimitivePortal>
      <AlertDialogOverlay />
      <AlertDialogPrimitiveContent
        className={cn(
          "fixed top-1/2 left-1/2 z-50 grid w-[calc(100%-2.5rem)] max-w-[26rem] -translate-x-1/2 -translate-y-1/2 gap-5 rounded-3xl border-2 border-neutral-200 bg-background p-6 text-foreground shadow-xl outline-none dark:border-neutral-700",
          className
        )}
        data-slot="alert-dialog-content"
        {...props}
      >
        {children}
      </AlertDialogPrimitiveContent>
    </AlertDialogPrimitivePortal>
  );
}

function AlertDialogHeader({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn("flex flex-col gap-2 text-left", className)}
      data-slot="alert-dialog-header"
      {...props}
    />
  );
}

function AlertDialogFooter({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className
      )}
      data-slot="alert-dialog-footer"
      {...props}
    />
  );
}

function AlertDialogTitle({
  className,
  ...props
}: ComponentProps<typeof AlertDialogPrimitiveTitle>) {
  return (
    <AlertDialogPrimitiveTitle
      className={cn("text-balance font-medium text-2xl", className)}
      data-slot="alert-dialog-title"
      {...props}
    />
  );
}

function AlertDialogDescription({
  className,
  ...props
}: ComponentProps<typeof AlertDialogPrimitiveDescription>) {
  return (
    <AlertDialogPrimitiveDescription
      className={cn("text-pretty text-muted-foreground text-sm", className)}
      data-slot="alert-dialog-description"
      {...props}
    />
  );
}

function AlertDialogAction({
  className,
  ...props
}: ComponentProps<typeof AlertDialogPrimitiveAction>) {
  return (
    <AlertDialogPrimitiveAction
      className={cn(buttonVariants(), className)}
      data-slot="alert-dialog-action"
      {...props}
    />
  );
}

function AlertDialogCancel({
  className,
  ...props
}: ComponentProps<typeof AlertDialogPrimitiveCancel>) {
  return (
    <AlertDialogPrimitiveCancel
      className={cn(buttonVariants({ variant: "outline" }), className)}
      data-slot="alert-dialog-cancel"
      {...props}
    />
  );
}

export {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogTitle,
  AlertDialogTrigger,
};
