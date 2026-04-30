import { createFileRoute } from "@tanstack/react-router";
import { DashboardWorkspace } from "#/components/dashboard-workspace";

export const Route = createFileRoute("/_authed/$workspaceId")({
	component: RouteComponent,
});

function RouteComponent() {
	const { user, workspace } = Route.useRouteContext();
	const currentWorkspace = workspace ?? {
		id: "demo",
		image: null,
		memberId: "demo",
		name: "Demo workspace",
		ownerId: user.id,
		slug: "demo",
	};

	return (
		<DashboardWorkspace
			currentWorkspace={currentWorkspace}
			userEmail={user.email}
			workspaces={[currentWorkspace]}
		/>
	);
}
