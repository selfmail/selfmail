import { useNavigate } from "@tanstack/react-router";
import {
	CheckIcon,
	ChevronsUpDownIcon,
	CreditCardIcon,
	GlobeIcon,
	LifeBuoyIcon,
	PlaneTakeoffIcon,
	PlusIcon,
	SettingsIcon,
	ShieldCheckIcon,
	UsersIcon,
	WebhookIcon,
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
import { m } from "#/paraglide/messages";
import type { DashboardHeaderProps } from "./types";
import { WorkspaceAvatar } from "./workspace-avatar";

export function DashboardHeader({
	currentWorkspace,
	workspaces,
}: DashboardHeaderProps) {
	const navigate = useNavigate();
	const goToSection = (section: string) => {
		window.location.hash = section;
	};
	const dropdownItemClassName = "cursor-pointer";

	return (
		<header className="flex w-full flex-row items-center justify-between gap-4">
			<Dropdown>
				<DropdownTrigger
					aria-label={m["dashboard.header.switch_workspace"]()}
					className="h-auto max-w-full cursor-pointer justify-start rounded-lg border-0 bg-transparent px-0 py-0 pr-1 text-base hover:bg-neutral-200 hover:ring-4 hover:ring-neutral-200 focus-visible:ring-neutral-200 data-[popup-open]:bg-neutral-200 data-[popup-open]:ring-4 data-[popup-open]:ring-neutral-200"
				>
					<WorkspaceAvatar workspace={currentWorkspace} />
					<h3 className="max-w-42 truncate font-medium text-lg sm:max-w-none">
						{currentWorkspace.name}
					</h3>
					<ChevronsUpDownIcon className="size-4 text-neutral-500" />
				</DropdownTrigger>
				<DropdownContent align="start" className="min-w-72">
					<DropdownGroup>
						<DropdownLabel>{m["dashboard.header.workspaces"]()}</DropdownLabel>
						{workspaces.map((workspace) => (
							<DropdownItem
								className={cn(
									"grid-cols-[1.5rem_1fr_auto] gap-2",
									dropdownItemClassName,
									workspace.id === currentWorkspace.id && "bg-neutral-100",
								)}
								icon={<WorkspaceAvatar size="sm" workspace={workspace} />}
								iconClassName="size-6"
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
					<DropdownGroup>
						<DropdownLabel>{m["dashboard.header.manage"]()}</DropdownLabel>
						<DropdownItem
							className={dropdownItemClassName}
							icon={<SettingsIcon className="size-4" />}
							onClick={() =>
								navigate({
									params: {
										workspaceSlug: currentWorkspace.slug,
									},
									to: "/$workspaceSlug/settings",
								})
							}
						>
							{m["dashboard.header.settings"]()}
						</DropdownItem>
						<DropdownItem
							className={dropdownItemClassName}
							icon={<UsersIcon className="size-4" />}
							onClick={() => goToSection("members")}
						>
							{m["dashboard.header.members"]()}
						</DropdownItem>
						<DropdownItem
							className={dropdownItemClassName}
							icon={<CreditCardIcon className="size-4" />}
							onClick={() => goToSection("billing")}
						>
							{m["dashboard.header.billing"]()}
						</DropdownItem>
						<DropdownItem
							className={dropdownItemClassName}
							icon={<GlobeIcon className="size-4" />}
							onClick={() => goToSection("domains")}
						>
							{m["dashboard.header.domains"]()}
						</DropdownItem>
						<DropdownItem
							className={dropdownItemClassName}
							icon={<WebhookIcon className="size-4" />}
							onClick={() => goToSection("webhooks")}
						>
							{m["dashboard.header.webhooks"]()}
						</DropdownItem>
						<DropdownItem
							className={dropdownItemClassName}
							icon={<ShieldCheckIcon className="size-4" />}
							onClick={() => goToSection("security")}
						>
							{m["dashboard.header.security"]()}
						</DropdownItem>
						<DropdownItem
							className={dropdownItemClassName}
							icon={<LifeBuoyIcon className="size-4" />}
							onClick={() => goToSection("support")}
						>
							{m["dashboard.header.support"]()}
						</DropdownItem>
					</DropdownGroup>
					<DropdownSeparator />
					<DropdownItem
						className={dropdownItemClassName}
						icon={<PlusIcon className="size-4" />}
						onClick={() =>
							navigate({
								to: "/onboarding",
							})
						}
					>
						{m["dashboard.header.create_workspace"]()}
					</DropdownItem>
				</DropdownContent>
			</Dropdown>

			<a
				className="flex items-center space-x-3 rounded-xl border border-neutral-300 border-dashed p-2 text-center text-neutral-600 text-sm hover:bg-neutral-100 hover:ring-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-300"
				href="#compose"
			>
				<PlaneTakeoffIcon className="inline-block size-5" />
				<span>{m["dashboard.header.compose"]()}</span>
			</a>
		</header>
	);
}
