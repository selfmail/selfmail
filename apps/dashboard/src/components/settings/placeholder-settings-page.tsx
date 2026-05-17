import { SettingsBanner } from "#/components/ui";
import { m } from "#/paraglide/messages";
import type { SettingsPageComponent } from "./settings-pages";

export const PlaceholderSettingsPage: SettingsPageComponent = ({ page }) => {
	const pageTitle = page.title();

	return (
		<div className="grid gap-4">
			{page.description && <SettingsBanner description={page.description()} />}
			<div className="flex min-h-64 items-center justify-center rounded-2xl border border-dashed p-6 text-center text-muted-foreground text-sm">
				{m["dashboard.settings.menu.placeholder"]({ pageTitle })}
			</div>
		</div>
	);
};
