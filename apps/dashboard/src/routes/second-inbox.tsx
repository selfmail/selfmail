import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useState } from "react";
import EmailList from "@/components/dashboard/email-list";
import EmailViewer from "@/components/dashboard/email-viewer";
import DashboardHeader from "@/components/dashboard/header";
import DashboardNavigation from "@/components/dashboard/navigation";
import type { EmailData } from "@/types/email";

export const Route = createFileRoute("/second-inbox")({
	component: RouteComponent,
});

function RouteComponent() {
	const [open, setOpen] = useState(true);
	const [selectedEmail, setSelectedEmail] = useState<EmailData | null>(null);

	const handleEmailClick = (email: EmailData) => {
		setSelectedEmail(email);
		setOpen(true);
	};

	return (
		<div className="flex min-h-screen flex-col">
			<DashboardHeader />
			<DashboardNavigation />
			<div className="flex flex-col space-x-3 px-32 py-5">
				<h1 className="text-2xl">Unified Inbox</h1>
				<p>About 200 Mails</p>
			</div>
			<EmailViewer
				setOpen={setOpen}
				open={open}
				selectedEmail={selectedEmail}
			/>
			<motion.div>
				<EmailList onEmailClick={handleEmailClick} />
			</motion.div>
		</div>
	);
}
