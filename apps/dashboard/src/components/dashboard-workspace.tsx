import {
	CheckIcon,
	ChevronsUpDownIcon,
	LogOutIcon,
	Maximize2Icon,
	PaperclipIcon,
	PlaneTakeoffIcon,
	PlusIcon,
	SettingsIcon,
	XIcon,
} from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "#/lib/utils";

type WorkspaceSummary = {
	id: string;
	image: string | null;
	name: string;
	slug: string;
};

type DashboardWorkspaceProps = {
	currentWorkspace: WorkspaceSummary;
	userEmail: string;
	workspaces: WorkspaceSummary[];
};

type Email = {
	attachments?: number;
	date: string;
	from: string;
	initial: string;
	read?: boolean;
	snippet: string;
	subject: string;
};

const platformLinks = ["Ai", "Workflows", "Developers", "Changelog"];
const workspaceLinks = [
	"Members",
	"Activity",
	"Storage",
	"Settings",
	"Domains",
];

const sampleEmails: Email[] = [
	{
		attachments: 2,
		date: "2h ago",
		from: "Selfmail Alerts",
		initial: "S",
		snippet:
			"Your inbound route accepted 284 messages today with no deferred deliveries.",
		subject: "Daily deliverability summary",
	},
	{
		date: "5h ago",
		from: "Mira from Acme",
		initial: "M",
		read: true,
		snippet:
			"Thanks for the update. The workspace handoff looks clean on our side.",
		subject: "Re: Workspace migration",
	},
	{
		attachments: 1,
		date: "1d ago",
		from: "Billing",
		initial: "B",
		read: true,
		snippet:
			"Your invoice and usage details are attached for the current billing period.",
		subject: "April invoice",
	},
];

export function DashboardWorkspace({
	currentWorkspace,
	userEmail,
	workspaces,
}: DashboardWorkspaceProps) {
	const primaryAddress = `hello@${currentWorkspace.slug || "workspace"}.selfmail.app`;
	const addresses = [
		primaryAddress,
		`support@${currentWorkspace.slug || "workspace"}.selfmail.app`,
	];

	return (
		<div className="flex min-h-dvh w-full flex-col items-center bg-neutral-50">
			<div className="flex w-full flex-col gap-12 px-5 py-6 lg:px-24 xl:px-32">
				<DashboardHeader
					currentWorkspace={currentWorkspace}
					userEmail={userEmail}
					workspaces={workspaces}
				/>
				<DashboardNavigation addresses={addresses} />
				<main className="flex w-full flex-col gap-4">
					<div className="flex w-full flex-row items-center justify-between">
						<div className="flex flex-col gap-1">
							<h1 className="text-balance font-medium text-2xl">
								Unified Inbox
							</h1>
							<p className="tabular-nums text-neutral-600">3 emails</p>
						</div>
					</div>
					<EmailList emails={sampleEmails} />
				</main>
			</div>
			<EmailPreview />
		</div>
	);
}

function DashboardHeader({
	currentWorkspace,
	userEmail,
	workspaces,
}: DashboardWorkspaceProps) {
	return (
		<header className="flex w-full flex-row items-center justify-between gap-4">
			<div className="relative">
				<button
					className="flex cursor-pointer flex-row items-center space-x-3 rounded-lg pr-1 transition hover:bg-neutral-200 hover:ring-4 hover:ring-neutral-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-neutral-200"
					type="button"
				>
					<WorkspaceAvatar workspace={currentWorkspace} />
					<h3 className="max-w-42 truncate font-medium text-lg sm:max-w-none">
						{currentWorkspace.name}
					</h3>
					<ChevronsUpDownIcon className="size-4 text-neutral-500" />
				</button>
				<div className="absolute top-full left-0 z-50 mt-2 hidden w-64 rounded-lg border border-neutral-200 bg-white p-2 shadow-lg">
					<div className="mb-2 px-2 py-1.5 text-neutral-500 text-xs">
						Switch workspace
					</div>
					<div className="flex flex-col gap-1">
						{workspaces.map((workspace) => (
							<button
								className={cn(
									"flex w-full cursor-pointer flex-row items-center justify-between rounded-md px-2 py-2 text-left transition hover:bg-neutral-100",
									workspace.id === currentWorkspace.id && "bg-neutral-50",
								)}
								key={workspace.id}
								type="button"
							>
								<div className="flex flex-row items-center space-x-3">
									<WorkspaceAvatar size="sm" workspace={workspace} />
									<span className="truncate text-sm">{workspace.name}</span>
								</div>
								{workspace.id === currentWorkspace.id ? (
									<CheckIcon className="size-4 text-neutral-600" />
								) : null}
							</button>
						))}
					</div>
					<HeaderMenuItem icon={<SettingsIcon className="size-4" />}>
						Account Settings
					</HeaderMenuItem>
					<HeaderMenuItem icon={<LogOutIcon className="size-4" />}>
						Logout
					</HeaderMenuItem>
					<HeaderMenuItem icon={<PlusIcon className="size-4" />}>
						Create workspace
					</HeaderMenuItem>
				</div>
			</div>
			<div className="hidden min-w-0 text-neutral-500 text-sm lg:block">
				<span className="truncate">{userEmail}</span>
			</div>
			<a
				className="flex w-min items-center space-x-3 rounded-xl border border-dashed border-neutral-300 p-2 text-center text-neutral-600 text-sm hover:bg-neutral-100 hover:ring-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-300"
				href="#compose"
			>
				<PlaneTakeoffIcon className="inline-block size-5" />
				<span>Compose</span>
			</a>
		</header>
	);
}

