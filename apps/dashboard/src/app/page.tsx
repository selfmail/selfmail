import { ChartEmailsSentMonth } from "@/components/charts/emails-sent/month";
import { SetHeader } from "@/components/header";
import { Button } from "ui/button";

export default function HomePage() {
	return (
		<div className="grid lg:grid-cols-2">
			<SetHeader breadcumbs={[{ title: "Inbox", href: "/" }]} />
			<div className="flex flex-col p-5 border-b border-r border-border">
				<h2 className="text-lg font-medium">Recent Emails</h2>
				<div className="grid lg:grid-cols-2">
					<div className="bg-red-200 p-5">
						<h2>Made by henri </h2>
					</div>
					<div className="bg-blue-200 p-5">
						<h2>Made by henri </h2>
					</div>
				</div>
			</div>
			<div className="flex flex-col gap-4 p-5 border-b border-border">
				<h2 className="text-lg font-medium">
					Emails sent & received this month
				</h2>
				<ChartEmailsSentMonth />
			</div>
			<div className="flex flex-col p-5 border-b gap-2 border-r border-border col-span-1">
				<h2 className="text-lg font-medium">Create a new email</h2>
				<p className="text-sm text-muted-foreground">
					You can create a new email by clicking the button below or by clicking
					on the link on the sidebar.
				</p>
				<Button>Create email</Button>
			</div>
			<div className="flex flex-col p-5 border-b border-border">
				<h2 className="text-lg font-medium">Recent Updates</h2>
			</div>
		</div>
	);
}
