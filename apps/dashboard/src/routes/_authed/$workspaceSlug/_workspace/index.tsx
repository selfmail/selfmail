import { createFileRoute } from "@tanstack/react-router";
import { DashboardWorkspace } from "#/components/dashboard-workspace";
import { getDashboardWorkspacesFn } from "#/lib/workspaces";

export const Route = createFileRoute("/_authed/$workspaceSlug/_workspace/")({
	component: RouteComponent,
	loader: async () => ({
		workspaces: await getDashboardWorkspacesFn(),
	}),
});

function RouteComponent() {
	const { workspace } = Route.useRouteContext();
	const { workspaces } = Route.useLoaderData();

	return (
		<DashboardWorkspace currentWorkspace={workspace} workspaces={workspaces} />
	);
}
