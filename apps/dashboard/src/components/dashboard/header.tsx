import { Link, Navigate } from "@tanstack/react-router";
import { SettingsIcon } from "lucide-react";
import { useWorkspaceMember } from "@/lib/workspace";
import WorkspacePicker from "./workspace-picker";

export default function DashboardHeader({
	workspaceId,
}: {
	workspaceId: string;
}) {
	const { workspace } = useWorkspaceMember(workspaceId);

	if (!workspace) return <Navigate to="/" />;
	return (
		<header className="flex items-center justify-between px-4 py-5 sm:px-6 lg:px-26 xl:px-32">
			<WorkspacePicker currentWorkspaceId={workspaceId} />
			<Link
				to="/workspace/$workspaceId/settings"
				params={{
					workspaceId,
				}}
				className="group flex cursor-pointer items-center space-x-1 rounded-sm transition hover:bg-neutral-100 hover:ring-4 hover:ring-neutral-100"
			>
				<SettingsIcon className="h-4 w-4 rounded-md bg-transparent text-neutral-700 transition-colors hover:bg-neutral-100 group-hover:text-neutral-900" />
				<span className="font-medium text-neutral-700 text-sm group-hover:text-neutral-900">
					Workspace Settings
				</span>
			</Link>
		</header>
	);
}
