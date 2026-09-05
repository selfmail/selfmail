import { createFileRoute } from "@tanstack/react-router";
import { DashboardWorkspace } from "#/components/dashboard-workspace";
import { getAddressInboxFn, getDashboardWorkspacesFn } from "#/lib/workspaces";

export const Route = createFileRoute(
  "/_authed/$workspaceSlug/_workspace/$addressSlug"
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
  const { member, workspace } = Route.useRouteContext();
  const { address, addresses, emailPage, workspaces } = Route.useLoaderData();

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
      initialEmailPage={emailPage}
      memberId={member.id}
      title={address.handle}
      workspaces={workspaces}
    />
  );
}
