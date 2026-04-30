import { createFileRoute } from "@tanstack/react-router";
import { DashboardSidebar } from "#/components/sidebar";
import { SidebarProvider } from "#/components/ui";

export const Route = createFileRoute("/_authed/$workspaceId")({
	component: RouteComponent,
});

function RouteComponent() {
	const { user, workspace } = Route.useRouteContext();
	const workspaceName = workspace?.name ?? "Demo workspace";

	return (
		<SidebarProvider>
			<DashboardSidebar userEmail={user.email} workspaceName={workspaceName} />
		</SidebarProvider>
	);
}
