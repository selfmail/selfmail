import { Link, useMatchRoute } from "@tanstack/react-router";
import {
	ArrowLeftIcon,
	ChartNoAxesCombinedIcon,
	CodeXmlIcon,
	GlobeIcon,
	ListFilterIcon,
	MessageSquareIcon,
	SparklesIcon,
	UsersIcon,
	WorkflowIcon,
} from "lucide-react";
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
	{
		to: "/$workspaceSlug/logs",
		icon: ListFilterIcon,
		label: m["dashboard.navigation.logs"],
	},
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

const navigationItemClassName =
	"group/console-menu-item flex h-9 min-w-0 items-center gap-2 rounded-lg px-3 font-medium text-sm no-underline outline-none hover:bg-muted-foreground/15 hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring dark:hover:bg-accent";

export function ConsoleNavigation({ workspaceSlug }: ConsoleNavigationProps) {
	const matchRoute = useMatchRoute();

	return (
		<nav
			aria-label={m["dashboard.console.pages_label"]()}
			className="flex flex-col gap-1"
		>
			<Link
				className={navigationItemClassName}
				params={{ workspaceSlug }}
				aria-label={m["dashboard.console.back_to_inbox"]()}
				title={m["dashboard.console.back_to_inbox"]()}
				to="/$workspaceSlug"
			>
				<ArrowLeftIcon
					aria-hidden="true"
					className="size-4 shrink-0 text-muted-foreground group-hover/console-menu-item:text-current"
				/>
				<span className="hidden truncate sm:block">
					{m["dashboard.console.back_to_inbox"]()}
				</span>
			</Link>
			{consolePages.map(({ to, icon: Icon, label }) => {
				const active = Boolean(
					matchRoute({ to, params: { workspaceSlug }, fuzzy: true }),
				);

				return (
					<Link
						aria-label={label()}
						aria-current={active ? "page" : undefined}
						className={cn(
							navigationItemClassName,
							active &&
								"bg-muted-foreground/15 text-accent-foreground dark:bg-accent",
						)}
						data-active={active}
						key={to}
						params={{ workspaceSlug }}
						title={label()}
						to={to}
					>
						<Icon
							aria-hidden="true"
							className="size-4 shrink-0 text-muted-foreground group-hover/console-menu-item:text-current group-data-[active=true]/console-menu-item:text-current"
						/>
						<span className="hidden truncate sm:block">{label()}</span>
					</Link>
				);
			})}
		</nav>
	);
}
