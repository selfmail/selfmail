import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/workspace/$workspaceId/settings/member")(
	{
		component: RouteComponent,
	},
);

function RouteComponent() {
	return <div>Hello "/workspace/$workspaceId/settings/member"!</div>;
}
