import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/workspace/$workspaceId/")({
	component: RouteComponent,
});

function RouteComponent() {
	const { workspaceId } = Route.useParams();
	return (
		<div>
			<p>Workspace ID: {workspaceId}</p>
		</div>
	);
}
