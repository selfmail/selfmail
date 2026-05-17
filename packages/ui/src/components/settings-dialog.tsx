import {
  Close as DialogPrimitiveClose,
  Content as DialogPrimitiveContent,
  Description as DialogPrimitiveDescription,
  Overlay as DialogPrimitiveOverlay,
  Portal as DialogPrimitivePortal,
  Root as DialogPrimitiveRoot,
  Title as DialogPrimitiveTitle,
  Trigger as DialogPrimitiveTrigger,
} from "@radix-ui/react-dialog";
import { cva, type VariantProps } from "class-variance-authority";
import { XIcon } from "lucide-react";
import type { ComponentProps, Key, ReactNode } from "react";
import { cn } from "../lib/cn";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";
import { Switch } from "./switch";

const SettingsDialog = DialogPrimitiveRoot;
const SettingsDialogTrigger = DialogPrimitiveTrigger;
const SettingsDialogClose = DialogPrimitiveClose;

function SettingsDialogOverlay({
  className,
  ...props
}: ComponentProps<typeof DialogPrimitiveOverlay>) {
  return (
    <DialogPrimitiveOverlay
      className={cn("fixed inset-0 z-50 bg-black/20", className)}
      data-slot="settings-dialog-overlay"
      {...props}
    />
  );
}

function SettingsDialogContent({
  children,
  className,
  closeLabel = "Close settings",
  style,
  ...props
}: ComponentProps<typeof DialogPrimitiveContent> & {
  closeLabel?: string;
}) {
  return (
    <DialogPrimitivePortal>
      <SettingsDialogOverlay />
      <DialogPrimitiveContent
        className={cn(
          "fixed top-1/2 left-1/2 z-50 flex w-[calc(100vw-2rem)] max-w-4xl -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-3xl border bg-background text-foreground shadow-xl outline-none sm:h-[38rem] sm:flex-row",
          className
        )}
        data-slot="settings-dialog-content"
        style={{
          maxHeight:
            "calc(100dvh - 2rem - env(safe-area-inset-top) - env(safe-area-inset-bottom))",
          ...style,
        }}
        {...props}
      >
        <DialogPrimitiveClose
          aria-label={closeLabel}
          className="absolute top-5 right-6 z-10 inline-flex size-8 items-center justify-center rounded-full text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
        >
          <XIcon className="size-4" />
        </DialogPrimitiveClose>
        {children}
      </DialogPrimitiveContent>
    </DialogPrimitivePortal>
  );
}

function SettingsDialogSidebar({
  className,
  ...props
}: ComponentProps<"aside">) {
  return (
    <aside
      className={cn(
        "flex shrink-0 flex-col border-border border-b bg-background p-3 sm:w-56 sm:border-r sm:border-b-0",
        className
      )}
      data-slot="settings-dialog-sidebar"
      {...props}
    />
  );
}

function SettingsMenu({ className, ...props }: ComponentProps<"nav">) {
  return (
    <nav
      className={cn("flex flex-col gap-1", className)}
      data-slot="settings-menu"
      {...props}
    />
  );
}

interface SettingsMenuItemBaseProps {
  active?: boolean;
  children: ReactNode;
  className?: string;
  icon?: ReactNode;
}

interface SettingsMenuButtonProps
  extends SettingsMenuItemBaseProps,
    Omit<ComponentProps<"button">, keyof SettingsMenuItemBaseProps | "type"> {
  href?: never;
  type?: "button" | "submit" | "reset";
}

interface SettingsMenuAnchorProps
  extends SettingsMenuItemBaseProps,
    Omit<ComponentProps<"a">, keyof SettingsMenuItemBaseProps> {
  href: string;
}

type SettingsMenuItemProps = SettingsMenuAnchorProps | SettingsMenuButtonProps;

function SettingsMenuItem({
  active,
  children,
  className,
  icon,
  ...props
}: SettingsMenuItemProps) {
  const itemClassName = cn(
    "flex h-9 w-full cursor-pointer items-center gap-2 rounded-lg px-3 text-left font-medium text-sm outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring data-[active=true]:bg-muted data-[active=true]:text-foreground",
    className
  );
  const content = (
    <>
      {icon ? (
        <span className="flex size-4 shrink-0 items-center justify-center text-muted-foreground [&_svg]:size-4">
          {icon}
        </span>
      ) : null}
      <span className="truncate">{children}</span>
    </>
  );

  if ("href" in props && props.href) {
    const { href, ...anchorProps } = props;

    return (
      <a
        aria-current={active ? "page" : anchorProps["aria-current"]}
        className={itemClassName}
        data-active={active}
        data-slot="settings-menu-item"
        href={href}
        {...anchorProps}
      >
        {content}
      </a>
    );
  }

  const { type = "button", ...buttonProps } = props as SettingsMenuButtonProps;

  return (
    <button
      className={itemClassName}
      data-active={active}
      data-slot="settings-menu-item"
      type={type}
      {...buttonProps}
    >
      {content}
    </button>
  );
}

