import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
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
	const auth = useAuth(false);
	const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
	const [isLoadingWorkspaces, setIsLoadingWorkspaces] = useState(false);
	const navigate = useNavigate();

	console.log("IndexComponent rendered, auth state:", {
		isAuthenticated: auth.isAuthenticated,
		userId: auth.user?.id,
		user: auth.user,
		isLoadingWorkspaces,
	});

	const fetchWorkspaces = async () => {
		console.log("fetchWorkspaces called");
		setIsLoadingWorkspaces(true);
		try {
			const workspaces = await client.v1.web.workspace.user.get();

			console.log("Workspaces response:", workspaces);

			if (!workspaces.data || workspaces.error) {
				console.error("Failed to fetch workspaces:", workspaces.error);
				toast.error(
					`Unknown error: failed to fetch workspaces for user ${auth.user?.id ?? "undefined"}.`,
				);
				return;
			}

			if (workspaces.data.length === 0) {
				await navigate({
					to: "/workspace/create",
				});
				return;
			}

			console.log("Setting workspaces:", workspaces.data);
			setWorkspaces(workspaces.data);
		} catch (error) {
			console.error("Error in fetchWorkspaces:", error);
			toast.error("Failed to fetch workspaces");
		} finally {
			setIsLoadingWorkspaces(false);
		}
	};

	useEffect(() => {
		if (auth.isAuthenticated && auth.user?.id) {
			fetchWorkspaces();
		} else if (auth.isAuthenticated === false) {
			navigate({
				to: "/auth/login",
				search: { redirectTo: undefined },
			});

			return;
		}
	}, [auth.isAuthenticated, auth.user?.id]);

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
							<img
								className="h-9 w-9 rounded-md border border-neutral-100"
								src={workspace.image ?? "/placeholder.png"}
								alt={workspace.name}
							/>
							<h3 className="font-medium text-lg">{workspace.name}</h3>
						</Link>
					))}
				</div>
			) : (
				<p>No workspaces found.</p>
			)}
		</div>
	);
}
