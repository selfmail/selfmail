import { SettingsBanner } from "#/components/ui";
import { m } from "#/paraglide/messages";
import type { SettingsPageContext } from "./menu/pages";

export function PlaceholderSettingsPage({
  description,
  title,
}: SettingsPageContext) {
  return (
    <div className="grid gap-4">
      {description && <SettingsBanner description={description()} />}
      <div className="flex min-h-64 items-center justify-center rounded-2xl border border-dashed p-6 text-center text-muted-foreground text-sm">
        {m["dashboard.settings.menu.placeholder"]({ pageTitle: title() })}
      </div>
    </div>
  );
}
