import { createFileRoute } from "@tanstack/react-router";
import DashboardLayout from "@/components/layout/dashboard";
import { RequireAuth } from "@/lib/auth";
import { RequireWorkspace } from "@/lib/workspace";

export const Route = createFileRoute("/workspace/$workspaceId/workflows")({
  component: RouteComponent,
});

function RouteComponent() {
  const { workspaceId } = Route.useParams();
  return (
    <RequireAuth>
      <RequireWorkspace permissions={["payments:manage"]} workspaceId={workspaceId}>
        <Workflows workspaceId={workspaceId} />
      </RequireWorkspace>
    </RequireAuth>
  );
}

function Workflows({ workspaceId }: { workspaceId: string }) {
  return (
    <DashboardLayout showBackButton={true} title="Workflows" workspaceId={workspaceId} showNav={false}>
      <div>Workflows content goes here</div>
    </DashboardLayout>
  );
}
