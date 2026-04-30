import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRightIcon } from "lucide-react";
import {
	type DashboardWorkspace,
	getDashboardWorkspacesFn,
} from "#/lib/workspaces";

export const Route = createFileRoute("/_authed/")({
	component: RouteComponent,
	loader: async () => ({
		workspaces: await getDashboardWorkspacesFn(),
	}),
});

function RouteComponent() {
	const { user } = Route.useRouteContext();
	const { workspaces } = Route.useLoaderData();

	return (
		<main className="min-h-dvh bg-background px-5 py-10 text-foreground sm:px-10">
			<div className="mx-auto flex w-full max-w-4xl flex-col gap-8">
				<header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
					<div className="space-y-2">
						<h1 className="text-balance font-medium text-3xl">
							Choose workspace
						</h1>
						<p className="text-muted-foreground text-pretty text-sm">
							Pick the workspace you want to open.
						</p>
					</div>
					<p className="text-muted-foreground text-sm">
						Signed in as <span className="text-foreground">{user.email}</span>
					</p>
				</header>

				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
					{workspaces.map((workspace) => (
						<WorkspaceTile key={workspace.id} workspace={workspace} />
					))}
				</div>
			</div>
		</main>
	);
}

function WorkspaceTile({ workspace }: { workspace: DashboardWorkspace }) {
	return (
		<Link
			className="group flex min-h-36 flex-col justify-between rounded-lg border border-border bg-card p-5 text-left shadow-sm ring-0 ring-neutral-300 transition-[box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:ring-4 focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2"
			params={{
				workspaceId: workspace.id,
			}}
			to="/$workspaceId"
		>
			<div className="flex items-start justify-between gap-4">
				<div className="min-w-0 space-y-1">
					<p className="truncate font-medium text-xl">{workspace.name}</p>
					<p className="truncate text-muted-foreground text-sm">
						{workspace.slug}
					</p>
				</div>
				<div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground transition-colors duration-200 group-hover:text-foreground">
					<ArrowRightIcon className="size-4" />
				</div>
			</div>
			<dl className="grid gap-3 text-sm sm:grid-cols-2">
				<div>
					<dt className="text-muted-foreground">Workspace ID</dt>
					<dd className="truncate font-mono text-xs">{workspace.id}</dd>
				</div>
				<div>
					<dt className="text-muted-foreground">Member ID</dt>
					<dd className="truncate font-mono text-xs">{workspace.memberId}</dd>
				</div>
			</dl>
		</Link>
	);
}
