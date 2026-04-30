import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { getDashboardShellDataFn } from "#/lib/workspaces";

export const Route = createFileRoute("/_authed")({
	beforeLoad: async ({ location }) => {
		const { user, workspace } = await getDashboardShellDataFn();
		const isOnboardingRoute = location.pathname.startsWith("/onboarding");

		if (!workspace && !isOnboardingRoute) {
			throw redirect({
				to: "/onboarding",
			});
		}

		if (workspace && isOnboardingRoute) {
			throw redirect({
				to: "/",
			});
		}

		return {
			user,
			workspace,
		};
	},
	component: RouteComponent,
});

function RouteComponent() {
	return <Outlet />;
}
