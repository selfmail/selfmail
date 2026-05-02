import { createFileRoute } from "@tanstack/react-router";
import { WorkspaceSettingsPage } from "#/components/settings/workspace-settings-page";
import { getDashboardWorkspacesFn } from "#/lib/workspaces";

export const Route = createFileRoute(
	"/_authed/$workspaceSlug/_workspace/settings",
)({
	component: RouteComponent,
	loader: async () => ({
		workspaces: await getDashboardWorkspacesFn(),
	}),
});

function RouteComponent() {
	const { workspace } = Route.useRouteContext();
	const { workspaces } = Route.useLoaderData();

	return (
		<WorkspaceSettingsPage workspace={workspace} workspaces={workspaces} />
	);
}
