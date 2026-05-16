import { SettingsBanner } from "#/components/ui";
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

  return (
    <div className="grid gap-4">
      <SettingsBanner
        description={`${workspaceName} ${page.title.toLowerCase()} settings are ready for implementation.`}
        icon={<Icon />}
        title={page.title}
      />
      <div className="flex min-h-64 items-center justify-center rounded-2xl border border-dashed p-6 text-center text-muted-foreground text-sm">
        Add {page.title.toLowerCase()} controls here.
      </div>
    </div>
  );
}
