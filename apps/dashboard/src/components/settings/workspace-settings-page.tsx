import { DashboardHeader } from "#/components/dashboard/dashboard-header";
import type { DashboardWorkspace } from "#/lib/workspaces";
import { m } from "#/paraglide/messages";
import { WorkspaceSettingsForm } from "./workspace-settings-form";

interface WorkspaceSettingsPageProps {
  workspace: DashboardWorkspace;
  workspaces: DashboardWorkspace[];
}

export function WorkspaceSettingsPage({
  workspace,
  workspaces,
}: WorkspaceSettingsPageProps) {
  return (
    <div className="flex min-h-dvh w-full flex-col items-center bg-white">
      <div className="flex w-full flex-col gap-10 px-5 py-6 lg:px-24 xl:px-32">
        <DashboardHeader currentWorkspace={workspace} workspaces={workspaces} />
        <main className="flex w-full flex-col gap-8">
          <div className="flex max-w-2xl flex-col gap-2">
            <h1 className="text-balance font-medium text-2xl">
              {m["dashboard.settings.title"]()}
            </h1>
            <p className="text-pretty text-neutral-600 text-sm">
              {m["dashboard.settings.description"]({
                workspaceName: workspace.name,
              })}
            </p>
          </div>
          <WorkspaceSettingsForm key={workspace.id} workspace={workspace} />
        </main>
      </div>
    </div>
  );
}
