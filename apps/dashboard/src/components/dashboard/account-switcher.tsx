import { useMutation, useQuery } from "@tanstack/react-query";
import { getRouteApi, useNavigate } from "@tanstack/react-router";
import {
  CheckIcon,
  ChevronsUpDownIcon,
  DoorOpenIcon,
  PlusIcon,
  SettingsIcon,
} from "lucide-react";
import { toast } from "sonner";
import {
  cn,
  Dropdown,
  DropdownContent,
  DropdownGroup,
  DropdownItem,
  DropdownSeparator,
  DropdownTrigger,
} from "#/components/ui";
import { logoutCurrentSession } from "#/lib/settings/authentication";
import { getDashboardWorkspacesFn } from "#/lib/workspaces/queries";
import { m } from "#/paraglide/messages";
import { settingsDialogHandle } from "../settings";
import type { WorkspaceSummary } from "./types";
import { WorkspaceAvatar } from "./workspace-avatar";

interface AccountSwitcherProps {
  currentWorkspace: WorkspaceSummary;
}

export function AccountSwitcher({ currentWorkspace }: AccountSwitcherProps) {
  const navigate = useNavigate();
  const dropdownItemClassName = "cursor-pointer";
  const logout = useMutation({
    mutationFn: () => logoutCurrentSession(),
    onError: (error) => toast.error(error.message),
    onSuccess: ({ loginHref }) => window.location.assign(loginHref),
  });

  const { user } = getRouteApi("/_authed").useRouteContext();
  const workspacesQuery = useQuery({
    queryKey: ["dashboard-workspaces", user.id],
    queryFn: () => getDashboardWorkspacesFn(),
  });
  const workspaces = workspacesQuery.data ?? [currentWorkspace];

  return (
    <Dropdown>
      <DropdownTrigger
        aria-label={m["dashboard.header.switch_workspace"]()}
        className={cn(
          "h-10 items-center justify-center gap-2 rounded-full border-2 border-border bg-background px-5 font-medium text-foreground text-sm outline-none hover:bg-accent hover:text-accent-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/25 disabled:pointer-events-none disabled:opacity-50 data-[popup-open]:bg-accent data-[popup-open]:text-accent-foreground [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
          "h-auto max-w-full cursor-pointer justify-start rounded-lg border-0 bg-transparent p-0 pr-1 text-base hover:bg-accent hover:text-accent-foreground hover:ring-4 hover:ring-accent focus-visible:ring-ring/25 data-popup-open:bg-accent data-popup-open:text-accent-foreground data-popup-open:ring-4 data-popup-open:ring-accent"
        )}
      >
        <WorkspaceAvatar workspace={currentWorkspace} />
        <h3 className="max-w-42 truncate font-medium text-lg sm:max-w-none">
          {currentWorkspace.name}
        </h3>
        <ChevronsUpDownIcon className="size-4 text-muted-foreground" />
      </DropdownTrigger>
      <DropdownContent
        align="start"
        className="w-72 min-w-0 max-w-[calc(100vw-2rem)]"
        collisionPadding={16}
      >
        {workspacesQuery.isError && (
          <DropdownItem
            className="cursor-pointer text-destructive"
            onClick={() => workspacesQuery.refetch()}
          >
            {m["dashboard.email.load_more_retry"]()}
          </DropdownItem>
        )}
        <DropdownGroup>
          {workspaces.map((workspace) => (
            <DropdownItem
              className={cn(
                "grid-cols-[1.5rem_1fr_auto] gap-2",
                dropdownItemClassName,
                workspace.id === currentWorkspace.id && "bg-muted"
              )}
              icon={<WorkspaceAvatar size="sm" workspace={workspace} />}
              iconClassName="size-6"
              key={workspace.id}
              onClick={() =>
                navigate({
                  params: {
                    workspaceSlug: workspace.slug,
                  },
                  to: "/$workspaceSlug",
                })
              }
              shortcut={
                workspace.id === currentWorkspace.id ? (
                  <CheckIcon className="size-4 text-muted-foreground" />
                ) : null
              }
            >
              {workspace.name}
            </DropdownItem>
          ))}
        </DropdownGroup>
        <DropdownSeparator />
        <DropdownGroup>
          <DropdownItem
            className={dropdownItemClassName}
            icon={<SettingsIcon className="size-4" />}
            onClick={() => settingsDialogHandle.open(null)}
          >
            {m["dashboard.header.settings"]()}
          </DropdownItem>
          <DropdownItem
            className={dropdownItemClassName}
            disabled={logout.isPending}
            icon={<DoorOpenIcon />}
            onClick={() => logout.mutate()}
          >
            {m["dashboard.header.logout"]()}
          </DropdownItem>
          <DropdownItem
            className={dropdownItemClassName}
            icon={<PlusIcon className="size-4" />}
            onClick={() =>
              navigate({
                to: "/onboarding",
              })
            }
          >
            {m["dashboard.header.create_workspace"]()}
          </DropdownItem>
        </DropdownGroup>
      </DropdownContent>
    </Dropdown>
  );
}
