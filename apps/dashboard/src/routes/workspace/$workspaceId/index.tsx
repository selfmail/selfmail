import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import EmailList from "@/components/dashboard/email-list";
import EmailViewer from "@/components/dashboard/email-viewer";
import DashboardLayout from "@/components/layout/dashboard";
import { useTitle } from "@/hooks/useTitle";
import { RequireAuth } from "@/lib/auth";
import { RequireWorkspace, useWorkspace } from "@/lib/workspace";
import type { EmailData } from "@/types/email";

export const Route = createFileRoute("/workspace/$workspaceId/")({
	component: RouteComponent,
});

function RouteComponent() {
	const { workspaceId } = Route.useParams();

	return (
		<RequireAuth>
			<RequireWorkspace workspaceId={workspaceId}>
				<WorkspaceDashboard workspaceId={workspaceId} />
			</RequireWorkspace>
		</RequireAuth>
	);
}

function WorkspaceDashboard({ workspaceId }: { workspaceId: string }) {
	const [open, setOpen] = useState(true);
	const [selectedEmail, setSelectedEmail] = useState<EmailData | null>(null);

	// Call hooks at the top level
	const workspaceData = useWorkspace(workspaceId);
	const workspaceName = useMemo(() => {
		return workspaceData?.workspace?.name;
	}, [workspaceData?.workspace?.name]);

	useTitle(`${workspaceName} - Selfmail Dashboard`, "Selfmail Dashboard");

	const handleEmailClick = (email: EmailData) => {
		setSelectedEmail(email);
		setOpen(true);
	};

	return (
		<DashboardLayout workspaceId={workspaceId} title="Unified Inbox">
			<EmailViewer
				workspaceId={workspaceId}
				setOpen={setOpen}
				open={open}
				selectedEmail={selectedEmail}
			/>

			{/* Email List (left on large screens) */}
			<div className="order-1 lg:order-1 lg:col-span-5 xl:col-span-4">
				<div className="rounded-xl bg-white shadow-sm ring-1 ring-[#E2E8F0]">
					<EmailList workspace={workspaceId} onEmailClick={handleEmailClick} />
				</div>
			</div>
		</DashboardLayout>
	);
}
