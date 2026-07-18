import { createFileRoute } from "@tanstack/react-router";
import { DashboardWorkspace } from "#/components/dashboard-workspace";
import {
  getDashboardWorkspacesFn,
  getWorkspaceInboxFn,
} from "#/lib/workspaces";

export const Route = createFileRoute("/_authed/$workspaceSlug/_workspace/")({
  component: RouteComponent,
  loader: async ({ params }) => {
    const [inbox, workspaces] = await Promise.all([
      getWorkspaceInboxFn({
        data: {
          workspaceSlug: params.workspaceSlug,
        },
      }),
      getDashboardWorkspacesFn(),
    ]);

    return {
      inbox,
      workspaces,
    };
  },
});

function RouteComponent() {
  const { workspace, member } = Route.useRouteContext();
  const { inbox, workspaces } = Route.useLoaderData();

  if (!workspace) {
    console.error("[workspace-index-route] workspace context missing", {
      workspaces: workspaces.map(({ id, slug }) => ({ id, slug })),
    });
    return null;
  }

  const { addresses, emails } = inbox;

  return (
    <DashboardWorkspace
      addresses={addresses}
      currentWorkspace={workspace}
      emails={emails}
      memberId={member.id}
      workspaces={workspaces}
    />
  );
}
