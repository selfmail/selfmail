import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AccountSwitcher } from "#/components/dashboard/account-switcher";

export const Route = createFileRoute(
	"/_authed/$workspaceSlug/_workspace/_console",
)({
	component: RouteComponent,
});

function RouteComponent() {
	const { workspace } = Route.useRouteContext();

	return (
		<div className="@container-size/dashboard-shell flex h-dvh flex-col">
			<header className="flex flex-row items-center @2xl/dashboard-shell:px-10 @3xl/dashboard-shell:px-16 @min-[62.5rem]/dashboard-shell:px-26 px-8 py-6 [@container_dashboard-shell_(max-height:_42rem)]:px-4">
				<AccountSwitcher currentWorkspace={workspace} />
			</header>
			<div className="m-2 flex min-h-0 flex-1 flex-col overflow-y-auto rounded-md bg-muted p-4">
				<Outlet />
			</div>
		</div>
	);
}
