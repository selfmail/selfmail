import { createFileRoute } from "@tanstack/react-router";
import { m } from "#/paraglide/messages";

export const Route = createFileRoute(
	"/_authed/$workspaceSlug/_workspace/_console/ai/",
)({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<>
			<h1 className="mb-4 text-balance font-semibold text-xl">
				{m["dashboard.navigation.ai"]()}
			</h1>
			<p className="text-muted-foreground text-sm">
				{m["dashboard.console.ai.description"]()}
			</p>
		</>
	);
}
