import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo } from "react";
import ActivityList from "@/components/dashboard/activity-list";
import DashboardHeader from "@/components/dashboard/header";
import DashboardNavigation from "@/components/dashboard/navigation";
import { RequireAuth } from "@/lib/auth";
import { RequireWorkspace, useWorkspace } from "@/lib/workspace";

export const Route = createFileRoute("/workspace/$workspaceId/activity")({
	component: RouteComponent,
});

function RouteComponent() {
	const { workspaceId } = Route.useParams();

	return (
		<RequireAuth>
			<RequireWorkspace workspaceId={workspaceId}>
				<ActivityPage workspaceId={workspaceId} />
			</RequireWorkspace>
		</RequireAuth>
	);
}

function ActivityPage({ workspaceId }: { workspaceId: string }) {
	const workspaceData = useWorkspace(workspaceId);

	const workspaceName = useMemo(() => {
		return workspaceData?.workspace?.name;
	}, [workspaceData?.workspace?.name]);

	useEffect(() => {
		if (workspaceName) {
			document.title = `Activity - ${workspaceName} - Selfmail`;
		} else {
			document.title = "Activity - Selfmail";
		}

		// Cleanup function to reset title when component unmounts
		return () => {
			document.title = "Selfmail";
		};
	}, [workspaceName]);

	return (
		<div className="flex min-h-screen flex-col bg-white text-black">
			<DashboardHeader workspaceId={workspaceId} />
			<DashboardNavigation workspaceId={workspaceId} />

			{/* Page container */}
			<div className="mx-auto w-full px-4 sm:px-6 lg:px-26 xl:px-32">
				{/* Page header */}
				<div className="flex items-center justify-between py-6">
					<div>
						<h1 className="font-semibold text-2xl tracking-tight">
							Activity Log
						</h1>
						<p className="mt-1 text-gray-600 text-sm">
							Track all activities and events in your workspace
						</p>
					</div>
				</div>

				{/* Activity List */}
				<div className="pb-8">
					<div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-[#E2E8F0]">
						<ActivityList workspace={workspaceId} />
					</div>
				</div>
			</div>

			{/* Bottom spacing */}
			<div className="h-8" />
		</div>
	);
}
