import { Link, Navigate } from "@tanstack/react-router";
import { PlusIcon, SettingsIcon } from "lucide-react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "ui";
import { useWorkspaceMember } from "@/lib/workspace";

export default function DashboardHeader({
	workspaceId,
}: {
	workspaceId: string;
}) {
	const { workspace } = useWorkspaceMember(workspaceId);

	if (!workspace) return <Navigate to="/" />;
	return (
		<header className="flex items-center justify-between px-4 py-5 sm:px-6 lg:px-26 xl:px-32">
			<DropdownMenu>
				<DropdownMenuTrigger>
					<div className="rouded-md flex cursor-pointer flex-row items-center space-x-3 rounded-md bg-transparent outline-none ring-neutral-100 transition-all hover:bg-neutral-100 hover:ring-4">
						{workspace.workspace.image ? (
							<img
								src={workspace.workspace.image ?? ""}
								alt="Selfmail Logo"
								className="h-5 w-5 rounded-md"
							/>
						) : (
							<div className="h-5 w-5 rounded-md bg-blue-300" />
						)}
						<p className="font-medium">{workspace.workspace.name}</p>
					</div>
				</DropdownMenuTrigger>
				<DropdownMenuContent>
					<div
						className={
							"flex cursor-default flex-row justify-between p-2 hover:bg-transparent"
						}
					>
						<div className="flex flex-row items-center justify-start space-x-3">
							<div className="flex h-6 w-6 items-center justify-center rounded-md bg-white ring-2 ring-white ring-offset-2 ring-offset-neutral-100">
								SE
							</div>
							<div className="flex h-6 w-6 items-center justify-center rounded-md bg-white ring-2 ring-white">
								SE
							</div>
							<div className="flex h-6 w-6 items-center justify-center rounded-md bg-white ring-2 ring-white">
								SE
							</div>
						</div>
						<PlusIcon className="h-4 w-4 cursor-pointer rounded-sm ring-0 ring-neutral-200 transition hover:bg-neutral-200 hover:ring-2" />
					</div>
					<DropdownMenuItem>Settings</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
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