function HeaderMenuItem({
	children,
	icon,
}: {
	children: ReactNode;
	icon: ReactNode;
}) {
	return (
		<button
			className="mt-2 flex w-full cursor-pointer flex-row items-center gap-2 border-neutral-200 border-t px-2 py-2 text-left text-sm transition first:border-t-0 hover:bg-neutral-100"
			type="button"
		>
			<span className="text-neutral-500">{icon}</span>
			{children}
		</button>
	);
}

function WorkspaceAvatar({
	size = "md",
	workspace,
}: {
	size?: "sm" | "md";
	workspace: WorkspaceSummary;
}) {
	const sizeClass = size === "sm" ? "size-6 rounded-md text-xs" : "size-7";

	if (workspace.image) {
		return (
			<img
				alt={workspace.name}
				className={cn(sizeClass, "rounded-lg object-cover")}
				src={workspace.image}
			/>
		);
	}

	return (
		<div
			className={cn(
				"flex items-center justify-center rounded-lg bg-neutral-600 font-medium text-white",
				size === "sm" ? "size-6 text-xs" : "size-7 text-lg",
			)}
		>
			{workspace.name.charAt(0).toUpperCase()}
		</div>
	);
}

function DashboardNavigation({ addresses }: { addresses: string[] }) {
	return (
		<nav className="flex w-full flex-col justify-between gap-8 md:flex-row">
			<NavColumn title="Addresses">
				{addresses.map((address, index) => (
					<DashboardNavLink active={index === 0} href="#address" key={address}>
						{address}
					</DashboardNavLink>
				))}
				<a className="text-blue-500 text-sm" href="#new-address">
					+ Add new address
				</a>
			</NavColumn>
			<NavColumn title="Platform">
				{platformLinks.map((link) => (
					<DashboardNavLink href="#platform" key={link}>
						{link}
					</DashboardNavLink>
				))}
			</NavColumn>
			<NavColumn title="Workspace">
				{workspaceLinks.map((link) => (
					<DashboardNavLink href="#workspace" key={link}>
						{link}
					</DashboardNavLink>
				))}
			</NavColumn>
		</nav>
	);
}

function NavColumn({
	children,
	title,
}: {
	children: ReactNode;
	title: string;
}) {
	return (
		<div className="flex min-w-0 flex-col gap-3">
			<p className="text-neutral-700 text-sm">{title}</p>
			{children}
		</div>
	);
}

function DashboardNavLink({
	active,
	children,
	href,
}: {
	active?: boolean;
	children: ReactNode;
	href: string;
}) {
	return (
		<a className="group w-full" href={href}>
			<span
				className={cn(
					"w-fit rounded-md font-medium text-black text-xl ring-neutral-200 transition-all group-hover:bg-neutral-200 group-hover:ring-4",
					active && "bg-neutral-200 ring-4",
				)}
			>
				{children}
			</span>
		</a>
	);
}

function EmailList({ emails }: { emails: Email[] }) {
	return (
		<div className="flex w-full flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white">
			{emails.map((email, index) => (
				<EmailItem
					email={email}
					isLast={index === emails.length - 1}
					key={email.subject}
				/>
			))}
		</div>
	);
}

