import {
  Close as SheetPrimitiveClose,
  Content as SheetPrimitiveContent,
  Description as SheetPrimitiveDescription,
  Overlay as SheetPrimitiveOverlay,
  Portal as SheetPrimitivePortal,
  Root as SheetPrimitiveRoot,
  Title as SheetPrimitiveTitle,
  Trigger as SheetPrimitiveTrigger,
} from "@radix-ui/react-dialog";
import { XIcon } from "lucide-react";
import type { ComponentProps } from "react";
import { cn } from "../lib/cn";

const Sheet = SheetPrimitiveRoot;
const SheetClose = SheetPrimitiveClose;
const SheetPortal = SheetPrimitivePortal;
const SheetTrigger = SheetPrimitiveTrigger;

const sheetSideClassNames = {
  bottom: "inset-x-0 bottom-0 border-t",
  left: "inset-y-0 left-0 h-dvh w-3/4 border-r sm:max-w-sm",
  right: "inset-y-0 right-0 h-dvh w-3/4 border-l sm:max-w-sm",
  top: "inset-x-0 top-0 border-b",
};

function SheetOverlay({
  className,
  ...props
}: ComponentProps<typeof SheetPrimitiveOverlay>) {
  return (
    <SheetPrimitiveOverlay
      className={cn("fixed inset-0 z-50 bg-black/50", className)}
      data-slot="sheet-overlay"
      {...props}
    />
  );
}

function SheetContent({
  children,
  className,
  side = "right",
  ...props
}: ComponentProps<typeof SheetPrimitiveContent> & {
  side?: keyof typeof sheetSideClassNames;
}) {
  return (
    <SheetPortal>
      <SheetOverlay />
      <SheetPrimitiveContent
        className={cn(
          "fixed z-50 flex flex-col gap-4 bg-background p-6 text-foreground shadow-lg outline-none",
          sheetSideClassNames[side],
          className
        )}
        data-slot="sheet-content"
        {...props}
      >
        {children}
        <SheetPrimitiveClose
          aria-label="Close"
          className="absolute top-4 right-4 rounded-sm opacity-70 outline-none transition-opacity hover:opacity-100 focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none"
        >
          <XIcon className="size-4" />
          <span className="sr-only">Close</span>
        </SheetPrimitiveClose>
      </SheetPrimitiveContent>
    </SheetPortal>
  );
}

function SheetHeader({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn("flex flex-col gap-2 text-left", className)}
      data-slot="sheet-header"
      {...props}
    />
  );
}

function SheetFooter({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn("mt-auto flex flex-col gap-2", className)}
      data-slot="sheet-footer"
      {...props}
    />
  );
}

function SheetTitle({
  className,
  ...props
}: ComponentProps<typeof SheetPrimitiveTitle>) {
  return (
    <SheetPrimitiveTitle
      className={cn(
        "text-balance font-medium text-foreground text-lg",
        className
      )}
      data-slot="sheet-title"
      {...props}
    />
  );
}

function SheetDescription({
  className,
  ...props
}: ComponentProps<typeof SheetPrimitiveDescription>) {
  return (
    <SheetPrimitiveDescription
      className={cn("text-pretty text-muted-foreground text-sm", className)}
      data-slot="sheet-description"
      {...props}
    />
  );
}

export {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetOverlay,
  SheetPortal,
  SheetTitle,
  SheetTrigger,
};
