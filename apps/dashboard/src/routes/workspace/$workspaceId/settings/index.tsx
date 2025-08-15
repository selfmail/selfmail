import { createFileRoute, Link } from "@tanstack/react-router";
import DashboardHeader from "@/components/dashboard/header";

export const Route = createFileRoute("/workspace/$workspaceId/settings/")({
	component: RouteComponent,
});

function RouteComponent() {
	const { workspaceId } = Route.useParams();
	return (
		<div>
			<DashboardHeader />
			<div className="mx-4 flex flex-col space-x-3 rounded-md border border-accent p-4 sm:mx-6 lg:mx-26 lg:flex-row lg:rounded-none lg:border-none lg:p-0 xl:mx-32">
				{/* Settings content goes here */}
				<Link
					to="/workspace/$workspaceId/settings"
					params={{ workspaceId }}
					className="rounded-md bg-neutral-100 p-2 font-medium text-lg ring-2 ring-neutral-100"
				>
					Workspace Settings
				</Link>
				<Link
					to="/workspace/$workspaceId/settings/member"
					params={{ workspaceId }}
					className="rounded-md p-2 font-medium text-lg"
				>
					Member Settings
				</Link>
				<Link
					to="/workspace/$workspaceId/settings/user"
					params={{ workspaceId }}
					className="rounded-md p-2 font-medium text-lg"
				>
					User Settings
				</Link>
			</div>
		</div>
	);
}
