import { useSyncExternalStore } from "react";
import { cn } from "#/lib/utils";
import { m } from "#/paraglide/messages";
import { useViewedEmail } from "#/stores/viewed-email";
import { DashboardHeader } from "./dashboard/dashboard-header";
import { DashboardNavigation } from "./dashboard/dashboard-navigation";
import { EmailList } from "./dashboard/email-list";
import { EmailPreview } from "./dashboard/email-preview";
import type { DashboardWorkspaceProps } from "./dashboard/types";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "./ui";

function formatEmailCount(count: number) {
	return count === 1
		? m["dashboard.inbox.email_count_one"]({ count })
		: m["dashboard.inbox.email_count"]({ count });
}

const previewPanelBreakpoint = "(min-width: 80rem)";

function getPreviewPanelSnapshot() {
	return (
		typeof window !== "undefined" &&
		window.matchMedia(previewPanelBreakpoint).matches
	);
}

function subscribeToPreviewPanelBreakpoint(onStoreChange: () => void) {
	if (typeof window === "undefined") {
		return () => {};
	}

	const mediaQuery = window.matchMedia(previewPanelBreakpoint);

	mediaQuery.addEventListener("change", onStoreChange);

	return () => mediaQuery.removeEventListener("change", onStoreChange);
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
	const { emailId } = useViewedEmail();
	const previewOpen = emails.some((email) => email.id === emailId);
	const canResizePreview = useSyncExternalStore(
		subscribeToPreviewPanelBreakpoint,
		getPreviewPanelSnapshot,
		() => false,
	);
	const resizablePreviewOpen = previewOpen && canResizePreview;
	const resolvedSubtitle = subtitle ?? formatEmailCount(emails.length);
	const resolvedTitle = title ?? m["dashboard.inbox.unified"]();
	const dashboardContent = (
		<div
			className={cn(
				"flex min-w-0 flex-1 flex-col items-center",
				resizablePreviewOpen &&
					"h-dvh overflow-y-auto [scrollbar-color:gray_transparent] [scrollbar-width:thin]",
			)}
		>
			<div
				className={cn(
					"flex w-full flex-col gap-12 px-5 py-6 lg:px-24 xl:px-32",
					previewOpen && "xl:px-16 2xl:px-24",
				)}
			>
				<DashboardHeader
					currentWorkspace={currentWorkspace}
					workspaces={workspaces}
				/>
				<DashboardNavigation
					addresses={addresses}
					currentAddressSlug={currentAddressSlug}
					previewOpen={previewOpen}
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
		</div>
	);

	if (resizablePreviewOpen) {
		return (
			<div className="h-dvh w-full overflow-hidden bg-white">
				<ResizablePanelGroup
					className="h-dvh"
					orientation="horizontal"
					resizeTargetMinimumSize={{ coarse: 40, fine: 16 }}
				>
					<ResizablePanel defaultSize="60%" id="dashboard-main" minSize="480px">
						{dashboardContent}
					</ResizablePanel>
					<ResizableHandle withHandle />
					<ResizablePanel
						defaultSize="40%"
						id="email-preview"
						maxSize="760px"
						minSize="360px"
					>
						<EmailPreview emails={emails} />
					</ResizablePanel>
				</ResizablePanelGroup>
			</div>
		);
	}

	return (
		<div className="min-h-dvh w-full bg-white [scrollbar-color:gray_transparent] [scrollbar-width:thin]">
			<div className="flex min-h-dvh w-full">
				{dashboardContent}
				<EmailPreview emails={emails} />
			</div>
		</div>
	);
}
