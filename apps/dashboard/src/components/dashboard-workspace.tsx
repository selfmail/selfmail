import { m } from "#/paraglide/messages";
import { DashboardHeader } from "./dashboard/dashboard-header";
import { DashboardNavigation } from "./dashboard/dashboard-navigation";
import { EmailList } from "./dashboard/email-list";
import { EmailPreview } from "./dashboard/email-preview";
import type { DashboardWorkspaceProps } from "./dashboard/types";

function formatEmailCount(count: number) {
	return count === 1
		? m["dashboard.inbox.email_count_one"]({ count })
		: m["dashboard.inbox.email_count"]({ count });
}

export function DashboardWorkspace({
	addresses,
	currentAddressSlug,
	currentWorkspace,
	emails,
	subtitle,
	title,
	workspaces,
}: DashboardWorkspaceProps) {
	const resolvedSubtitle = subtitle ?? formatEmailCount(emails.length);
	const resolvedTitle = title ?? m["dashboard.inbox.unified"]();

	return (
		<div className="flex min-h-dvh w-full flex-col items-center bg-white">
			<div className="flex w-full flex-col gap-12 px-5 py-6 lg:px-24 xl:px-32">
				<DashboardHeader
					currentWorkspace={currentWorkspace}
					workspaces={workspaces}
				/>
				<DashboardNavigation
					addresses={addresses}
					currentAddressSlug={currentAddressSlug}
					workspaceSlug={currentWorkspace.slug}
				/>
				<main className="flex w-full flex-col gap-4">
					<div className="flex w-full flex-row items-center justify-between">
						<div className="flex flex-col gap-1">
							<h1 className="text-balance font-medium text-2xl">
								{resolvedTitle}
							</h1>
							<p className="text-neutral-600 tabular-nums">
								{resolvedSubtitle}
							</p>
						</div>
					</div>
					<EmailList emails={emails} />
				</main>
			</div>
			<EmailPreview emails={emails} />
		</div>
	);
}
