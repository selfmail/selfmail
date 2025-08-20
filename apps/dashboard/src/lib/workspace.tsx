import { useQuery } from "@tanstack/react-query";
import { Navigate } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { toast } from "sonner";
import Loading from "@/components/loading";
import { client } from "./client";

export const useWorkspaceMember = (
	workspaceId: string,
	permissions?: string[],
) => {
	const { data, error, isLoading, refetch } = useQuery({
		queryKey: ["workspace", workspaceId],
		queryFn: async () => {
			const workspace = await client.v1.web.authentication.me.workspace.get({
				query: {
					workspaceId,
				},
			});

			if (permissions) {
				const hasPermissionsForAction =
					await client.v1.web.authentication.me.workspace.permissions.get({
						query: {
							workspaceId,
							permissions,
						},
					});

				if (
					hasPermissionsForAction.error ||
					hasPermissionsForAction.data.hasPermissions === false
				) {
					throw new Error(
						"You do not have permission to access this workspace.",
					);
				}
			}

			if (workspace.error) {
				throw new Error("Internal Server Error. Please try again later!");
			}

			return workspace.data;
		},
		retry: false,
		enabled: !!workspaceId, // Only run if workspaceId exists
	});

	const hasAccess = !isLoading && !!data;

	return { workspace: data, hasAccess, isLoading, error, refetch };
};

// Higher-order component that automatically handles workspace access
export function RequireWorkspace({
	workspaceId,
	children,
	redirectTo = "/",
	permissions,
	fallback,
}: {
	workspaceId: string;
	children: ReactNode;
	permissions?: string[];
	redirectTo?: string;
	fallback?: ReactNode;
}) {
	const { hasAccess, isLoading, error } = useWorkspaceMember(
		workspaceId,
		permissions,
	);
	// Show loading while checking workspace access
	if (isLoading) {
		return fallback || <Loading />;
	}

	// Redirect if no access to workspace
	if (!hasAccess || error) {
		toast.error("You don't have access to this workspace or it doesn't exist.");
		return <Navigate to={redirectTo} replace />;
	}

	// User has access, render children
	return <>{children}</>;
}

// Simple hook that returns workspace data or null (handles loading/errors internally)
export function useWorkspace(workspaceId: string) {
	const { workspace, isLoading } = useWorkspaceMember(workspaceId);
	return isLoading ? null : workspace;
}

// Hook that returns whether user has workspace access (boolean)
export function useHasWorkspaceAccess(workspaceId: string) {
	const { hasAccess } = useWorkspaceMember(workspaceId);
	return hasAccess;
}

// Combined hook for workspace with member data
export function useWorkspaceWithMember(workspaceId: string) {
	const { workspace, hasAccess, isLoading, error } =
		useWorkspaceMember(workspaceId);

	return {
		workspace: isLoading ? null : workspace,
		hasAccess,
		isLoading,
		error,
	};
}
