import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { trpc, trpcClient } from "@/utils/trpc";

export type User = {
	id: string;
	email: string;
	name: string;
	emailVerified: boolean | null;
	createdAt: Date;
	updatedAt: Date;
};

export type RegisterData = {
	email: string;
	password: string;
	name: string;
};

export type LoginData = {
	email: string;
	password: string;
	username: string;
	emailLoop?: boolean; // Optional, defaults to false
};

/**
 * Authentication hook that provides auth state and methods
 */
export function useAuth() {
	const queryClient = useQueryClient();

	// Check if user is authenticated
	const { data: authStatus, isLoading } = useQuery(
		trpc.auth.isAuthenticated.queryOptions(),
	);

	// Get current user (only if authenticated)
	const { data: currentUser } = useQuery({
		...trpc.auth.me.queryOptions(),
		enabled: authStatus?.isAuthenticated ?? false,
	});

	// Register mutation
	const registerMutation = useMutation({
		mutationFn: async (data: RegisterData) => {
			return trpcClient.auth.register.mutate(data);
		},
		onSuccess: (data) => {
			toast.success(data.message);
			// Invalidate auth queries to refresh state
			queryClient.invalidateQueries({ queryKey: [["auth"]] });
		},
		onError: (error) => {
			toast.error(error.message || "Registration failed");
		},
	});

	// Login mutation
	const loginMutation = useMutation({
		mutationFn: async (data: LoginData) => {
			return await trpcClient.auth.login.mutate(data);
		},
		onSuccess: (data) => {
			toast.success(data.message);
			// Invalidate auth queries to refresh state
			queryClient.invalidateQueries({ queryKey: [["auth"]] });
		},
		onError: (error) => {
			toast.error(error.message || "Login failed");
		},
	});

	// Logout mutation
	const logoutMutation = useMutation({
		mutationFn: async () => {
			return trpcClient.auth.logout.mutate();
		},
		onSuccess: (data) => {
			toast.success(data.message);
			// Clear all auth-related queries
			queryClient.invalidateQueries({ queryKey: [["auth"]] });
			queryClient.clear();
		},
		onError: (error) => {
			toast.error(error.message || "Logout failed");
		},
	});

	return {
		// Auth state
		user: currentUser?.user || authStatus?.user || null,
		isAuthenticated: authStatus?.isAuthenticated ?? false,
		isLoading: isLoading,

		// Auth methods
		register: registerMutation.mutate,
		login: loginMutation.mutate,
		logout: logoutMutation.mutate,

		// Mutation states
		isRegistering: registerMutation.isPending,
		isLoggingIn: loginMutation.isPending,
		isLoggingOut: logoutMutation.isPending,
	};
}
