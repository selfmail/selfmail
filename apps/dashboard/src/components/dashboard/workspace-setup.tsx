import { cn, Popover, PopoverContent, PopoverTrigger } from "@selfmail/ui";
import { useQuery } from "@tanstack/react-query";
import { getRouteApi } from "@tanstack/react-router";
import { Check, FileText, Globe, type LucideIcon, Mail } from "lucide-react";
import { useRef, useState } from "react";
import { getWorkspaceSetup } from "#/lib/workspaces/setup";

interface SetupStep {
	id: "description" | "domain" | "email";
	label: string;
	icon: LucideIcon;
}

const setupSteps: SetupStep[] = [
	{
		id: "description",
		label: "Add a workspace description",
		icon: FileText,
	},
	{ id: "domain", label: "Connect your domain", icon: Globe },
	{
		id: "email",
		label: "Create your first email address",
		icon: Mail,
	},
];

interface WorkspaceSetupProps {
	workspaceSlug: string;
}

export function WorkspaceSetup({ workspaceSlug }: WorkspaceSetupProps) {
	const { user } = getRouteApi("/_authed").useRouteContext();
	const [hiddenWorkspaces, setHiddenWorkspaces] = useState<string[]>([]);
	const workspaceKey = `${user.id}:${workspaceSlug}`;
	const hidden = hiddenWorkspaces.includes(workspaceKey);
	const triggerRef = useRef<HTMLButtonElement>(null);
	const { data } = useQuery({
		enabled: !hidden,
		queryKey: ["workspace-setup", user.id, workspaceSlug],
		queryFn: () => getWorkspaceSetup({ data: { workspaceSlug } }),
		staleTime: 30_000,
		gcTime: 300_000,
		refetchInterval: 60_000,
	});
	const [open, setOpen] = useState(false);
	const openedByHover = useRef(false);
	const steps = setupSteps.map((step) => ({
		...step,
		completed: data?.[step.id] ?? false,
	}));
	const completed = steps.filter((step) => step.completed).length;
	const NextIcon = steps.find((step) => !step.completed)?.icon ?? Check;

	if (!data || hidden) {
		return null;
	}

	return (
		<Popover onOpenChange={setOpen} open={open}>
			<PopoverTrigger asChild>
				<button
					ref={triggerRef}
					aria-label={`Workspace setup: ${completed} of ${steps.length} steps complete`}
					className="relative flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/25"
					onClick={(event) => {
						event.preventDefault();
						openedByHover.current = false;
						setOpen(true);
					}}
					onPointerEnter={(event) => {
						if (event.pointerType === "mouse" && !open) {
							openedByHover.current = true;
							setOpen(true);
						}
					}}
					type="button"
				>
					<svg
						aria-hidden="true"
						className="absolute inset-0 size-full"
						viewBox="0 0 44 44"
					>
						{steps.map((step, index) => (
							<circle
								className={cn(
									"stroke-border",
									step.completed && "stroke-green-500",
								)}
								cx="22"
								cy="22"
								fill="none"
								key={step.id}
								pathLength="100"
								r="19"
								strokeDasharray={`${100 / steps.length - 4} 100`}
								strokeLinecap="round"
								strokeWidth="3"
								transform={`rotate(${-90 + (index * 360) / steps.length + 7.2} 22 22)`}
							/>
						))}
					</svg>
					<NextIcon aria-hidden="true" className="size-3.5 text-foreground" />
				</button>
			</PopoverTrigger>
			<PopoverContent
				align="end"
				aria-label="Workspace setup"
				className="w-80 max-w-[calc(100vw-2rem)]"
				onOpenAutoFocus={(event) => {
					if (openedByHover.current) {
						event.preventDefault();
					}
				}}
				sideOffset={8}
			>
				<div>
					<h2 className="font-medium text-sm">Set up your workspace</h2>
					<p className="mt-1 text-muted-foreground text-xs">
						{completed} of {steps.length} steps complete
					</p>
				</div>
				<ul className="mt-4 space-y-3">
					{steps.map((step) => {
						const Icon = step.completed ? Check : step.icon;
						return (
							<li
								className={cn(
									"flex items-center gap-3 text-sm",
									step.completed && "text-muted-foreground",
								)}
								key={step.id}
							>
								<Icon aria-hidden="true" className="size-4 shrink-0" />
								<span className={cn(step.completed && "line-through")}>
									{step.label}
									{step.completed && (
										<span className="sr-only"> (completed)</span>
									)}
								</span>
							</li>
						);
					})}
				</ul>
				<button
					className="mt-4 cursor-pointer text-muted-foreground text-xs underline underline-offset-4 hover:text-foreground focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/25"
					onClick={() => {
						const nextButton = triggerRef.current?.nextElementSibling;
						if (nextButton instanceof HTMLButtonElement) {
							nextButton.focus();
						}
						setOpen(false);
						setHiddenWorkspaces((current) => [...current, workspaceKey]);
					}}
					type="button"
				>
					Hide setup
				</button>
			</PopoverContent>
		</Popover>
	);
}
