import { createFileRoute } from "@tanstack/react-router";
import { getWorkspaceAccess } from "#/lib/workspaces";

export const Route = createFileRoute("/_authed/$workspaceId")({
  loader: ({ params }) =>
    getWorkspaceAccess({
      data: {
        workspaceId: params.workspaceId,
      },
    }),
  component: RouteComponent,
});

function RouteComponent() {
  const { workspace } = Route.useLoaderData();

	return (
		<section className="flex w-full flex-col gap-4 px-5 sm:px-10 md:w-md md:px-0">
			<header className="text-center">
				<p className="text-neutral-500 text-sm">Selfmail billing</p>
				<h1 className="text-balance pt-2 font-medium text-3xl">
					Workspace billing
				</h1>
			</header>
			<div className="rounded-[2rem] border border-neutral-200 bg-white p-6 text-center shadow-xs dark:border-neutral-800 dark:bg-neutral-950">
				<p className="text-pretty text-neutral-600 text-sm dark:text-neutral-300">
					Billing details for workspace{" "}
					<span className="font-medium text-neutral-900 dark:text-neutral-100">
						{workspace.name}
					</span>{" "}
					will appear here.
				</p>
			</div>
    </section>
  );
}
