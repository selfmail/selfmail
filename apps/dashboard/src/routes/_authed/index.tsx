import { Alert, AlertDescription, Button } from "@selfmail/ui";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
	type DashboardWorkspace,
	getDashboardWorkspacesFn,
} from "#/lib/workspaces";
import { m } from "#/paraglide/messages";

export const Route = createFileRoute("/_authed/")({
	component: RouteComponent,
	validateSearch: (
		search: Record<string, unknown>,
	): { error?: "workspace-access" } =>
		search.error === "workspace-access" ? { error: search.error } : {},
	loader: async () => ({
		workspaces: await getDashboardWorkspacesFn(),
	}),
});

function RouteComponent() {
	const { user } = Route.useRouteContext();
	const { workspaces } = Route.useLoaderData();
	const { error } = Route.useSearch();

	return (
		<main className="flex min-h-dvh w-full flex-col bg-background px-5 py-6 text-foreground sm:px-8 lg:px-10">
			<div className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center gap-8 py-6">
				<header className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
					<div className="max-w-2xl space-y-3">
						<p className="truncate text-muted-foreground text-sm">
							{user.email}
						</p>
						<div className="space-y-2">
							<h1 className="text-balance font-semibold text-3xl sm:text-4xl">
								{m["dashboard.workspace_picker.title"]()}
							</h1>
							<p className="text-muted-foreground text-pretty text-sm sm:text-base">
								Choose where you want to read, route, and manage mail.
							</p>
						</div>
					</div>
					<Button asChild>
						<Link to="/onboarding">
							{m["dashboard.workspace_picker.create"]()}
						</Link>
					</Button>
				</header>

				{error ? (
					<Alert variant="destructive">
						<AlertDescription>
							{m["dashboard.errors.workspace_access"]()}
						</AlertDescription>
					</Alert>
				) : null}

				<section className="overflow-hidden rounded-lg border bg-card shadow-sm">
					{workspaces.length === 0 ? (
						<EmptyState />
					) : (
						<div className="divide-y">
							{workspaces.map((workspace) => (
								<WorkspaceTile key={workspace.id} workspace={workspace} />
							))}
						</div>
					)}
				</section>
			</div>
		</main>
	);
}

function WorkspaceTile({ workspace }: { workspace: DashboardWorkspace }) {
	return (
		<Link
			className="block px-4 py-4 outline-none transition-colors hover:bg-accent focus-visible:bg-accent focus-visible:ring-2 focus-visible:ring-ring/25 focus-visible:ring-inset sm:px-5"
			params={{
				workspaceSlug: workspace.slug,
			}}
			to="/$workspaceSlug"
		>
			<span className="block min-w-0">
				<span className="block truncate font-medium text-sm">
					{workspace.name}
				</span>
				<span className="mt-1 flex items-center gap-2 text-muted-foreground text-xs">
					<span className="truncate tabular-nums">{workspace.slug}</span>
					{workspace.description ? (
						<span className="hidden min-w-0 items-center gap-2 sm:flex">
							<span aria-hidden="true">/</span>
							<span className="truncate">{workspace.description}</span>
						</span>
					) : null}
				</span>
			</span>
		</Link>
	);
}

function EmptyState() {
	return (
		<div className="flex min-h-64 flex-col items-center justify-center gap-5 px-6 py-12 text-center">
			<div className="space-y-2">
				<p className="font-medium text-sm">
					{m["dashboard.workspace_picker.empty"]()}
				</p>
				<p className="max-w-sm text-muted-foreground text-pretty text-sm">
					Create your first workspace to start receiving and organizing mail.
				</p>
			</div>
			<Button asChild>
				<Link to="/onboarding">{m["dashboard.workspace_picker.create"]()}</Link>
			</Button>
		</div>
	);
}
