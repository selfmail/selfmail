import { createFileRoute } from "@tanstack/react-router";
import { CreateAddressPage } from "#/components/addresses/create-address-page";
import { getWorkspaceAddressDomainsFn } from "#/lib/workspaces";

export const Route = createFileRoute(
	"/_authed/$workspaceSlug/_workspace/new-address",
)({
	component: RouteComponent,
	loader: async ({ params }) => ({
		domains: await getWorkspaceAddressDomainsFn({
			data: {
				workspaceSlug: params.workspaceSlug,
			},
		}),
	}),
});

function RouteComponent() {
	const { workspace } = Route.useRouteContext();
	const { domains } = Route.useLoaderData();

	return <CreateAddressPage domains={domains} workspace={workspace} />;
}
