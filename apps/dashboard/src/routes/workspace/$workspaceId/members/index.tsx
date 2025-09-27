import { createFileRoute } from "@tanstack/react-router";
import UnderConstruction from "@/components/contruction";
import DashboardLayout from "@/components/layout/dashboard";
import { useTitle } from "@/hooks/useTitle";
import { RequireAuth } from "@/lib/auth";
import { RequireWorkspace, useWorkspace } from "@/lib/workspace";

export const Route = createFileRoute("/workspace/$workspaceId/members/")({
	component: RouteComponent,
});

function RouteComponent() {
	const { workspaceId } = Route.useParams();

	return (
		<RequireAuth>
			<RequireWorkspace workspaceId={workspaceId}>
				<Members workspaceId={workspaceId} />
			</RequireWorkspace>
		</RequireAuth>
	);
}

function Members({ workspaceId }: { workspaceId: string }) {
	const workspace = useWorkspace(workspaceId);
	useTitle(
		`${workspace?.workspace?.name || "Workspace"} - Members`,
		"Members - Selfmail Dashboard",
	);
	return (
		<DashboardLayout
			showNav={false}
			showBackButton={true}
			title={`Members of ${workspace?.workspace?.name || "Workspace"}`}
			workspaceId={workspaceId}
		>
			<UnderConstruction />
		</DashboardLayout>
	);
}
