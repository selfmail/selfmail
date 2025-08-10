import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import EmailList from "@/components/dashboard/email-list";
import EmailViewer from "@/components/dashboard/email-viewer";
import DashboardHeader from "@/components/dashboard/header";
import DashboardNavigation from "@/components/dashboard/navigation";
import { useAuth } from "@/lib/auth";
import type { EmailData } from "@/types/email";

export const Route = createFileRoute("/second-inbox")({
	component: RouteComponent,
	beforeLoad: async () => {
		const { isAuthenticated } = useAuth();
		if (!isAuthenticated) {
			window.location.href = "/auth/login";
			return false; // Prevent route loading
		}
		return true; // Allow route loading
	},
});

function RouteComponent() {
	const [open, setOpen] = useState(true);
	const [selectedEmail, setSelectedEmail] = useState<EmailData | null>(null);
	const { user, logout, isAuthenticated, isLoading } = useAuth();

	const handleEmailClick = (email: EmailData) => {
		setSelectedEmail(email);
		setOpen(true);
	};

	const handleLogout = async () => {
		await logout();
		window.location.href = "/auth/login";
	};

	// Loading state
	if (isLoading) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-[#F8FAFC] text-[#0F172A]">
				<div className="rounded-lg border border-[#E2E8F0] bg-white px-4 py-2 text-sm shadow-sm">
					Loading…
				</div>
			</div>
		);
	}

	// Redirect to login if not authenticated
	if (!isAuthenticated) {
		window.location.href = "/auth/login";
		return null;
	}

	return (
		<div className="flex min-h-screen flex-col bg-[#F8FAFC] text-[#0F172A]">
			<DashboardHeader />
			<DashboardNavigation />

			{/* Page container */}
			<div className="mx-auto w-full max-w-[1400px] px-4 sm:px-6 lg:px-8">
				{/* Page header */}
				<div className="flex items-center justify-between py-6">
					<div>
						<h1 className="font-semibold text-2xl tracking-tight">
							Unified Inbox
						</h1>
						<p className="mt-1 text-[#475569] text-sm">
							Welcome back, {user?.name}!
						</p>
					</div>

					<button
						type="button"
						onClick={handleLogout}
						className="inline-flex h-10 items-center justify-center rounded-lg bg-[#EF4444] px-4 font-medium text-sm text-white transition-colors hover:bg-[#DC2626] focus:outline-none focus:ring-2 focus:ring-[#FCA5A5]"
					>
						Logout
					</button>
				</div>

				{/* Content card */}
				<div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
					{/* Email Viewer (right on large screens, stacked on mobile) */}
					<div className="order-2 lg:order-2 lg:col-span-7 xl:col-span-8">
						<div className="rounded-xl bg-white shadow-sm ring-1 ring-[#E2E8F0]">
							<EmailViewer
								setOpen={setOpen}
								open={open}
								selectedEmail={selectedEmail}
							/>
						</div>
					</div>

					{/* Email List (left on large screens) */}
					<div className="order-1 lg:order-1 lg:col-span-5 xl:col-span-4">
						<div className="rounded-xl bg-white shadow-sm ring-1 ring-[#E2E8F0]">
							<EmailList onEmailClick={handleEmailClick} />
						</div>
					</div>
				</div>

				{/* Bottom spacing */}
				<div className="h-8" />
			</div>
		</div>
	);
}
