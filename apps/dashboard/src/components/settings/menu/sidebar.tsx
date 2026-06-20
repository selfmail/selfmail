import { Dialog } from "@base-ui/react";
import { XIcon } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "#/lib/utils";
import { m } from "#/paraglide/messages";
import { type SettingsPageId, settingsPages } from "../settings-pages";

type SetPage = (value: SettingsPageId) => unknown;

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
        "group/settings-menu-item flex h-9 w-full cursor-pointer items-center gap-2 rounded-lg px-3 text-left font-medium text-sm no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring data-[active=true]:bg-accent data-[active=true]:text-accent-foreground",
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
}: {
  activePageId: SettingsPageId;
  setPage: SetPage;
}) {
  return (
    <aside
      className="flex shrink-0 flex-col border-border border-b bg-muted/80 p-3 text-foreground sm:w-56 sm:border-b-0"
      data-slot="settings-dialog-sidebar"
    >
      <SettingsMenu aria-label={m["dashboard.settings.menu.aria_label"]()}>
        <abbr className="no-underline" title={"Close Menu"}>
          <Dialog.Close
            className="mb-2 flex h-8 w-full cursor-pointer items-center gap-2 rounded-lg px-2 text-muted-foreground text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring"
          >
            <XIcon className="size-4" />
            {m["dashboard.settings.close"]()}
          </Dialog.Close>
        </abbr>
        {settingsPages.map((page) => (
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
