import { createFileRoute } from "@tanstack/react-router";
import DashboardLayout from "@/components/layout/dashboard";
import { useTitle } from "@/hooks/useTitle";
import { RequireAuth } from "@/lib/auth";
import { RequireWorkspace } from "@/lib/workspace";

export const Route = createFileRoute("/workspace/$workspaceId/billing")({
	component: App,
});

function App() {
	const { workspaceId } = Route.useParams();
	return (
		<RequireAuth>
			<RequireWorkspace workspaceId={workspaceId}>
				<BillingPage workspaceId={workspaceId} />
			</RequireWorkspace>
		</RequireAuth>
	);
}

function BillingPage({ workspaceId }: { workspaceId: string }) {
	useTitle("Billing - Selfmail Dashboard", "Billing - Selfmail Dashboard");
	return (
		<DashboardLayout
			showNav={false}
			showBackButton={true}
			workspaceId={workspaceId}
			title="Billing"
		>
			<div>Billing content goes here</div>
		</DashboardLayout>
	);
}
