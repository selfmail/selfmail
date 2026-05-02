import { Menu } from "@base-ui/react/menu";
import { ChevronRightIcon } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "../lib/cn";

const Dropdown = Menu.Root;
const DropdownGroup = Menu.Group;
const DropdownPortal = Menu.Portal;
const DropdownSub = Menu.SubmenuRoot;

const dropdownItemClass =
  "grid h-11 cursor-default grid-cols-[1rem_1fr_auto] items-center gap-3 rounded-xl px-3 text-neutral-600 text-sm outline-none select-none data-[disabled]:opacity-50 data-[highlighted]:bg-neutral-100 data-[highlighted]:text-neutral-900 dark:text-neutral-300 dark:data-[highlighted]:bg-neutral-800 dark:data-[highlighted]:text-neutral-50 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0";

type DropdownTriggerProps = ComponentProps<typeof Menu.Trigger>;

function DropdownTrigger({ className, ...props }: DropdownTriggerProps) {
  return (
    <Menu.Trigger
      className={cn(
        "inline-flex h-10 items-center justify-center gap-2 rounded-full border-2 border-neutral-200 bg-background px-5 font-medium text-foreground text-sm outline-none hover:bg-muted focus-visible:border-neutral-400 focus-visible:ring-2 focus-visible:ring-neutral-200 disabled:pointer-events-none disabled:opacity-50 data-[popup-open]:bg-muted dark:border-neutral-700 dark:focus-visible:border-neutral-500 dark:focus-visible:ring-neutral-700 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
        className
      )}
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
            "min-w-64 overflow-hidden rounded-2xl border border-neutral-200 bg-popover p-1.5 text-popover-foreground shadow-lg dark:border-neutral-700",
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
          "flex size-4 items-center justify-center text-current",
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
      className={cn("-mx-1.5 my-1.5 h-px bg-border", className)}
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
      className={cn("px-3 py-1.5 text-muted-foreground text-xs", className)}
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
