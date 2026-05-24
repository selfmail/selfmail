import {
	SettingsDialog,
	SettingsDialogContent,
	SettingsDialogHeader,
	SettingsDialogMain,
	SettingsDialogSidebar,
	SettingsDialogTitle,
	SettingsMenu,
	SettingsMenuItem,
} from "#/components/ui";
import { m } from "#/paraglide/messages";
import { SettingsPageContent } from "./settings-page-content";
import { getSettingsPage, settingsPages } from "./settings-pages";
import { useSettingsPage } from "./use-settings-page";

interface DashboardSettingsMenuProps {
	workspaceName: string;
	workspaceSlug: string;
}

export function DashboardSettingsMenu({
	workspaceName,
	workspaceSlug,
}: DashboardSettingsMenuProps) {
	const [pageId, setPageId] = useSettingsPage();
	const activePage = getSettingsPage(pageId ?? "app");
	const handleOpenChange = (open: boolean) => {
		setPageId(open ? (pageId ?? "app") : null);
	};

	return (
		<SettingsDialog onOpenChange={handleOpenChange} open={pageId !== null}>
			<SettingsDialogContent>
				<SettingsDialogSidebar>
					<SettingsMenu aria-label={m["dashboard.settings.menu.aria_label"]()}>
						{settingsPages.map((page) => (
							<SettingsMenuItem
								active={activePage.id === page.id}
								icon={<page.icon />}
								key={page.id}
								onClick={() => setPageId(page.id)}
							>
								{page.title()}
							</SettingsMenuItem>
						))}
					</SettingsMenu>
				</SettingsDialogSidebar>
				<SettingsDialogMain>
					<SettingsDialogHeader>
						<SettingsDialogTitle>{activePage.title()}</SettingsDialogTitle>
					</SettingsDialogHeader>
					<SettingsPageContent
						page={activePage}
						workspaceName={workspaceName}
						workspaceSlug={workspaceSlug}
					/>
				</SettingsDialogMain>
			</SettingsDialogContent>
		</SettingsDialog>
	);
}
