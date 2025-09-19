import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import UnderConstruction from "@/components/contruction";
import DashboardLayout from "@/components/layout/dashboard";
import { useTitle } from "@/hooks/useTitle";
import { RequireAuth } from "@/lib/auth";
import { RequireWorkspace, useWorkspace } from "@/lib/workspace";

export const Route = createFileRoute(
  "/workspace/$workspaceId/members/$memberId",
)({
  component: RouteComponent,
});

function RouteComponent() {
  const { workspaceId, memberId } = Route.useParams();

  return (
    <RequireAuth>
      <RequireWorkspace workspaceId={workspaceId}>
        <Members workspaceId={workspaceId} memberId={memberId} />
      </RequireWorkspace>
    </RequireAuth>
  );
}

function Members({
  workspaceId,
  memberId,
}: {
  workspaceId: string;
  memberId: string;
}) {
  const workspace = useWorkspace(workspaceId);

  useTitle(
    `${workspace?.workspace?.name || "Workspace"} - Members`,
    "Members - Selfmail Dashboard",
  );

  // const { data: member } = useQuery({
  //   queryKey: ["member", memberId],
  // });

  return (
    <DashboardLayout
      title={`Members of ${workspace?.workspace?.name || "Workspace"}`}
      workspaceId={workspaceId}
    >
      <UnderConstruction />
    </DashboardLayout>
  );
}
