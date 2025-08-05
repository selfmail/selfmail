import { createContext, useContext } from "react";
import { useAuth } from "@/lib/auth";

export interface AuthContextType {
	user: {
		id: string;
		email: string;
		name: string;
	} | null;
	isAuthenticated: boolean;
}

export const RouterAuthContext = createContext<AuthContextType | null>(null);

export const useRouterAuth = () => {
	const context = useContext(RouterAuthContext);
	if (!context) {
		throw new Error("useRouterAuth must be used within a RouterAuthProvider");
	}
	return context;
};

// Auth guard component for routes
export function AuthGuard({ children }: { children: React.ReactNode }) {
	const { user, isAuthenticated, isLoading } = useAuth();

	if (isLoading) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<div className="text-lg">Loading...</div>
			</div>
		);
	}

	if (!isAuthenticated) {
		// Redirect will be handled by beforeLoad
		return null;
	}

	return (
		<RouterAuthContext.Provider value={{ user, isAuthenticated }}>
			{children}
		</RouterAuthContext.Provider>
	);
}
