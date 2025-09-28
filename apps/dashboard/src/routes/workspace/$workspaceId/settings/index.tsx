import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "ui";
import DashboardHeader from "@/components/dashboard/header";
import { RequireAuth, useLogout } from "@/lib/auth";
import { RequireWorkspace } from "@/lib/workspace";

export const Route = createFileRoute("/workspace/$workspaceId/settings/")({
	component: RouteComponent,
});

function RouteComponent() {
	const { workspaceId } = Route.useParams();

	return (
		<RequireAuth>
			<RequireWorkspace workspaceId={workspaceId}>
				<Settings workspaceId={workspaceId} />
			</RequireWorkspace>
		</RequireAuth>
	);
}

function Settings({ workspaceId }: { workspaceId: string }) {
	const logout = useLogout();

	return (
		<div>
			<DashboardHeader workspaceId={workspaceId} />
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
			<div className="flex flex-col space-y-5 px-4 py-5 sm:px-6 lg:px-26 xl:px-32">
				<form action="">
					<h2 className="font-medium text-xl">Workspace Settings</h2>
				</form>
				<div className="border-gray-200 border-t pt-5">
					<div className="flex flex-col space-y-3">
						<h3 className="font-medium text-lg">Account</h3>
						<p className="text-gray-600 text-sm">
							Manage your account settings and logout from the application.
						</p>
						<div className="flex">
							<Button variant="destructive" onClick={logout} className="w-fit">
								Logout
							</Button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
