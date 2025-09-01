import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import EmailList from "@/components/dashboard/email-list";
import EmailViewer from "@/components/dashboard/email-viewer";
import DashboardHeader from "@/components/dashboard/header";
import DashboardNavigation from "@/components/dashboard/navigation";
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

	const workspaceData = useWorkspace(workspaceId);

	const workspaceName = useMemo(() => {
		return workspaceData?.workspace?.name;
	}, [workspaceData?.workspace?.name]);

	useEffect(() => {
		if (workspaceName) {
			document.title = `${workspaceName} - Selfmail`;
		} else {
			document.title = "Selfmail - Dashboard";
		}

		// Cleanup function to reset title when component unmounts
		return () => {
			document.title = "Selfmail";
		};
	}, [workspaceName]);

	const handleEmailClick = (email: EmailData) => {
		setSelectedEmail(email);
		setOpen(true);
	};

	return (
		<div className="flex min-h-screen flex-col bg-white text-black">
			<DashboardHeader workspaceId={workspaceId} />
			<DashboardNavigation workspaceId={workspaceId} />

			{/* Page container */}
			<div className="mx-auto w-full px-4 sm:px-6 lg:px-26 xl:px-32">
				{/* Page header */}
				<div className="flex items-center justify-between py-6">
					<div>
						<h1 className="font-semibold text-2xl tracking-tight">
							Unified Inbox
						</h1>
					</div>
				</div>

				<EmailViewer
					setOpen={setOpen}
					open={open}
					selectedEmail={selectedEmail}
				/>

				{/* Email List (left on large screens) */}
				<div className="order-1 lg:order-1 lg:col-span-5 xl:col-span-4">
					<div className="rounded-xl bg-white shadow-sm ring-1 ring-[#E2E8F0]">
						<EmailList
							workspace={workspaceId}
							onEmailClick={handleEmailClick}
						/>
					</div>
				</div>
			</div>

			{/* Bottom spacing */}
			<div className="h-8" />
		</div>
	);
}
