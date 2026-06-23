import { Menu } from "@base-ui/react/menu";
import { ChevronRightIcon } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "../lib/cn";

const Dropdown = Menu.Root;
const DropdownPortal = Menu.Portal;
const DropdownSub = Menu.SubmenuRoot;

const dropdownItemClass =
  "grid min-h-9 cursor-default grid-cols-[1rem_1fr_auto] items-center gap-2.5 rounded-lg px-3 py-1.5 text-sm outline-none select-none data-[disabled]:opacity-50 data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0";

type DropdownTriggerProps = ComponentProps<typeof Menu.Trigger>;

function DropdownGroup({
  className,
  ...props
}: ComponentProps<typeof Menu.Group>) {
  return (
    <Menu.Group
      className={cn("grid gap-0.5", className)}
      data-slot="dropdown-group"
      {...props}
    />
  );
}

function DropdownTrigger({ className, ...props }: DropdownTriggerProps) {
  return (
    <Menu.Trigger
      className={cn("inline-flex", className)}
      data-slot="dropdown-trigger"
      {...props}
    />
  );
}

type DropdownPositionerProps = Pick<
  ComponentProps<typeof Menu.Positioner>,
  | "align"
  | "alignOffset"
  | "collisionPadding"
  | "side"
  | "sideOffset"
  | "sticky"
>;

type DropdownContentProps = ComponentProps<typeof Menu.Popup> &
  DropdownPositionerProps & {
    positionerClassName?: string;
  };

function DropdownContent({
  align = "start",
  className,
  collisionPadding = 8,
  positionerClassName,
  side = "bottom",
  sideOffset = 8,
  sticky,
  ...props
}: DropdownContentProps) {
  return (
    <DropdownPortal>
      <Menu.Positioner
        align={align}
        className={cn("z-50 outline-none", positionerClassName)}
        collisionPadding={collisionPadding}
        side={side}
        sideOffset={sideOffset}
        sticky={sticky}
      >
        <Menu.Popup
          className={cn(
            "flex max-h-[var(--available-height)] min-w-40 flex-col gap-0.5 overflow-y-auto overflow-x-hidden rounded-3xl border-2 border-border bg-popover p-1 text-popover-foreground shadow-md [--dropdown-content-padding:calc(var(--spacing)*1)] [--dropdown-content-radius:var(--radius-3xl)] [scrollbar-color:gray_transparent] [scrollbar-width:thin] [&>[data-slot=dropdown-group]:first-child>[data-slot=dropdown-item]:nth-child(1_of_[data-slot=dropdown-item])]:rounded-t-[calc(var(--dropdown-content-radius)-var(--dropdown-content-padding))] [&>[data-slot=dropdown-group]:last-child>[data-slot=dropdown-item]:nth-last-child(1_of_[data-slot=dropdown-item])]:rounded-b-[calc(var(--dropdown-content-radius)-var(--dropdown-content-padding))] [&>[data-slot=dropdown-item]:first-child]:rounded-t-[calc(var(--dropdown-content-radius)-var(--dropdown-content-padding))] [&>[data-slot=dropdown-item]:last-child]:rounded-b-[calc(var(--dropdown-content-radius)-var(--dropdown-content-padding))]",
            className
          )}
          data-slot="dropdown-content"
          {...props}
        />
      </Menu.Positioner>
    </DropdownPortal>
  );
}

type DropdownItemProps = ComponentProps<typeof Menu.Item> & {
  icon?: ReactNode;
  iconClassName?: string;
  shortcut?: ReactNode;
  variant?: "default" | "destructive";
};

function DropdownItem({
  children,
  className,
  icon,
  iconClassName,
  shortcut,
  variant,
  ...props
}: DropdownItemProps) {
  return (
    <Menu.Item
      className={cn(
        dropdownItemClass,
        variant === "destructive" &&
          "text-destructive data-[highlighted]:bg-destructive/10 data-[highlighted]:text-destructive",
        className
      )}
      data-slot="dropdown-item"
      data-variant={variant}
      {...props}
    >
      <span
        className={cn(
          "flex size-4 items-center justify-center text-muted-foreground",
          iconClassName
        )}
      >
        {icon}
      </span>
      <span className="truncate">{children}</span>
      {shortcut ? (
        <kbd className="font-sans text-muted-foreground tabular-nums">
          {shortcut}
        </kbd>
      ) : null}
    </Menu.Item>
  );
}

function DropdownSeparator({
  className,
  ...props
}: ComponentProps<typeof Menu.Separator>) {
  return (
    <Menu.Separator
      className={cn("-mx-1 my-1 h-px bg-border", className)}
      data-slot="dropdown-separator"
      {...props}
    />
  );
}

function DropdownLabel({
  className,
  ...props
}: ComponentProps<typeof Menu.GroupLabel>) {
  return (
    <Menu.GroupLabel
      className={cn("px-3 py-1 text-muted-foreground text-xs", className)}
      data-slot="dropdown-label"
      {...props}
    />
  );
}

type DropdownSubTriggerProps = ComponentProps<typeof Menu.SubmenuTrigger> & {
  icon?: ReactNode;
};

function DropdownSubTrigger({
  children,
  className,
  icon,
  ...props
}: DropdownSubTriggerProps) {
  return (
    <Menu.SubmenuTrigger
      className={cn(dropdownItemClass, className)}
      data-slot="dropdown-sub-trigger"
      {...props}
    >
      <span className="flex size-4 items-center justify-center text-current">
        {icon}
      </span>
      <span className="truncate">{children}</span>
      <ChevronRightIcon className="ml-auto size-4" />
    </Menu.SubmenuTrigger>
  );
}

function DropdownSubContent(props: DropdownContentProps) {
  return <DropdownContent data-slot="dropdown-sub-content" {...props} />;
}

export {
  Dropdown,
  DropdownContent,
  DropdownGroup,
  DropdownItem,
  DropdownLabel,
  DropdownPortal,
  DropdownSeparator,
  DropdownSub,
  DropdownSubContent,
  DropdownSubTrigger,
  DropdownTrigger,
};
