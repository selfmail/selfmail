import { Link, useMatchRoute } from "@tanstack/react-router";
import {
	ArrowLeftIcon,
	ChartNoAxesCombinedIcon,
	CheckIcon,
	CodeXmlIcon,
	GlobeIcon,
	LayoutGridIcon,
	ListFilterIcon,
	MessageSquareIcon,
	SparklesIcon,
	UsersIcon,
	WorkflowIcon,
} from "lucide-react";
import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "#/components/ui";
import { cn } from "#/lib/utils";
import { m } from "#/paraglide/messages";

const consolePages = [
	{
		to: "/$workspaceSlug/ai",
		icon: SparklesIcon,
		label: m["dashboard.navigation.ai"],
	},
	{
		to: "/$workspaceSlug/workflows",
		icon: WorkflowIcon,
		label: m["dashboard.navigation.workflows"],
	},
	{
		to: "/$workspaceSlug/dev",
		icon: CodeXmlIcon,
		label: m["dashboard.navigation.developers"],
	},
	{ to: "/$workspaceSlug/logs", icon: ListFilterIcon, label: () => "Logs" },
	{
		to: "/$workspaceSlug/contacts",
		icon: UsersIcon,
		label: m["dashboard.navigation.contacts"],
	},
	{
		to: "/$workspaceSlug/conversations",
		icon: MessageSquareIcon,
		label: m["dashboard.navigation.conversations"],
	},
	{
		to: "/$workspaceSlug/analytics",
		icon: ChartNoAxesCombinedIcon,
		label: m["dashboard.settings.menu.analytics.title"],
	},
	{
		to: "/$workspaceSlug/domains",
		icon: GlobeIcon,
		label: m["dashboard.settings.menu.domains.title"],
	},
] as const;

interface ConsoleNavigationProps {
	workspaceSlug: string;
}

export function ConsoleNavigation({ workspaceSlug }: ConsoleNavigationProps) {
	const [open, setOpen] = useState(false);
	const matchRoute = useMatchRoute();
	const pages = consolePages.map((page) => ({
		...page,
		active: Boolean(
			matchRoute({ to: page.to, params: { workspaceSlug }, fuzzy: true }),
		),
	}));
	const currentPage = pages.find((page) => page.active);

	return (
		<Popover onOpenChange={setOpen} open={open}>
			<PopoverTrigger asChild>
				<button
					aria-label={`Console navigation: ${currentPage?.label() ?? "Console"}`}
					className="flex h-10 shrink-0 items-center gap-3 rounded-full bg-muted px-3 text-sm outline-none hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring data-[state=open]:bg-accent sm:pl-4"
					type="button"
				>
					<span className="hidden max-w-40 truncate font-medium sm:block">
						{currentPage?.label() ?? "Console"}
					</span>
					<span className="hidden h-4 w-px bg-border sm:block" />
					<LayoutGridIcon aria-hidden="true" className="size-4" />
				</button>
			</PopoverTrigger>
			<PopoverContent
				align="end"
				aria-label="Console pages"
				className="w-80 max-w-[calc(100vw-2rem)] overflow-y-auto rounded-2xl border p-2 [max-height:var(--radix-popover-content-available-height)]"
				collisionPadding={16}
				sideOffset={12}
			>
				<div className="px-3 pt-2 pb-3 font-medium text-muted-foreground text-xs">
					Console
				</div>
				<nav aria-label="Console" className="grid grid-cols-2 gap-1">
					{pages.map(({ to, icon: Icon, label, active }) => (
						<Link
							aria-current={active ? "page" : undefined}
							className={cn(
								"flex min-w-0 flex-col gap-3 rounded-xl p-3 text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
								active && "bg-accent text-accent-foreground",
							)}
							key={to}
							onClick={() => setOpen(false)}
							params={{ workspaceSlug }}
							to={to}
						>
							<span className="flex items-center justify-between">
								<Icon aria-hidden="true" className="size-5" />
								{active && (
									<CheckIcon aria-hidden="true" className="size-3.5" />
								)}
							</span>
							<span className="break-words font-medium text-sm">{label()}</span>
						</Link>
					))}
				</nav>
				<div className="mt-2 border-t pt-2">
					<Link
						className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-muted-foreground text-sm outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
						onClick={() => setOpen(false)}
						params={{ workspaceSlug }}
						to="/$workspaceSlug"
					>
						<ArrowLeftIcon aria-hidden="true" className="size-4" />
						{m["dashboard.inbox.unified"]()}
					</Link>
				</div>
			</PopoverContent>
		</Popover>
	);
}
