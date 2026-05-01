import {
  CheckIcon,
  ChevronsUpDownIcon,
  LogOutIcon,
  PlaneTakeoffIcon,
  PlusIcon,
  SettingsIcon,
} from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "#/lib/utils";
import type { DashboardWorkspaceProps } from "./types";
import { WorkspaceAvatar } from "./workspace-avatar";

interface HeaderMenuItemProps {
  children: ReactNode;
  icon: ReactNode;
}

function HeaderMenuItem({ children, icon }: HeaderMenuItemProps) {
  return (
    <button
      className="mt-2 flex w-full cursor-pointer flex-row items-center gap-2 border-neutral-200 border-t px-2 py-2 text-left text-sm transition first:border-t-0 hover:bg-neutral-100"
      type="button"
    >
      <span className="text-neutral-500">{icon}</span>
      {children}
    </button>
  );
}

export function DashboardHeader({
  currentWorkspace,
  workspaces,
}: DashboardWorkspaceProps) {
  return (
    <header className="flex w-full flex-row items-center justify-between gap-4">
      <div className="relative">
        <button
          className="flex cursor-pointer flex-row items-center space-x-3 rounded-lg pr-1 transition hover:bg-neutral-200 hover:ring-4 hover:ring-neutral-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-neutral-200"
          type="button"
        >
          <WorkspaceAvatar workspace={currentWorkspace} />
          <h3 className="max-w-42 truncate font-medium text-lg sm:max-w-none">
            {currentWorkspace.name}
          </h3>
          <ChevronsUpDownIcon className="size-4 text-neutral-500" />
        </button>
        <div className="absolute top-full left-0 z-50 mt-2 hidden w-64 rounded-lg border border-neutral-200 bg-white p-2 shadow-lg">
          <div className="mb-2 px-2 py-1.5 text-neutral-500 text-xs">
            Switch workspace
          </div>
          <div className="flex flex-col gap-1">
            {workspaces.map((workspace) => (
              <button
                className={cn(
                  "flex w-full cursor-pointer flex-row items-center justify-between rounded-md px-2 py-2 text-left transition hover:bg-neutral-100",
                  workspace.id === currentWorkspace.id && "bg-neutral-50"
                )}
                key={workspace.id}
                type="button"
              >
                <div className="flex flex-row items-center space-x-3">
                  <WorkspaceAvatar size="sm" workspace={workspace} />
                  <span className="truncate text-sm">{workspace.name}</span>
                </div>
                {workspace.id === currentWorkspace.id ? (
                  <CheckIcon className="size-4 text-neutral-600" />
                ) : null}
              </button>
            ))}
          </div>
          <HeaderMenuItem icon={<SettingsIcon className="size-4" />}>
            Account Settings
          </HeaderMenuItem>
          <HeaderMenuItem icon={<LogOutIcon className="size-4" />}>
            Logout
          </HeaderMenuItem>
          <HeaderMenuItem icon={<PlusIcon className="size-4" />}>
            Create workspace
          </HeaderMenuItem>
        </div>
      </div>

      <a
        className="flex items-center space-x-3 rounded-xl border border-neutral-300 border-dashed p-2 text-center text-neutral-600 text-sm hover:bg-neutral-100 hover:ring-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-300"
        href="#compose"
      >
        <PlaneTakeoffIcon className="inline-block size-5" />
        <span>Compose</span>
      </a>
    </header>
  );
}
