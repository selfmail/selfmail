import { createFileRoute, Link } from "@tanstack/react-router";
import {
  type DashboardWorkspace,
  getDashboardWorkspacesFn,
} from "#/lib/workspaces";

export const Route = createFileRoute("/_authed/")({
  component: RouteComponent,
  loader: async () => ({
    workspaces: await getDashboardWorkspacesFn(),
  }),
});

function RouteComponent() {
  const { user } = Route.useRouteContext();
  const { workspaces } = Route.useLoaderData();

  return (
    <main className="flex min-h-dvh w-full flex-col items-center justify-center space-y-3 bg-neutral-50 px-5 py-10 text-neutral-950">
      <h1 className="text-balance font-medium text-lg">Pick your Workspace</h1>
      <div className="flex w-full flex-col gap-6 rounded-lg border border-neutral-200 bg-white px-5 py-5 lg:max-w-md">
        {workspaces.length === 0 ? (
          <p className="text-center text-neutral-500 text-sm">
            You have no workspaces. Create one!
          </p>
        ) : (
          workspaces.map((workspace) => (
            <WorkspaceTile key={workspace.id} workspace={workspace} />
          ))
        )}
      </div>
      <Link className="text-neutral-500 text-sm hover:underline" to="/">
        Create a new Workspace
      </Link>
      <p className="max-w-md truncate text-neutral-400 text-xs">{user.email}</p>
    </main>
  );
}

function WorkspaceTile({ workspace }: { workspace: DashboardWorkspace }) {
  return (
    <Link
      className="flex items-center space-x-3 rounded-lg border border-neutral-200 p-3 hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-300"
      params={{
        workspaceSlug: workspace.slug,
      }}
      to="/$workspaceSlug"
    >
      {workspace.image ? (
        <img
          alt={workspace.name}
          className="size-8 rounded-full object-cover"
          src={workspace.image}
        />
      ) : (
        <div className="flex size-8 items-center justify-center rounded-full bg-neutral-200">
          <span className="font-medium text-neutral-600 text-sm">
            {getWorkspaceInitials(workspace.name)}
          </span>
        </div>
      )}
      <span className="truncate font-medium">{workspace.name}</span>
    </Link>
  );
}

function getWorkspaceInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
