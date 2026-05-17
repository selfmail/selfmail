import type { SettingsPage } from "./settings-pages";

interface SettingsPageContentProps {
	page: SettingsPage;
	workspaceName: string;
	workspaceSlug: string;
}

export function SettingsPageContent({
	page,
	workspaceName,
	workspaceSlug,
}: SettingsPageContentProps) {
	const PageComponent = page.component;

	return (
		<PageComponent
			page={page}
			workspaceName={workspaceName}
			workspaceSlug={workspaceSlug}
		/>
	);
}
