import { useNavigate } from "@tanstack/react-router";
import {
	CheckIcon,
	ChevronsUpDownIcon,
	PlaneTakeoffIcon,
	PlusIcon,
} from "lucide-react";
import {
	cn,
	Dropdown,
	DropdownContent,
	DropdownGroup,
	DropdownItem,
	DropdownLabel,
	DropdownSeparator,
	DropdownTrigger,
} from "#/components/ui";
import type { DashboardWorkspaceProps } from "./types";
import { WorkspaceAvatar } from "./workspace-avatar";

export function DashboardHeader({
	currentWorkspace,
	workspaces,
}: DashboardWorkspaceProps) {
	const navigate = useNavigate();

	return (
		<header className="flex w-full flex-row items-center justify-between gap-4">
			<Dropdown>
				<DropdownTrigger
					aria-label="Switch workspace"
					className="h-auto max-w-full justify-start rounded-lg border-0 bg-transparent px-0 py-0 pr-1 text-base hover:bg-neutral-200 hover:ring-4 hover:ring-neutral-200 focus-visible:ring-neutral-200 data-[popup-open]:bg-neutral-200 data-[popup-open]:ring-4 data-[popup-open]:ring-neutral-200"
				>
					<WorkspaceAvatar workspace={currentWorkspace} />
					<h3 className="max-w-42 truncate font-medium text-lg sm:max-w-none">
						{currentWorkspace.name}
					</h3>
					<ChevronsUpDownIcon className="size-4 text-neutral-500" />
				</DropdownTrigger>
				<DropdownContent align="start" className="min-w-72">
					<DropdownGroup>
						<DropdownLabel>Workspaces</DropdownLabel>
						{workspaces.map((workspace) => (
							<DropdownItem
								className={cn(
									"grid-cols-[1.5rem_1fr_auto]",
									workspace.id === currentWorkspace.id && "bg-neutral-100",
								)}
								icon={<WorkspaceAvatar size="sm" workspace={workspace} />}
								key={workspace.id}
								onClick={() =>
									navigate({
										params: {
											workspaceSlug: workspace.slug,
										},
										to: "/$workspaceSlug",
									})
								}
								shortcut={
									workspace.id === currentWorkspace.id ? (
										<CheckIcon className="size-4 text-neutral-600" />
									) : null
								}
							>
								{workspace.name}
							</DropdownItem>
						))}
					</DropdownGroup>
					<DropdownSeparator />
					<DropdownItem
						icon={<PlusIcon className="size-4" />}
						onClick={() =>
							navigate({
								to: "/onboarding",
							})
						}
					>
						Create workspace
					</DropdownItem>
				</DropdownContent>
			</Dropdown>

			<a
				className="flex items-center space-x-3 rounded-xl border border-neutral-300 border-dashed p-2 text-center text-neutral-600 text-sm hover:bg-neutral-100 hover:ring-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-300"
				href="#compose"
			>
				<PlaneTakeoffIcon className="inline-block size-5" />
				<span>Compose</span>
			</a>
		</header>
	);
}
