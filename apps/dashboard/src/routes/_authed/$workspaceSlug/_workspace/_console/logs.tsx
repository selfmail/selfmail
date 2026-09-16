import { createFileRoute } from "@tanstack/react-router";
import { AuditLogsSettingsPage } from "#/components/settings/audit-logs";
import { m } from "#/paraglide/messages";

export const Route = createFileRoute(
	"/_authed/$workspaceSlug/_workspace/_console/logs",
)({ component: LogsPage });

function LogsPage() {
	const { member, workspace } = Route.useRouteContext();
	const { workspaceSlug } = Route.useParams();

	return (
		<>
			<h1 className="mb-4 text-balance font-semibold text-xl">Logs</h1>
			<AuditLogsSettingsPage
				description={m["dashboard.settings.menu.audit_logs.description"]}
				id="logs"
				memberId={member.id}
				title={m["dashboard.settings.menu.audit_logs.title"]}
				workspaceId={workspace.id}
				workspaceSlug={workspaceSlug}
			/>
		</>
	);
}
