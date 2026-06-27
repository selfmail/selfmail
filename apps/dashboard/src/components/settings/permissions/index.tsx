import { SettingsBanner } from "#/components/ui";
import { m } from "#/paraglide/messages";

type PermissionsSettingsPageProps = {
	description?: () => string;
	page?: {
		description?: () => string;
		title: () => string;
	};
	title?: () => string;
};

export function PermissionsSettingsPage({
	description,
	page,
	title,
}: PermissionsSettingsPageProps) {
	const pageDescription = description ?? page?.description;
	const pageTitle = title?.() ?? page?.title() ?? m["dashboard.settings.menu.permissions.title"]();

	return (
		<div className="grid gap-4">
			{pageDescription && <SettingsBanner description={pageDescription()} />}
			<div className="flex min-h-64 items-center justify-center rounded-xl border border-dashed p-6 text-center text-muted-foreground text-sm">
				{m["dashboard.settings.menu.placeholder"]({ pageTitle })}
			</div>
		</div>
	);
}
