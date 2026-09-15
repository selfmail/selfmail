import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute(
	"/_authed/$workspaceSlug/_workspace/_console/analytics",
)({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div>Hello "/_authed/$workspaceSlug/_workspace/_console/analytics"!</div>
	);
}
