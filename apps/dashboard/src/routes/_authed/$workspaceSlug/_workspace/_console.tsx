import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { ChevronLeftIcon } from "lucide-react";
import { AccountSwitcher } from "#/components/dashboard/account-switcher";
import { ConsoleNavigation } from "#/components/dashboard/console-navigation";
import { m } from "#/paraglide/messages";

export const Route = createFileRoute(
	"/_authed/$workspaceSlug/_workspace/_console",
)({
	component: RouteComponent,
});

function RouteComponent() {
	const { workspace } = Route.useRouteContext();

	return (
		<div className="@container-size/dashboard-shell flex h-dvh flex-col">
			<header className="flex flex-row items-center justify-between gap-4 @2xl/dashboard-shell:px-10 @3xl/dashboard-shell:px-16 @min-[62.5rem]/dashboard-shell:px-26 px-8 pt-6 pb-2 [@container_dashboard-shell_(max-height:_42rem)]:px-4">
				<div className="flex min-w-0 items-center gap-4">
					<Link
						className="-m-1 flex shrink-0 items-center gap-2 rounded-sm p-1 pr-2 text-foreground text-sm hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
						params={{ workspaceSlug: workspace.slug }}
						to="/$workspaceSlug"
					>
						<ChevronLeftIcon aria-hidden="true" size={15} />
						{m["dashboard.address.create.back"]()}
					</Link>
					<AccountSwitcher currentWorkspace={workspace} />
				</div>
				<ConsoleNavigation workspaceSlug={workspace.slug} />
			</header>
			<div className="m-2 flex min-h-0 flex-1 flex-col overflow-y-auto rounded-md bg-muted p-4">
				<Outlet />
			</div>
		</div>
	);
}
