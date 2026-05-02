import { createFileRoute } from "@tanstack/react-router";
import { DashboardWorkspace } from "#/components/dashboard-workspace";
import {
	getDashboardWorkspacesFn,
	getWorkspaceInboxFn,
} from "#/lib/workspaces";

export const Route = createFileRoute("/_authed/$workspaceSlug/_workspace/")({
	component: RouteComponent,
	loader: async ({ params }) => {
		const [workspaces, inbox] = await Promise.all([
			getDashboardWorkspacesFn(),
			getWorkspaceInboxFn({
				data: {
					workspaceSlug: params.workspaceSlug,
				},
			}),
		]);

		return {
			...inbox,
			workspaces,
		};
	},
});

function RouteComponent() {
	const { workspace } = Route.useRouteContext();
	const { addresses, emails, workspaces } = Route.useLoaderData();

	return (
		<DashboardWorkspace
			addresses={addresses}
			currentWorkspace={workspace}
			emails={emails}
			workspaces={workspaces}
		/>
	);
}
