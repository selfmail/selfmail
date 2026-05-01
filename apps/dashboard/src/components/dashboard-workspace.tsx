import { DashboardHeader } from "./dashboard/dashboard-header";
import { DashboardNavigation } from "./dashboard/dashboard-navigation";
import { EmailList } from "./dashboard/email-list";
import { EmailPreview } from "./dashboard/email-preview";
import { sampleEmails } from "./dashboard/sample-emails";
import type { DashboardWorkspaceProps } from "./dashboard/types";

export function DashboardWorkspace({
  currentWorkspace,
  workspaces,
}: DashboardWorkspaceProps) {
  const primaryAddress = `hello@${currentWorkspace.slug || "workspace"}.selfmail.app`;
  const addresses = [
    primaryAddress,
    `support@${currentWorkspace.slug || "workspace"}.selfmail.app`,
  ];

  return (
    <div className="flex min-h-dvh w-full flex-col items-center bg-neutral-50">
      <div className="flex w-full flex-col gap-12 px-5 py-6 lg:px-24 xl:px-32">
        <DashboardHeader
          currentWorkspace={currentWorkspace}
          workspaces={workspaces}
        />
        <DashboardNavigation addresses={addresses} />
        <main className="flex w-full flex-col gap-4">
          <div className="flex w-full flex-row items-center justify-between">
            <div className="flex flex-col gap-1">
              <h1 className="text-balance font-medium text-2xl">
                Unified Inbox
              </h1>
              <p className="text-neutral-600 tabular-nums">3 emails</p>
            </div>
          </div>
          <EmailList emails={sampleEmails} />
        </main>
      </div>
      <EmailPreview />
    </div>
  );
}
