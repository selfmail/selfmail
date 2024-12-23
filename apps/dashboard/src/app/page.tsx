import { ChartEmailsSentMonth } from "@/components/charts/emails-sent/month";
import { SetHeader } from "@/components/header";
import { Button } from "ui/button";

export default function HomePage() {
	return (
		<div className="grid lg:grid-cols-2">
			<SetHeader breadcumbs={[{ title: "Inbox", href: "/" }]} />
			<div className="flex flex-col gap-4 p-5 border-b border-r border-border">
				<h2 className="text-lg font-medium">Recent Emails</h2>
				<div className="flex flex-col divide-y *:py-1.5 border-y mb-1.5 border-border divide-border">
					<div className="flex items-center justify-between">
						<p>
							Aquisation of business{" "}
							<span className="text-muted-foreground text-sm">
								henri@selfmail.app
							</span>
						</p>
						<p className="text-sm text-muted-foreground">2024-12-22</p>
					</div>
					<div className="flex items-center justify-between">
						<p>
							Table of contents{" "}
							<span className="text-muted-foreground text-sm">
								henri@selfmail.app
							</span>
						</p>
						<p className="text-sm text-muted-foreground">2024-12-22</p>
					</div>
					<div className="flex items-center justify-between">
						<p>
							How are you?{" "}
							<span className="text-muted-foreground text-sm">
								henri@selfmail.app
							</span>
						</p>
						<p className="text-sm text-muted-foreground">2024-12-22</p>
					</div>
					<div className="flex items-center justify-between">
						<p>
							I want to say thank you{" "}
							<span className="text-muted-foreground text-sm">
								henri@selfmail.app
							</span>
						</p>
						<p className="text-sm text-muted-foreground">2024-12-22</p>
					</div>
					<div className="flex items-center justify-between">
						<p>
							hallo{" "}
							<span className="text-muted-foreground text-sm">
								henri@selfmail.app
							</span>
						</p>
						<p className="text-sm text-muted-foreground">2024-12-22</p>
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