function EmailItem({ email, isLast }: { email: Email; isLast: boolean }) {
	return (
		<div
			className={cn(
				"group cursor-pointer px-4 py-3 transition-colors hover:bg-neutral-50",
				!isLast && "border-neutral-200 border-b",
			)}
		>
			<div className="flex items-start gap-3">
				<div className="mt-1 shrink-0">
					<div className="flex size-10 items-center justify-center rounded-full border border-neutral-200 bg-linear-to-br from-neutral-100 to-neutral-200">
						<span className="font-medium text-neutral-700 text-sm">
							{email.initial}
						</span>
					</div>
				</div>
				<div className="min-w-0 flex-1">
					<div className="mb-1 flex items-baseline justify-between gap-2">
						<div className="flex min-w-0 items-center gap-2">
							<p
								className={cn(
									"truncate font-medium text-sm",
									email.read ? "text-neutral-700" : "text-neutral-900",
								)}
							>
								{email.from}
							</p>
							{email.read ? null : (
								<span className="size-2 shrink-0 rounded-full bg-neutral-900" />
							)}
						</div>
						<span className="shrink-0 text-neutral-500 text-xs">
							{email.date}
						</span>
					</div>
					<p
						className={cn(
							"mb-1 truncate text-sm",
							email.read ? "text-neutral-600" : "font-medium text-neutral-900",
						)}
					>
						{email.subject}
					</p>
					<p className="mb-1 line-clamp-2 text-neutral-500 text-sm">
						{email.snippet}
					</p>
					{email.attachments ? (
						<div className="mt-2 flex items-center gap-1 text-neutral-600 text-xs">
							<PaperclipIcon className="size-3.5" />
							<span>
								{email.attachments}{" "}
								{email.attachments === 1 ? "attachment" : "attachments"}
							</span>
						</div>
					) : null}
				</div>
			</div>
		</div>
	);
}

function EmailPreview() {
	return (
		<aside className="fixed inset-y-0 right-0 z-50 hidden w-full max-w-2xl flex-col overflow-hidden bg-white shadow-2xl xl:flex">
			<div className="flex items-center justify-between border-neutral-200 border-b px-6 py-4">
				<h2 className="truncate font-medium text-lg">Email Preview</h2>
				<div className="flex items-center gap-2">
					<button
						className="flex items-center gap-2 rounded-lg px-3 py-2 text-neutral-700 text-sm transition-colors hover:bg-neutral-100"
						type="button"
					>
						<Maximize2Icon className="size-4" />
						<span>Fullscreen</span>
					</button>
					<button
						aria-label="Close preview"
						className="rounded-lg p-2 text-neutral-700 transition-colors hover:bg-neutral-100"
						type="button"
					>
						<XIcon className="size-5" />
					</button>
				</div>
			</div>
			<div className="flex-1 overflow-y-auto p-6">
				<div className="mb-6">
					<h1 className="mb-4 text-balance font-medium text-2xl">
						Daily deliverability summary
					</h1>
					<div className="mb-4 flex items-start gap-3">
						<div className="flex size-12 items-center justify-center rounded-full border border-neutral-200 bg-linear-to-br from-neutral-100 to-neutral-200">
							<span className="font-medium text-neutral-700">S</span>
						</div>
						<div className="flex-1">
							<p className="font-medium text-neutral-900">Selfmail Alerts</p>
							<p className="text-neutral-600 text-sm">To: hello@selfmail.app</p>
							<p className="text-neutral-500 text-xs">Apr 30, 2026, 8:42 AM</p>
						</div>
					</div>
				</div>
				<div className="mb-6 rounded-lg border border-neutral-200 p-4">
					<p className="mb-2 font-medium text-neutral-900 text-sm">
						2 Attachments
					</p>
					<div className="space-y-2">
						{["summary.csv", "events.json"].map((filename) => (
							<div
								className="flex items-center gap-2 rounded-md bg-neutral-50 px-3 py-2"
								key={filename}
							>
								<PaperclipIcon className="size-4 text-neutral-600" />
								<span className="text-neutral-900 text-sm">{filename}</span>
								<span className="text-neutral-500 text-xs">(24 KB)</span>
							</div>
						))}
					</div>
				</div>
				<div className="max-w-none">
					<p className="text-pretty whitespace-pre-wrap font-sans text-neutral-900 text-sm leading-6">
						Your inbound route accepted 284 messages today with no deferred
						deliveries. SPF, DKIM, and DMARC checks are passing across the
						workspace.
					</p>
				</div>
			</div>
		</aside>
	);
}
