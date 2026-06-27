import { AlertDialog as AlertDialogPrimitive } from "@base-ui/react/alert-dialog";
import {
  Children,
  type ComponentProps,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from "react";
import { cn } from "../lib/cn";
import { buttonVariants } from "./button";

const AlertDialog = Object.assign(AlertDialogPrimitive.Root, {
  createHandle: AlertDialogPrimitive.createHandle,
});
const AlertDialogPortal = AlertDialogPrimitive.Portal;

interface AlertDialogChildProps {
  asChild?: boolean;
}

type AlertDialogTriggerProps = ComponentProps<
  typeof AlertDialogPrimitive.Trigger
> &
  AlertDialogChildProps;

type AlertDialogCloseProps = ComponentProps<typeof AlertDialogPrimitive.Close> &
  AlertDialogChildProps;

function isNativeButtonChild(child: ReactNode) {
  return isValidElement(child) && child.type === "button";
}

function AlertDialogTrigger({
  asChild,
  children,
  nativeButton,
  render,
  ...props
}: AlertDialogTriggerProps) {
  const child = asChild ? (Children.only(children) as ReactElement) : undefined;

  return (
    <AlertDialogPrimitive.Trigger
      data-slot="alert-dialog-trigger"
      nativeButton={
        nativeButton ?? (asChild ? isNativeButtonChild(child) : true)
      }
      render={asChild ? child : render}
      {...props}
    >
      {asChild ? undefined : children}
    </AlertDialogPrimitive.Trigger>
  );
}

function AlertDialogClose({
  asChild,
  children,
  nativeButton,
  render,
  ...props
}: AlertDialogCloseProps) {
  const child = asChild ? (Children.only(children) as ReactElement) : undefined;

  return (
    <AlertDialogPrimitive.Close
      data-slot="alert-dialog-close"
      nativeButton={
        nativeButton ?? (asChild ? isNativeButtonChild(child) : true)
      }
      render={asChild ? child : render}
      {...props}
    >
      {asChild ? undefined : children}
    </AlertDialogPrimitive.Close>
  );
}

function AlertDialogOverlay({
  className,
  ...props
}: ComponentProps<typeof AlertDialogPrimitive.Backdrop>) {
  return (
    <AlertDialogPrimitive.Backdrop
      className={cn("fixed inset-0 z-50 bg-black/50", className)}
      data-slot="alert-dialog-overlay"
      {...props}
    />
  );
}

function AlertDialogContent({
  className,
  children,
  overlayClassName,
  ...props
}: ComponentProps<typeof AlertDialogPrimitive.Popup> & {
  overlayClassName?: string;
}) {
  return (
    <AlertDialogPrimitive.Portal>
      <AlertDialogOverlay className={overlayClassName} />
      <AlertDialogPrimitive.Viewport
        className="fixed inset-0 z-50 flex items-center justify-center p-5"
        data-slot="alert-dialog-viewport"
        style={{
          padding:
            "max(1.25rem, env(safe-area-inset-top)) max(1.25rem, env(safe-area-inset-right)) max(1.25rem, env(safe-area-inset-bottom)) max(1.25rem, env(safe-area-inset-left))",
        }}
      >
        <AlertDialogPrimitive.Popup
          className={cn(
            "grid max-h-[calc(100dvh-2.5rem)] w-full max-w-[26rem] gap-5 overflow-y-auto rounded-3xl border-2 border-border bg-background p-6 text-foreground shadow-xl outline-none",
            className
          )}
          data-slot="alert-dialog-content"
          {...props}
        >
          {children}
        </AlertDialogPrimitive.Popup>
      </AlertDialogPrimitive.Viewport>
    </AlertDialogPrimitive.Portal>
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
}: ComponentProps<typeof AlertDialogPrimitive.Title>) {
  return (
    <AlertDialogPrimitive.Title
      className={cn("text-balance font-medium text-2xl", className)}
      data-slot="alert-dialog-title"
      {...props}
    />
  );
}

function AlertDialogDescription({
  className,
  ...props
}: ComponentProps<typeof AlertDialogPrimitive.Description>) {
  return (
    <AlertDialogPrimitive.Description
      className={cn("text-pretty text-muted-foreground text-sm", className)}
      data-slot="alert-dialog-description"
      {...props}
    />
  );
}

function AlertDialogAction({ className, ...props }: AlertDialogCloseProps) {
  return (
    <AlertDialogClose
      className={cn(buttonVariants(), className)}
      data-slot="alert-dialog-action"
      {...props}
    />
  );
}

function AlertDialogCancel({ className, ...props }: AlertDialogCloseProps) {
  return (
    <AlertDialogClose
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