function SettingsDialogMain({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex min-h-0 flex-1 flex-col overflow-y-auto px-6 py-5",
        className
      )}
      data-slot="settings-dialog-main"
      {...props}
    />
  );
}

function SettingsDialogHeader({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn("mb-2 grid gap-1", className)}
      data-slot="settings-dialog-header"
      {...props}
    />
  );
}

function SettingsDialogTitle({
  className,
  ...props
}: ComponentProps<typeof DialogPrimitiveTitle>) {
  return (
    <DialogPrimitiveTitle
      className={cn("text-balance font-medium text-lg", className)}
      data-slot="settings-dialog-title"
      {...props}
    />
  );
}

function SettingsDialogDescription({
  className,
  ...props
}: ComponentProps<typeof DialogPrimitiveDescription>) {
  return (
    <DialogPrimitiveDescription
      className={cn("text-pretty text-muted-foreground text-sm", className)}
      data-slot="settings-dialog-description"
      {...props}
    />
  );
}

function SettingsGroup({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn("border-border border-t", className)}
      data-slot="settings-group"
      {...props}
    />
  );
}

interface SettingsBlockProps extends Omit<ComponentProps<"div">, "title"> {
  control?: ReactNode;
  description?: ReactNode;
  title: ReactNode;
}

function SettingsBlock({
  children,
  className,
  control,
  description,
  title,
  ...props
}: SettingsBlockProps) {
  return (
    <div
      className={cn(
        "grid min-h-15 gap-3 border-border border-b py-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center",
        className
      )}
      data-slot="settings-block"
      {...props}
    >
      <div className="grid gap-1">
        <div className="text-balance font-medium text-sm">{title}</div>
        {description ? (
          <div className="text-pretty text-muted-foreground text-sm">
            {description}
          </div>
        ) : null}
      </div>
      {control ? (
        <div className="flex items-center sm:justify-end">{control}</div>
      ) : (
        children
      )}
    </div>
  );
}

interface SettingsSwitchProps
  extends Omit<ComponentProps<typeof Switch>, "children" | "title"> {
  description?: ReactNode;
  title: ReactNode;
}

function SettingsSwitch({
  className,
  description,
  title,
  ...props
}: SettingsSwitchProps) {
  return (
    <SettingsBlock
      control={<Switch className={className} {...props} />}
      description={description}
      title={title}
    />
  );
}

interface SettingsSelectOption {
  disabled?: boolean;
  label: ReactNode;
  value: string;
}

interface SettingsSelectProps
  extends Omit<ComponentProps<typeof Select>, "children" | "title"> {
  contentClassName?: string;
  description?: ReactNode;
  indicator?: ReactNode;
  options: SettingsSelectOption[];
  placeholder?: string;
  title: ReactNode;
  triggerClassName?: string;
}

