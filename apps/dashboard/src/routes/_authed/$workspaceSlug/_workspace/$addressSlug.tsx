import { createFileRoute, getRouteApi } from "@tanstack/react-router";
import { DashboardWorkspace } from "#/components/dashboard-workspace";
import { getAddressInboxFn, getDashboardWorkspacesFn } from "#/lib/workspaces";
import { m } from "#/paraglide/messages";

const workspaceRoute = getRouteApi("/_authed/$workspaceSlug/_workspace");

function formatEmailCount(count: number) {
	return count === 1
		? m["dashboard.inbox.email_count_one"]({ count })
		: m["dashboard.inbox.email_count"]({ count });
}

export const Route = createFileRoute(
	"/_authed/$workspaceSlug/_workspace/$addressSlug",
)({
	component: RouteComponent,
	loader: async ({ params }) => {
		const [workspaces, inbox] = await Promise.all([
			getDashboardWorkspacesFn(),
			getAddressInboxFn({
				data: {
					addressSlug: params.addressSlug,
					workspaceSlug: params.workspaceSlug,
				},
			}),
		]);

		return {
			...inbox,
			workspaces,
		};
	},
});

function RouteComponent() {
	const { workspace } = workspaceRoute.useRouteContext();
	const { address, addresses, emails, workspaces } = Route.useLoaderData();
	const emailCount = formatEmailCount(emails.length);

	if (!workspace) {
		console.error("[workspace-address-route] workspace context missing", {
			addressSlug: address.addressSlug,
			workspaces: workspaces.map(({ id, slug }) => ({ id, slug })),
		});
		return null;
	}

	return (
		<DashboardWorkspace
			addresses={addresses}
			currentAddressSlug={address.addressSlug}
			currentWorkspace={workspace}
			emails={emails}
			subtitle={m["dashboard.address.subtitle"]({
				address: address.email,
				count: emailCount,
			})}
			title={address.handle}
			workspaces={workspaces}
		/>
	);
}
