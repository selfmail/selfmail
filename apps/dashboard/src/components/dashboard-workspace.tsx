import { useState, useSyncExternalStore } from "react";
import { cn } from "#/lib/utils";
import { m } from "#/paraglide/messages";
import { useViewedEmail } from "#/stores/viewed-email";
import { ComposeSidebar, type ComposeSidebarDraft } from "./compose-sidebar";
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

const resizablePreviewBreakpoint = "(min-width: 64rem)";

function logDashboardWorkspace(
  level: "debug" | "error",
  message: string,
  details: Record<string, unknown>
) {
  if (level === "debug" && process.env.NODE_ENV === "production") {
    return;
  }

  console[level](`[dashboard-workspace] ${message}`, details);
}

function getMediaQuerySnapshot(mediaQueryText: string) {
  return (
    typeof window !== "undefined" && window.matchMedia(mediaQueryText).matches
  );
}

function subscribeToMediaQuery(
  mediaQueryText: string,
  onStoreChange: () => void
) {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  const mediaQuery = window.matchMedia(mediaQueryText);

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
  memberId,
  workspaces,
}: DashboardWorkspaceProps) {
  const [composeDraft, setComposeDraft] = useState<
    ComposeSidebarDraft | undefined
  >();
  const [composeOpen, setComposeOpen] = useState(false);
  const { emailId, setEmailId } = useViewedEmail();
  const previewOpen = emails.some((email) => email.id === emailId);
  const sidePanelOpen = previewOpen || composeOpen;
  const canResizePreview = useSyncExternalStore(
    (onStoreChange) =>
      subscribeToMediaQuery(resizablePreviewBreakpoint, onStoreChange),
    () => getMediaQuerySnapshot(resizablePreviewBreakpoint),
    () => false
  );
  const resolvedSubtitle = subtitle ?? formatEmailCount(emails.length);
  const resolvedTitle = title ?? m["dashboard.inbox.unified"]();

  logDashboardWorkspace("debug", "render", {
    addressCount: addresses.length,
    currentAddressSlug,
    currentWorkspaceId: currentWorkspace?.id,
    currentWorkspaceSlug: currentWorkspace?.slug,
    emailCount: emails.length,
    workspaceCount: workspaces.length,
  });

  if (!currentWorkspace) {
    logDashboardWorkspace("error", "missing current workspace", {
      addressCount: addresses.length,
      currentAddressSlug,
      emailCount: emails.length,
      workspaces: workspaces.map(({ id, slug }) => ({ id, slug })),
    });
    return null;
  }

  const selectEmail = (selectedEmailId: string) => {
    setEmailId(selectedEmailId);
  };
  const openCompose = (draft?: ComposeSidebarDraft) => {
    setComposeDraft(draft);
    setComposeOpen(true);
  };
  const closeCompose = () => {
    setComposeOpen(false);
    setComposeDraft(undefined);
  };
  const dashboardContent = (
    <div
      className={cn(
        "@container-size/dashboard-shell scrollbar-thin flex h-dvh min-w-0 flex-1 flex-col items-center overflow-y-auto [scrollbar-color:gray_transparent]"
      )}
    >
      <div
        className={cn(
          "flex w-full flex-col gap-12 @2xl/dashboard-shell:px-10 @3xl/dashboard-shell:px-16 @min-[62.5rem]/dashboard-shell:px-26 px-8 py-6 [@container_dashboard-shell_(max-height:_42rem)]:px-4"
        )}
      >
        <DashboardHeader
          currentWorkspace={currentWorkspace}
          onComposeOpen={openCompose}
          workspaces={workspaces}
        />
        <DashboardNavigation
          addresses={addresses}
          currentAddressSlug={currentAddressSlug}
          memberId={memberId}
          previewOpen={sidePanelOpen}
          workspaceId={currentWorkspace.id}
          workspaceSlug={currentWorkspace.slug}
        />
        <main className="flex w-full flex-col gap-4">
          <div className="flex w-full flex-row items-center justify-between">
            <div className="flex flex-col gap-1">
              <h1 className="text-balance font-medium text-2xl">
                {resolvedTitle}
              </h1>
              <p className="text-muted-foreground tabular-nums">
                {resolvedSubtitle}
              </p>
            </div>
          </div>
          <EmailList emails={emails} onSelectEmail={selectEmail} />
        </main>
      </div>
    </div>
  );

  if (canResizePreview) {
    return (
      <div className="h-dvh w-full overflow-hidden">
        <ResizablePanelGroup
          className="h-dvh bg-muted"
          orientation="horizontal"
          resizeTargetMinimumSize={{ coarse: 40, fine: 16 }}
        >
          <ResizablePanel
            className={cn("bg-background", sidePanelOpen && "rounded-r-2xl")}
            defaultSize={previewOpen && composeOpen ? "45%" : "60%"}
            id="dashboard-main"
            minSize={previewOpen && composeOpen ? "360px" : "480px"}
          >
            {dashboardContent}
          </ResizablePanel>
          {previewOpen ? (
            <>
              <ResizableHandle className="w-0.75 bg-transparent" />
              <ResizablePanel
                className={cn(
                  "overflow-hidden rounded-l-2xl",
                  composeOpen && "rounded-r-2xl"
                )}
                defaultSize={composeOpen ? "30%" : "40%"}
                id="email-preview"
                maxSize="50%"
                minSize="320px"
              >
                <EmailPreview
                  className={cn(
                    "flex rounded-l-2xl",
                    composeOpen && "rounded-r-2xl"
                  )}
                  emails={emails}
                />
              </ResizablePanel>
            </>
          ) : null}
          {composeOpen ? (
            <>
              <ResizableHandle className="w-0.75 bg-transparent" />
              <ResizablePanel
                defaultSize={previewOpen ? "25%" : "40%"}
                id="compose-sidebar"
                maxSize="50%"
                minSize="340px"
              >
                <ComposeSidebar
                  className="flex"
                  draft={composeDraft}
                  onClose={closeCompose}
                  workspaceSlug={currentWorkspace.slug}
                />
              </ResizablePanel>
            </>
          ) : null}
        </ResizablePanelGroup>
      </div>
    );
  }

  return (
    <div className="h-dvh w-full overflow-hidden bg-background">
      <div className="flex h-dvh w-full">{dashboardContent}</div>
      {composeOpen ? (
        <ComposeSidebar
          className="fixed inset-0 z-30 rounded-none border-l-0"
          draft={composeDraft}
          onClose={closeCompose}
          workspaceSlug={currentWorkspace.slug}
        />
      ) : null}
    </div>
  );
}
