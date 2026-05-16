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
    return () => undefined;
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
    () => false
  );
  const resolvedSubtitle = subtitle ?? formatEmailCount(emails.length);
  const resolvedTitle = title ?? m["dashboard.inbox.unified"]();
  const dashboardContent = (
    <div
      className={cn(
        "@container flex h-dvh min-w-0 flex-1 flex-col items-center overflow-y-auto [scrollbar-color:gray_transparent] [scrollbar-width:thin]"
      )}
    >
      <div
        className={cn(
          "flex w-full flex-col gap-12 @[1000px]:px-26 @[500px]:px-10 @[700px]:px-16 px-4 py-6",
          previewOpen && "xl:px-16 2xl:px-24"
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

  if (canResizePreview) {
    return (
      <div className="h-dvh w-full overflow-hidden">
        <ResizablePanelGroup
          className="h-dvh bg-neutral-200"
          orientation="horizontal"
          resizeTargetMinimumSize={{ coarse: 40, fine: 16 }}
        >
          <ResizablePanel
            className={cn("bg-white", previewOpen && "rounded-r-2xl")}
            defaultSize="60%"
            id="dashboard-main"
            minSize="480px"
          >
            {dashboardContent}
          </ResizablePanel>
          {previewOpen ? (
            <>
              <ResizableHandle className="w-0.75 bg-transparent" />
              <ResizablePanel
                defaultSize="40%"
                id="email-preview"
                maxSize="760px"
                minSize="360px"
              >
                <EmailPreview emails={emails} />
              </ResizablePanel>
            </>
          ) : null}
        </ResizablePanelGroup>
      </div>
    );
  }

  return (
    <div className="h-dvh w-full overflow-hidden bg-white">
      <div className="flex h-dvh w-full">
        {dashboardContent}
        <EmailPreview emails={emails} />
      </div>
    </div>
  );
}
