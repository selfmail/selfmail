import { ChartEmailsSentMonth } from "@/components/charts/emails-sent/month";
import { SetHeader } from "@/components/header";
import { EllipsisVerticalIcon } from "@heroicons/react/24/solid";
import { db } from "database";
import Image from "next/image";
import { Avatar, AvatarFallback } from "ui/avatar";
import { Button } from "ui/button";

export default async function HomePage() {
	const lastEmails = await db.email.findMany({
		where: {},
	});

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
				<h2 className="text-lg font-medium">Members in this workspace</h2>
				<p className="text-sm text-muted-foreground">
					You can invite members by clicking the "members" button on the
					sidebar. This is a list of the first 5 members in this workspace.
				</p>
				<div className="flex flex-col space-y-3">
					<div className="border border-border flex items-center justify-between p-2 rounded-lg">
						<div className="flex space-x-3">
							<Avatar>
								<AvatarFallback>HN</AvatarFallback>
							</Avatar>
							<div className="flex flex-col">
								<p>Henri</p>
								<p className="text-sm text-muted-foreground">
									henri@selfmail.app
								</p>
							</div>
						</div>
						<Button variant="ghost" size="icon">
							<EllipsisVerticalIcon className="w-4 h-4" />
						</Button>
					</div>

					<div className="border border-border flex items-center justify-between p-2 rounded-lg">
						<div className="flex space-x-3">
							<Avatar>
								<AvatarFallback>HN</AvatarFallback>
							</Avatar>
							<div className="flex flex-col">
								<p>Henri</p>
								<p className="text-sm text-muted-foreground">
									henri@selfmail.app
								</p>
							</div>
						</div>
						<Button variant="ghost" size="icon">
							<EllipsisVerticalIcon className="w-4 h-4" />
						</Button>
					</div>

					<div className="border border-border flex items-center justify-between p-2 rounded-lg">
						<div className="flex space-x-3">
							<Avatar>
								<AvatarFallback>HN</AvatarFallback>
							</Avatar>
							<div className="flex flex-col">
								<p>Henri</p>
								<p className="text-sm text-muted-foreground">
									henri@selfmail.app
								</p>
							</div>
						</div>
						<Button variant="ghost" size="icon">
							<EllipsisVerticalIcon className="w-4 h-4" />
						</Button>
					</div>

					<div className="border border-border flex items-center justify-between p-2 rounded-lg">
						<div className="flex space-x-3">
							<Avatar>
								<AvatarFallback>HN</AvatarFallback>
							</Avatar>
							<div className="flex flex-col">
								<p>Henri</p>
								<p className="text-sm text-muted-foreground">
									henri@selfmail.app
								</p>
							</div>
						</div>
						<Button variant="ghost" size="icon">
							<EllipsisVerticalIcon className="w-4 h-4" />
						</Button>
					</div>

					<div className="border border-border flex items-center justify-between p-2 rounded-lg">
						<div className="flex space-x-3">
							<Avatar>
								<AvatarFallback>HN</AvatarFallback>
							</Avatar>
							<div className="flex flex-col">
								<p>Henri</p>
								<p className="text-sm text-muted-foreground">
									henri@selfmail.app
								</p>
							</div>
						</div>
						<Button variant="ghost" size="icon">
							<EllipsisVerticalIcon className="w-4 h-4" />
						</Button>
					</div>
				</div>
			</div>
			<div className="flex flex-col p-5 border-b border-border">
				<h2 className="text-lg font-medium">Recent Updates</h2>
				<Image
					src="/images/updates.png"
					alt="updates"
					width={500}
					height={350}
				/>
				<p>
					In this new update, we are adding a new feature to the app. We are
					adding a new feature to the app. We are adding a new feature to the
					app.
				</p>
			</div>
		</div>
	);
}
