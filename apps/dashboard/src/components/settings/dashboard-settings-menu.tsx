import {
	SettingsDialog,
	SettingsDialogContent,
	SettingsDialogDescription,
	SettingsDialogHeader,
	SettingsDialogMain,
	SettingsDialogSidebar,
	SettingsDialogTitle,
	SettingsMenu,
	SettingsMenuItem,
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "#/components/ui";
import { m } from "#/paraglide/messages";
import { SettingsPageContent } from "./settings-page-content";
import {
	getSettingsPage,
	type SettingsPageId,
	settingsPages,
} from "./settings-pages";
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
	const activePageTitle = activePage.title();
	const activePageDescription =
		activePage.description?.() ??
		m["dashboard.settings.menu.placeholder_description"]({
			pageTitle: activePageTitle,
			workspaceName,
		});
	const handleOpenChange = (open: boolean) => {
		setPageId(open ? (pageId ?? "app") : null);
	};
	const setActivePage = (nextPageId: string) => {
		void setPageId(nextPageId as SettingsPageId);
	};

	return (
		<SettingsDialog onOpenChange={handleOpenChange} open={pageId !== null}>
			<SettingsDialogContent>
				<Tabs
					activationMode="automatic"
					className="contents"
					onValueChange={setActivePage}
					orientation="vertical"
					value={activePage.id}
				>
					<SettingsDialogSidebar>
						<TabsList
							asChild
							className="flex h-auto w-full flex-col items-stretch justify-start rounded-none bg-transparent p-0 text-foreground"
						>
							<SettingsMenu
								aria-label={m["dashboard.settings.menu.aria_label"]()}
							>
								{settingsPages.map((page) => (
									<TabsTrigger
										asChild
										className="flex h-9 w-full justify-start rounded-lg px-3 py-0 text-left text-foreground shadow-none hover:bg-accent hover:text-accent-foreground data-[state=active]:bg-accent data-[state=active]:text-accent-foreground data-[state=active]:shadow-none"
										key={page.id}
										value={page.id}
									>
										<SettingsMenuItem
											active={activePage.id === page.id}
											icon={<page.icon />}
										>
											{page.title()}
										</SettingsMenuItem>
									</TabsTrigger>
								))}
							</SettingsMenu>
						</TabsList>
					</SettingsDialogSidebar>
					<TabsContent asChild className="mt-0" value={activePage.id}>
						<SettingsDialogMain>
							<SettingsDialogHeader>
								<SettingsDialogTitle>{activePageTitle}</SettingsDialogTitle>
								<SettingsDialogDescription className="sr-only">
									{activePageDescription}
								</SettingsDialogDescription>
							</SettingsDialogHeader>
							<SettingsPageContent
								key={workspaceSlug}
								page={activePage}
								workspaceName={workspaceName}
								workspaceSlug={workspaceSlug}
							/>
						</SettingsDialogMain>
					</TabsContent>
				</Tabs>
			</SettingsDialogContent>
		</SettingsDialog>
	);
}
