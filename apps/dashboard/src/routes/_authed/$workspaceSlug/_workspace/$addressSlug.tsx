import { createFileRoute } from "@tanstack/react-router";
import { DashboardWorkspace } from "#/components/dashboard-workspace";
import { getAddressInboxFn } from "#/lib/workspaces";

export const Route = createFileRoute(
  "/_authed/$workspaceSlug/_workspace/$addressSlug"
)({
  component: RouteComponent,
  loader: ({ params }) =>
    getAddressInboxFn({
      data: {
        addressSlug: params.addressSlug,
        workspaceSlug: params.workspaceSlug,
      },
    }),
});

function RouteComponent() {
  const { member, workspace } = Route.useRouteContext();
  const { address, addresses, emailPage } = Route.useLoaderData();

  if (!workspace) {
    return null;
  }

  return (
    <DashboardWorkspace
      addresses={addresses}
      currentAddressSlug={address.addressSlug}
      currentWorkspace={workspace}
      initialEmailPage={emailPage}
      memberId={member.id}
      title={address.handle}
    />
  );
}
