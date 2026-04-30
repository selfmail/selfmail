import type { LucideIcon } from "lucide-react";
import {
	BotIcon,
	BoxesIcon,
	ChevronRightIcon,
	Code2Icon,
	CommandIcon,
	HomeIcon,
	MailIcon,
	SearchIcon,
	SettingsIcon,
	UserRoundIcon,
	WandSparklesIcon,
} from "lucide-react";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroupLabel,
	SidebarHeader,
} from "#/components/ui";

interface DashboardSidebarProps {
	userEmail: string;
	workspaceName: string;
}

interface NavItem {
	title: string;
	icon: LucideIcon;
	hasChildren?: boolean;
}

const exploreNav: NavItem[] = [
	{ title: "Home", icon: HomeIcon },
	{ title: "Inbox", icon: MailIcon, hasChildren: true },
	{ title: "Contacts", icon: BoxesIcon, hasChildren: true },
];

const buildNav: NavItem[] = [
	{ title: "Automations", icon: BotIcon, hasChildren: true },
	{ title: "Templates", icon: Code2Icon },
	{ title: "Magic Compose", icon: WandSparklesIcon },
];

export function DashboardSidebar({
	userEmail,
	workspaceName,
}: DashboardSidebarProps) {
	const fallbackInitial = workspaceName.slice(0, 1).toUpperCase();

	return (
		<Sidebar
			className="h-dvh min-h-dvh border-sidebar-border border-r bg-sidebar"
			collapsible="none"
		>
			<SidebarHeader className="gap-2 px-3 pt-4 pb-1">
				<button
					className="flex h-9 min-w-0 items-center gap-2 rounded-md px-2 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:outline-2 focus-visible:outline-sidebar-ring focus-visible:outline-offset-2"
					type="button"
				>
					<span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-sidebar-primary font-medium text-sidebar-primary-foreground text-xs">
						{fallbackInitial}
					</span>
					<span className="truncate font-medium text-sm">{workspaceName}</span>
				</button>
				<button
					className="flex h-8 w-full cursor-pointer items-center justify-between rounded-md bg-muted/70 px-2 text-muted-foreground text-sm hover:bg-muted focus-visible:outline-2 focus-visible:outline-sidebar-ring focus-visible:outline-offset-2"
					type="button"
				>
					<span className="flex min-w-0 items-center gap-2">
						<SearchIcon className="size-4 shrink-0" />
						<span className="truncate">Search</span>
					</span>
					<span className="flex items-center gap-0.5 text-muted-foreground/70 text-xs">
						<CommandIcon className="size-3" />K
					</span>
				</button>
			</SidebarHeader>
			<SidebarContent className="gap-2 px-2">
				<SidebarNavGroup items={exploreNav} label="Explore" />
				<SidebarNavGroup items={buildNav} label="Build" />
			</SidebarContent>
			<SidebarFooter className="gap-1 px-3 pb-4">
				<div className="flex items-center justify-between gap-2">
					<button
						aria-label="Open settings"
						className="flex size-8 items-center justify-center rounded-md text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:outline-2 focus-visible:outline-sidebar-ring focus-visible:outline-offset-2"
						type="button"
					>
						<SettingsIcon className="size-4" />
					</button>
					<button
						className="flex min-w-0 flex-1 items-center justify-end gap-2 rounded-md px-1 py-1 text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:outline-2 focus-visible:outline-sidebar-ring focus-visible:outline-offset-2"
						type="button"
					>
						<span className="truncate text-sm">{userEmail}</span>
						<span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
							<UserRoundIcon className="size-3.5" />
						</span>
					</button>
				</div>
			</SidebarFooter>
		</Sidebar>
	);
}

function SidebarNavGroup({
	items,
	label,
}: {
	items: NavItem[];
	label: string;
}) {
	return (
		<div className="flex flex-col gap-0.5">
			<SidebarGroupLabel className="h-7 px-2 text-muted-foreground">
				{label}
			</SidebarGroupLabel>
			<nav className="flex flex-col gap-0.5">
				{items.map((item) => (
					<button
						className="flex h-8 items-center gap-3 rounded-md px-2 text-sidebar-foreground/70 text-sm hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:outline-2 focus-visible:outline-sidebar-ring focus-visible:outline-offset-2"
						key={item.title}
						type="button"
					>
						<item.icon className="size-4 shrink-0" />
						<span className="min-w-0 flex-1 truncate text-left">
							{item.title}
						</span>
						{item.hasChildren && (
							<ChevronRightIcon className="size-3.5 shrink-0 text-muted-foreground" />
						)}
					</button>
				))}
			</nav>
		</div>
	);
}
