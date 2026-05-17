import { createFileRoute, Outlet } from "@tanstack/react-router";
import { getWorkspace } from "#/lib/workspaces";

type WorkspaceRouteLogLevel = "debug" | "error" | "warn";

function logWorkspaceRoute(
	level: WorkspaceRouteLogLevel,
	message: string,
	details: Record<string, unknown>,
) {
	if (level === "debug" && process.env.NODE_ENV === "production") {
		return;
	}

	console[level](`[workspace-route] ${message}`, details);
}

export const Route = createFileRoute("/_authed/$workspaceSlug/_workspace")({
	component: WorkspaceRouteComponent,
	beforeLoad: async ({ params }) => {
		const startedAt = Date.now();
		const workspaceSlug = params.workspaceSlug?.trim();

		if (!workspaceSlug) {
			logWorkspaceRoute("warn", "missing workspace slug", {
				params,
			});
			throw new Response("Workspace slug is required", { status: 400 });
		}

		logWorkspaceRoute("debug", "loading workspace", {
			workspaceSlug,
		});

		const result = await getWorkspace({
			data: {
				workspaceSlug,
			},
		}).catch((error: unknown) => {
			logWorkspaceRoute("error", "workspace lookup failed", {
				durationMs: Date.now() - startedAt,
				error,
				workspaceSlug,
			});
			throw error;
		});

		if (!result) {
			logWorkspaceRoute("error", "workspace lookup returned no result", {
				durationMs: Date.now() - startedAt,
				workspaceSlug,
			});
			throw new Response("Workspace lookup failed", { status: 500 });
		}

		const { member, workspace } = result;

		if (!(workspace && member)) {
			logWorkspaceRoute("warn", "workspace or member missing", {
				durationMs: Date.now() - startedAt,
				hasMember: Boolean(member),
				hasWorkspace: Boolean(workspace),
				workspaceSlug,
			});
			throw new Response("Workspace not found", { status: 404 });
		}

		if (workspace.slug !== workspaceSlug) {
			logWorkspaceRoute("error", "workspace slug mismatch", {
				durationMs: Date.now() - startedAt,
				receivedWorkspaceId: workspace.id,
				receivedWorkspaceSlug: workspace.slug,
				workspaceSlug,
			});
			throw new Response("Workspace lookup mismatch", { status: 409 });
		}

		logWorkspaceRoute("debug", "workspace loaded", {
			durationMs: Date.now() - startedAt,
			memberId: member.id,
			workspaceId: workspace.id,
			workspaceSlug,
		});

		return {
			member,
			workspace,
		};
	},
});

function WorkspaceRouteComponent() {
	const { member, workspace } = Route.useRouteContext();

	if (!(workspace && member)) {
		logWorkspaceRoute("error", "workspace context missing before render", {
			hasMember: Boolean(member),
			hasWorkspace: Boolean(workspace),
		});
		throw new Error("Workspace context is missing");
	}

	return <Outlet />;
}
