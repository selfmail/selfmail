import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useSyncExternalStore } from "react";
import { AccountSwitcher } from "#/components/dashboard/account-switcher";
import { ConsoleNavigation } from "#/components/dashboard/console-navigation";

import {
	ResizableHandle,
	ResizablePanel,
	ResizablePanelGroup,
} from "#/components/ui/resizable";

const sidebarMediaQuery = "(min-width: 40rem)";

function subscribeToSidebarBreakpoint(onStoreChange: () => void) {
	const mediaQuery = window.matchMedia(sidebarMediaQuery);
	mediaQuery.addEventListener("change", onStoreChange);
	return () => mediaQuery.removeEventListener("change", onStoreChange);
}

export const Route = createFileRoute(
	"/_authed/$workspaceSlug/_workspace/_console",
)({
	component: RouteComponent,
});

function RouteComponent() {
	const { workspace } = Route.useRouteContext();
	const canResizeSidebar = useSyncExternalStore(
		subscribeToSidebarBreakpoint,
		() => window.matchMedia(sidebarMediaQuery).matches,
		() => false,
	);

	return (
		<div className="@container-size/dashboard-shell h-dvh overflow-hidden bg-muted">
			<ResizablePanelGroup
				className="h-dvh"
				key={canResizeSidebar ? "desktop" : "mobile"}
				orientation="horizontal"
				resizeTargetMinimumSize={{ coarse: 40, fine: 16 }}
			>
				<ResizablePanel
					className="overflow-hidden rounded-r-2xl bg-background"
					defaultSize={canResizeSidebar ? "224px" : "64px"}
					disabled={!canResizeSidebar}
					id="console-sidebar"
					maxSize={canResizeSidebar ? "320px" : "64px"}
					minSize={canResizeSidebar ? "192px" : "64px"}
				>
					<aside className="flex h-full min-h-0 flex-col gap-4 overflow-y-auto p-3 text-foreground [scrollbar-color:gray_transparent] [scrollbar-width:thin]">
						<ConsoleNavigation workspaceSlug={workspace.slug} />
						<div className="mt-auto min-w-0 pt-3 pb-[env(safe-area-inset-bottom)] max-sm:[&_h3]:hidden max-sm:[&_svg]:hidden">
							<AccountSwitcher currentWorkspace={workspace} />
						</div>
					</aside>
				</ResizablePanel>
				<ResizableHandle
					className="w-0.75 bg-transparent"
					disabled={!canResizeSidebar}
				/>
				<ResizablePanel
					className="rounded-l-2xl bg-background"
					id="console-main"
					minSize="0px"
				>
					<div className="flex h-full min-h-0 min-w-0 flex-col overflow-y-auto p-4">
						<Outlet />
					</div>
				</ResizablePanel>
			</ResizablePanelGroup>
		</div>
	);
}
