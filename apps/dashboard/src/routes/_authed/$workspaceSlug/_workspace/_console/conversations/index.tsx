import { createFileRoute } from "@tanstack/react-router";
import { m } from "#/paraglide/messages";

export const Route = createFileRoute(
	"/_authed/$workspaceSlug/_workspace/_console/conversations/",
)({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<>
			<h1 className="mb-4 text-balance font-semibold text-xl">
				{m["dashboard.navigation.conversations"]()}
			</h1>
			<p className="text-muted-foreground text-sm">
				{m["dashboard.console.conversations.description"]()}
			</p>
		</>
	);
}
