import { useQuery } from "@tanstack/react-query";
import { Navigate } from "@tanstack/react-router";
import type { ReactNode } from "react";
import ErrorScreen from "@/components/error";
import Loading from "@/components/loading";
import { client } from "./client";

export const useAuth = () => {
	const { data, isLoading, error, refetch } = useQuery({
		queryKey: ["user"],
		queryFn: async () => {
			const user = await client.v1.web.authentication.me.get();

			if (user.error) {
				if (user.error.status === 422 || user.error.status === 401) {
					return null;
				}
				throw new Error("Internal Server error. Please try again later.");
			}

			if (!user.data) {
				return null;
			}

			return user.data;
		},
		retry: false, // Don't retry authentication failures
	});

	const isAuthenticated = !isLoading && !!data;

	return { isAuthenticated, data, isLoading, error, refetch };
};

// Higher-order component that automatically handles auth
export function RequireAuth({
	children,
	redirectTo = "/auth/login",
	fallback,
}: {
	children: ReactNode;
	redirectTo?: string;
	fallback?: ReactNode;
}) {
	const { isAuthenticated, isLoading, error } = useAuth();

	// Show loading while checking authentication
	if (isLoading) {
		return fallback || <Loading />;
	}

	// Redirect to login if not authenticated
	if (!isAuthenticated) {
		return (
			<Navigate
				to={redirectTo}
				search={{ redirectTo: window.location.pathname }}
				replace
			/>
		);
	}

	// Show error if there was a server error
	if (error) {
		return (
			<ErrorScreen message="Failed to verify authentication. Please try again." />
		);
	}

	// User is authenticated, render children
	return <>{children}</>;
}

// Simple hook that returns user data or null (handles loading/errors internally)
export function useUser() {
	const { data, isLoading } = useAuth();
	return isLoading ? null : data;
}

// Hook that returns whether user is authenticated (boolean)
export function useIsAuthenticated() {
	const { isAuthenticated } = useAuth();
	return isAuthenticated;
}
