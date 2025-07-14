import { createFileRoute } from "@tanstack/react-router";
import { Inbox } from "lucide-react";
import { ActionHeader, Content, MainContent } from "@/components/content";
import Sidebar from "@/components/sidebar";

export const Route = createFileRoute("/inbox")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div className="flex min-h-screen flex-row items-center gap-4 bg-neutral-950">
			<Sidebar />
			<Content>
				<ActionHeader>
					<div className="flex items-center gap-3">
						<Inbox className="h-6 w-6 text-neutral-400" />
						<h1 className="font-semibold text-lg text-neutral-200">Inbox</h1>
					</div>
				</ActionHeader>
				<MainContent>
					<h2>
						Welcome to your inbox! Here you can manage your messages and
						notifications.
					</h2>
				</MainContent>
			</Content>
		</div>
	);
}
