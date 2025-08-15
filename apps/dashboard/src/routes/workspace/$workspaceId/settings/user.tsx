import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/workspace/$workspaceId/settings/user")({
	component: RouteComponent,
});

function RouteComponent() {
	return <div>Hello "/workspace/$workspaceId/settings/user"!</div>;
}
