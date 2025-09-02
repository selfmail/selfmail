import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { UsersIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { RequireAuth, useUser } from "@/lib/auth";
import { client } from "@/lib/client";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
	component: IndexComponent,
});

type Workspace = {
	name: string;
	image: string | null;
	id: string;
	slug: string;
};

function IndexComponent() {
	return (
		<RequireAuth>
			<WorkspaceSelector />
		</RequireAuth>
	);
}

function WorkspaceSelector() {
	const user = useUser();
	const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
	const navigate = useNavigate();

	const fetchWorkspaces = async () => {
		try {
			const workspaces = await client.v1.web.workspace.user.get();

			if (workspaces.error) {
				console.error("Failed to fetch workspaces:", workspaces.error);
				toast.error("Failed to fetch workspaces. Please try again later.");
				return;
			}

			if (!workspaces.data || workspaces.data.length === 0) {
				await navigate({
					to: "/workspace/create",
				});
				return;
			}

			setWorkspaces(workspaces.data);
		} catch (error) {
			console.error("Error fetching workspaces:", error);
			toast.error("Failed to fetch workspaces. Please try again later.");
		}
	};

	useEffect(() => {
		if (user?.id) {
			fetchWorkspaces();
		}
	}, [user?.id]);

	return (
		<div className="flex min-h-screen flex-col items-center justify-center space-y-4">
			<h1>Choose your workspace</h1>
			{workspaces.length > 0 ? (
				<div className="min-w-96">
					{workspaces.map((workspace, key) => (
						<Link
							key={workspace.id}
							to={"/workspace/$workspaceId"}
							params={{
								workspaceId: workspace.id,
							}}
							className={cn(
								"flex w-full items-center space-x-2 bg-neutral-50 px-4 py-2 transition-colors hover:bg-neutral-100",
								key === 0 && "rounded-t-lg",
								key === workspaces.length - 1 && "rounded-b-lg",
							)}
						>
							{workspace.image ? (
								<img
									className="h-9 w-9 rounded-md border border-neutral-100"
									src={workspace.image ?? "/placeholder.png"}
									alt={workspace.name}
								/>
							) : (
								<div className="flex h-9 w-9 items-center justify-center rounded-md border border-neutral-100 bg-neutral-200">
									<UsersIcon className="h-4 w-4 text-neutral-400" />
								</div>
							)}
							<h3 className="font-medium text-lg">{workspace.name}</h3>
						</Link>
					))}
				</div>
			) : (
				<p>No workspaces found.</p>
			)}
			<Link to="/workspace/create" className="text-neutral-700! underline">
				Create a new workspace
			</Link>
		</div>
	);
}
