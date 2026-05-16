import { SettingsBanner } from "#/components/ui";
import { m } from "#/paraglide/messages";
import type { SettingsPage } from "./settings-pages";

interface SettingsPageContentProps {
  page: SettingsPage;
  workspaceName: string;
}

export function SettingsPageContent({
  page,
  workspaceName,
}: SettingsPageContentProps) {
  const Icon = page.icon;
  const pageTitle = page.title();

  return (
    <div className="grid gap-4">
      <SettingsBanner
        description={m["dashboard.settings.menu.placeholder_description"]({
          pageTitle,
          workspaceName,
        })}
        icon={<Icon />}
        title={pageTitle}
      />
      <div className="flex min-h-64 items-center justify-center rounded-2xl border border-dashed p-6 text-center text-muted-foreground text-sm">
        {m["dashboard.settings.menu.placeholder"]({ pageTitle })}
      </div>
    </div>
  );
}
