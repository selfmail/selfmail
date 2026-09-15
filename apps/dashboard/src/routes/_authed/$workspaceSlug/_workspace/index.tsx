import { createFileRoute } from "@tanstack/react-router";
import { DashboardWorkspace } from "#/components/dashboard-workspace";
import { getWorkspaceInboxFn } from "#/lib/workspaces";

export const Route = createFileRoute("/_authed/$workspaceSlug/_workspace/")({
  component: RouteComponent,
  loader: async ({ params }) => ({
    inbox: await getWorkspaceInboxFn({
      data: { workspaceSlug: params.workspaceSlug },
    }),
  }),
});

function RouteComponent() {
  const { workspace, member } = Route.useRouteContext();
  const { inbox } = Route.useLoaderData();

  if (!workspace) {
    return null;
  }

  const { addresses, emailPage } = inbox;

  return (
    <DashboardWorkspace
      addresses={addresses}
      currentWorkspace={workspace}
      initialEmailPage={emailPage}
      memberId={member.id}
    />
  );
}
