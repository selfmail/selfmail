import { Dialog } from "@base-ui/react";
import { useQuery } from "@tanstack/react-query";
import { XIcon } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import { useEffect } from "react";
import { getSidebarPermissions } from "#/lib/settings/sidebar";
import { cn } from "#/lib/utils";
import { m } from "#/paraglide/messages";
import type { Page } from "..";
import { settingsPages } from "./pages";

type SetPage = (value: Page) => unknown;

function SettingsMenu({ className, ...props }: ComponentProps<"nav">) {
  return (
    <nav
      className={cn("flex flex-col gap-1", className)}
      data-slot="settings-menu"
      {...props}
    />
  );
}

type SettingsMenuItemProps = Omit<ComponentProps<"button">, "type"> & {
  active?: boolean;
  icon?: ReactNode;
};

function canShowPage(
  pageId: Page,
  permissions?: {
    canViewAuditLogs: boolean;
    canViewBilling: boolean;
    canUpdatePermissions: boolean;
  }
) {
  if (pageId === "billing") {
    return permissions?.canViewBilling ?? false;
  }

  if (pageId === "permissions") {
    return permissions?.canUpdatePermissions ?? false;
  }

  if (pageId === "auditLogs") {
    return permissions?.canViewAuditLogs ?? false;
  }

  return true;
}

const defaultVisiblePages = settingsPages.filter((page) =>
  canShowPage(page.id)
);

function SettingsMenuItem({
  active,
  children,
  className,
  icon,
  ...props
}: SettingsMenuItemProps) {
  return (
    <button
      className={cn(
        "group/settings-menu-item flex h-9 w-full cursor-pointer items-center gap-2 rounded-lg px-3 text-left font-medium text-sm no-underline outline-none transition-colors hover:bg-muted-foreground/15 hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring data-[active=true]:bg-muted-foreground/15 data-[active=true]:text-accent-foreground dark:hover:bg-accent dark:data-[active=true]:bg-accent",
        className
      )}
      data-active={active}
      data-slot="settings-menu-item"
      type="button"
      {...props}
    >
      {icon ? (
        <span className="flex size-4 shrink-0 items-center justify-center text-muted-foreground group-hover/settings-menu-item:text-current group-data-[active=true]/settings-menu-item:text-current [&_svg]:size-4">
          {icon}
        </span>
      ) : null}
      <span className="truncate">{children}</span>
    </button>
  );
}

export default function SettingsSidebar({
  activePageId,
  setPage,
  memberId,
  workspaceId,
}: {
  activePageId: Page;
  setPage: SetPage;
  memberId: string;
  workspaceId: string;
}) {
  const { data: visiblePages = defaultVisiblePages, isSuccess } = useQuery({
    queryKey: ["settingsSidebar", workspaceId, memberId],
    queryFn: () =>
      getSidebarPermissions({
        data: {
          memberId,
          workspaceId,
        },
      }),
    select: (permissions) =>
      settingsPages.filter((page) => canShowPage(page.id, permissions)),
  });

  useEffect(() => {
    if (
      isSuccess &&
      visiblePages.length > 0 &&
      !visiblePages.some((page) => page.id === activePageId)
    ) {
      setPage("app");
    }
  }, [activePageId, isSuccess, setPage, visiblePages]);

  return (
    <aside
      className="flex shrink-0 flex-col border-border border-b bg-muted/80 p-3 text-foreground sm:w-56 sm:border-b-0"
      data-slot="settings-dialog-sidebar"
    >
      <SettingsMenu aria-label={m["dashboard.settings.menu.aria_label"]()}>
        <abbr className="no-underline" title={"Close Menu"}>
          <Dialog.Close className="mb-2 flex h-6 w-full cursor-pointer items-center gap-2 rounded-lg px-1 text-muted-foreground text-sm outline-none hover:bg-muted-foreground/15 hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring dark:hover:bg-accent">
            <XIcon className="size-4" />
            {m["dashboard.settings.close"]()}
          </Dialog.Close>
        </abbr>
        {visiblePages.map((page) => (
          <abbr className="no-underline" key={page.id} title={page.title()}>
            <SettingsMenuItem
              active={activePageId === page.id}
              icon={<page.icon />}
              key={page.id}
              onClick={() => {
                setPage(page.id);
              }}
            >
              {page.title()}
            </SettingsMenuItem>
          </abbr>
        ))}
      </SettingsMenu>
    </aside>
  );
}
