import { Link } from "@tanstack/react-router";
import { CheckIcon, ChevronDownIcon, PlusIcon, UsersIcon } from "lucide-react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "ui";
import { useUserWorkspaces } from "@/hooks/useUserWorkspaces";

interface WorkspacePickerProps {
	currentWorkspaceId: string;
}

export default function WorkspacePicker({
	currentWorkspaceId,
}: WorkspacePickerProps) {
	const { data: workspaces = [], isLoading } = useUserWorkspaces();

	const currentWorkspace = workspaces.find((w) => w.id === currentWorkspaceId);

	if (isLoading) {
		return (
			<div className="flex cursor-wait items-center space-x-2 rounded-lg bg-white px-3 py-2 shadow-sm ring-1 ring-neutral-200">
				<div className="h-4 w-4 animate-pulse rounded bg-neutral-300" />
				<div className="h-3 w-16 animate-pulse rounded bg-neutral-300" />
				<ChevronDownIcon className="h-3 w-3 text-neutral-400" />
			</div>
		);
	}

	if (!currentWorkspace) {
		return (
			<div className="flex items-center space-x-2 rounded-lg bg-red-50 px-3 py-2 shadow-sm ring-1 ring-red-200">
				<div className="h-4 w-4 rounded bg-red-300" />
				<span className="font-medium text-red-700 text-sm">Not found</span>
			</div>
		);
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger>
				<div className="rouded-md flex cursor-pointer flex-row items-center space-x-3 rounded-md bg-transparent outline-none ring-neutral-100 transition-all hover:bg-neutral-100 hover:ring-4">
					{currentWorkspace.image ? (
						<img
							src={currentWorkspace.image ?? ""}
							alt="Selfmail Logo"
							className="h-5 w-5 rounded-md"
						/>
					) : (
						<div className="h-5 w-5 rounded-md bg-blue-300" />
					)}
					<p className="font-medium">{currentWorkspace.name}</p>
				</div>
			</DropdownMenuTrigger>
			<DropdownMenuContent
				align="start"
				className="mt-2 flex w-56 flex-col space-y-1 rounded-xl bg-neutral-100 p-1"
			>
				<DropdownMenuItem className="flex items-center space-x-2 rounded-md bg-neutral-200 px-3 py-2 text-sm transition-colors hover:bg-neutral-300">
					{currentWorkspace.image ? (
						<img
							src={currentWorkspace.image}
							alt={`${currentWorkspace.name} Logo`}
							className="h-5 w-5 rounded"
						/>
					) : (
						<div className="flex h-5 w-5 items-center justify-center rounded bg-neutral-200">
							<UsersIcon className="h-3 w-3 text-neutral-500" />
						</div>
					)}
					<span className="font-medium text-neutral-900">
						{currentWorkspace.name}
					</span>
				</DropdownMenuItem>

				{/* Other workspaces */}
				{workspaces.filter((w) => w.id !== currentWorkspaceId).length > 0 &&
					workspaces
						.filter((w) => w.id !== currentWorkspaceId)
						.map((workspace) => (
							<DropdownMenuItem className="p-2" key={workspace.id} asChild>
								<Link
									to="/workspace/$workspaceId"
									params={{ workspaceId: workspace.id }}
									className="flex items-center space-x-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-neutral-100"
								>
									{workspace.image ? (
										<img
											src={workspace.image}
											alt={`${workspace.name} Logo`}
											className="h-5 w-5 rounded"
										/>
									) : (
										<div className="flex h-5 w-5 items-center justify-center rounded bg-neutral-200">
											<UsersIcon className="h-3 w-3 text-neutral-500" />
										</div>
									)}
									<span className="font-medium text-neutral-900">
										{workspace.name}
									</span>
								</Link>
							</DropdownMenuItem>
						))}

				<DropdownMenuSeparator className="mx-3 border-t border-t-neutral-200 border-b border-b-neutral-200" />

				{/* Create new workspace */}
				<DropdownMenuItem asChild>
					<Link
						to="/workspace/create"
						className="flex items-center space-x-2 px-3 py-2 text-sm transition-colors hover:bg-neutral-100"
					>
						<div className="flex h-5 w-5 items-center justify-center rounded border-2 border-neutral-300 border-dashed">
							<PlusIcon className="h-3 w-3 text-neutral-500" />
						</div>
						<span className="font-medium text-neutral-600">
							Create workspace
						</span>
					</Link>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
