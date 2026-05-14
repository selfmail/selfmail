import { createFileRoute } from "@tanstack/react-router";
import { CreateAddressPage } from "#/components/addresses/create-address-page";

export const Route = createFileRoute(
	"/_authed/$workspaceSlug/_workspace/new-address",
)({
	component: RouteComponent,
});

function RouteComponent() {
	const { workspace } = Route.useRouteContext();

	return <CreateAddressPage workspace={workspace} />;
}
