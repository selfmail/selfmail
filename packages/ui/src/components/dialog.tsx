import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import {
  Children,
  type ComponentProps,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from "react";
import { cn } from "../lib/cn";

const Dialog = Object.assign(DialogPrimitive.Root, {
  createHandle: DialogPrimitive.createHandle,
});
const DialogPortal = DialogPrimitive.Portal;

interface DialogChildProps {
  asChild?: boolean;
}

type DialogTriggerProps = ComponentProps<typeof DialogPrimitive.Trigger> &
  DialogChildProps;

type DialogCloseProps = ComponentProps<typeof DialogPrimitive.Close> &
  DialogChildProps;

function isNativeButtonChild(child: ReactNode) {
  return isValidElement(child) && child.type === "button";
}

function DialogTrigger({
  asChild,
  children,
  nativeButton,
  render,
  ...props
}: DialogTriggerProps) {
  const child = asChild ? (Children.only(children) as ReactElement) : undefined;

  return (
    <DialogPrimitive.Trigger
      data-slot="dialog-trigger"
      nativeButton={
        nativeButton ?? (asChild ? isNativeButtonChild(child) : true)
      }
      render={asChild ? child : render}
      {...props}
    >
      {asChild ? undefined : children}
    </DialogPrimitive.Trigger>
  );
}

function DialogClose({
  asChild,
  children,
  nativeButton,
  render,
  ...props
}: DialogCloseProps) {
  const child = asChild ? (Children.only(children) as ReactElement) : undefined;

  return (
    <DialogPrimitive.Close
      data-slot="dialog-close"
      nativeButton={
        nativeButton ?? (asChild ? isNativeButtonChild(child) : true)
      }
      render={asChild ? child : render}
      {...props}
    >
      {asChild ? undefined : children}
    </DialogPrimitive.Close>
  );
}

function DialogOverlay({
  className,
  ...props
}: ComponentProps<typeof DialogPrimitive.Backdrop>) {
  return (
    <DialogPrimitive.Backdrop
      className={cn("fixed inset-0 z-50 bg-black/50", className)}
      data-slot="dialog-overlay"
      {...props}
    />
  );
}

function DialogContent({
  className,
  children,
  ...props
}: ComponentProps<typeof DialogPrimitive.Popup>) {
  return (
    <DialogPrimitive.Portal>
      <DialogOverlay />
      <DialogPrimitive.Viewport
        className="fixed inset-0 z-50 flex items-center justify-center p-5"
        data-slot="dialog-viewport"
        style={{
          padding:
            "max(1.25rem, env(safe-area-inset-top)) max(1.25rem, env(safe-area-inset-right)) max(1.25rem, env(safe-area-inset-bottom)) max(1.25rem, env(safe-area-inset-left))",
        }}
      >
        <DialogPrimitive.Popup
          className={cn(
            "grid max-h-[calc(100dvh-2.5rem)] w-full max-w-[26rem] gap-5 overflow-y-auto rounded-3xl border-2 border-border bg-background p-6 text-foreground shadow-xl outline-none",
            className
          )}
          data-slot="dialog-content"
          {...props}
        >
          {children}
        </DialogPrimitive.Popup>
      </DialogPrimitive.Viewport>
    </DialogPrimitive.Portal>
  );
}

function DialogHeader({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn("flex flex-col gap-2 text-left", className)}
      data-slot="dialog-header"
      {...props}
    />
  );
}

function DialogFooter({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className
      )}
      data-slot="dialog-footer"
      {...props}
    />
  );
}

function DialogTitle({
  className,
  ...props
}: ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      className={cn("text-balance font-medium text-2xl", className)}
      data-slot="dialog-title"
      {...props}
    />
  );
}

function DialogDescription({
  className,
  ...props
}: ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      className={cn("text-pretty text-muted-foreground text-sm", className)}
      data-slot="dialog-description"
      {...props}
    />
  );
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
};