function SettingsSelect({
  contentClassName,
  description,
  indicator,
  options,
  placeholder,
  title,
  triggerClassName,
  ...props
}: SettingsSelectProps) {
  return (
    <SettingsBlock
      control={
        <Select {...props}>
          <SelectTrigger
            className={cn(
              "h-auto w-auto min-w-0 gap-2 rounded-lg border-0 bg-transparent px-2 py-1 text-sm shadow-none hover:bg-muted focus-visible:ring-2",
              triggerClassName
            )}
          >
            {indicator ? (
              <span className="flex shrink-0 items-center">{indicator}</span>
            ) : null}
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent align="end" className={contentClassName}>
            {options.map((option) => (
              <SelectItem
                disabled={option.disabled}
                key={option.value}
                value={option.value}
              >
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      }
      description={description}
      title={title}
    />
  );
}

const settingsBannerVariants = cva(
  "relative grid gap-4 rounded-2xl p-5 text-sm",
  {
    variants: {
      variant: {
        default: "bg-muted text-foreground",
        destructive: "bg-destructive/10 text-destructive",
        info: "bg-blue-50 text-blue-950 dark:bg-blue-950/30 dark:text-blue-100",
        success:
          "bg-emerald-50 text-emerald-950 dark:bg-emerald-950/30 dark:text-emerald-100",
        warning:
          "bg-amber-50 text-amber-950 dark:bg-amber-950/30 dark:text-amber-100",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const settingsBannerIconVariants = cva(
  "flex size-7 items-center justify-center rounded-full [&_svg]:size-5",
  {
    variants: {
      variant: {
        default: "text-foreground",
        destructive: "text-destructive",
        info: "text-blue-700 dark:text-blue-200",
        success: "text-emerald-700 dark:text-emerald-200",
        warning: "text-amber-700 dark:text-amber-200",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

interface SettingsBannerProps
  extends Omit<ComponentProps<"div">, "title">,
    VariantProps<typeof settingsBannerVariants> {
  action?: ReactNode;
  description?: ReactNode;
  dismissLabel?: string;
  icon?: ReactNode;
  onDismiss?: () => void;
  title?: ReactNode;
}

function SettingsBanner({
  action,
  children,
  className,
  description,
  dismissLabel = "Dismiss",
  icon,
  onDismiss,
  title,
  variant,
  ...props
}: SettingsBannerProps) {
  return (
    <div
      className={cn(settingsBannerVariants({ className, variant }))}
      data-slot="settings-banner"
      {...props}
    >
      {onDismiss ? (
        <button
          aria-label={dismissLabel}
          className="absolute top-3 right-3 inline-flex size-7 items-center justify-center rounded-full outline-none transition-colors hover:bg-background/60 focus-visible:ring-2 focus-visible:ring-ring"
          onClick={onDismiss}
          type="button"
        >
          <XIcon className="size-4" />
        </button>
      ) : null}
      {icon ? (
        <div className={settingsBannerIconVariants({ variant })}>{icon}</div>
      ) : null}
      {title || description || children ? (
        <div className="grid gap-2 pr-8">
          {title ? <div className="font-semibold">{title}</div> : null}
          {description ? (
            <div className="text-pretty opacity-75">{description}</div>
          ) : null}
          {children}
        </div>
      ) : null}
      {action ? <div>{action}</div> : null}
    </div>
  );
}

interface SettingsTableColumn<TRow> {
  cell: (row: TRow) => ReactNode;
  className?: string;
  header: ReactNode;
  id: string;
}

interface SettingsTableProps<TRow>
  extends Omit<ComponentProps<"div">, "children"> {
  columns: readonly SettingsTableColumn<TRow>[];
  emptyAction?: ReactNode;
  emptyDescription?: ReactNode;
  emptyTitle?: ReactNode;
  getRowKey: (row: TRow, index: number) => Key;
  rows: readonly TRow[];
}

function SettingsTable<TRow>({
  className,
  columns,
  emptyAction,
  emptyDescription,
  emptyTitle = "No items",
  getRowKey,
  rows,
  ...props
}: SettingsTableProps<TRow>) {
  return (
    <div
      className={cn(
        "overflow-x-auto rounded-2xl border border-border [scrollbar-color:gray_transparent] [scrollbar-width:thin]",
        className
      )}
      data-slot="settings-table"
      {...props}
    >
      <table className="w-full border-collapse text-left text-sm">
        <thead className="bg-muted/60 text-muted-foreground">
          <tr>
            {columns.map((column) => (
              <th
                className={cn("px-4 py-3 font-medium", column.className)}
                key={column.id}
                scope="col"
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length ? (
            rows.map((row, index) => (
              <tr
                className="border-border border-t"
                key={getRowKey(row, index)}
              >
                {columns.map((column) => (
                  <td
                    className={cn("px-4 py-3", column.className)}
                    key={column.id}
                  >
                    {column.cell(row)}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr className="border-border border-t">
              <td className="px-4 py-8 text-center" colSpan={columns.length}>
                <div className="mx-auto grid max-w-sm gap-2">
                  <div className="font-medium">{emptyTitle}</div>
                  {emptyDescription ? (
                    <div className="text-pretty text-muted-foreground text-sm">
                      {emptyDescription}
                    </div>
                  ) : null}
                  {emptyAction ? (
                    <div className="pt-2">{emptyAction}</div>
                  ) : null}
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export {
  SettingsBanner,
  SettingsBlock,
  SettingsDialog,
  SettingsDialogClose,
  SettingsDialogContent,
  SettingsDialogDescription,
  SettingsDialogHeader,
  SettingsDialogMain,
  SettingsDialogOverlay,
  SettingsDialogSidebar,
  SettingsDialogTitle,
  SettingsDialogTrigger,
  SettingsGroup,
  SettingsMenu,
  SettingsMenuItem,
  SettingsSelect,
  SettingsSwitch,
  SettingsTable,
  settingsBannerVariants,
};
export type { SettingsSelectOption, SettingsTableColumn };
