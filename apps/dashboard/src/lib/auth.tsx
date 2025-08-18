import { useNavigate } from "@tanstack/react-router";
import {
	createContext,
	type ReactNode,
	useContext,
	useEffect,
	useState,
} from "react";
import { toast } from "sonner";
import Loading from "@/components/loading";
import type { AuthUser } from "../../../api/src/lib/auth-middleware";
import { client } from "./client";

export interface User {
	id: string;
	email: string;
	name: string;
}

export interface AuthContextType {
	user: AuthUser | null;
	logout: () => Promise<void>;
	isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
	children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
	const [isLoading, setIsLoading] = useState(true);
	const [authenticated, setAuthenticated] = useState(false);
	const [user, setUser] = useState<AuthUser | null>(null);

	const checkAuthStatus = async () => {
		setIsLoading(true);
		try {
			const response = await client.v1.web.authentication.me.get();
			console.log("Authentication response:", response);

			if (response.data && !response.error) {
				console.log("User is authenticated:", response.data);
				setUser(response.data);
				setAuthenticated(true);
			} else {
				console.log("User is not authenticated:", response.error);
				setAuthenticated(false);
			}
		} catch (error) {
			console.log("Authentication check failed:", error);
			toast.error("Failed to check authentication status. Please try again.");
			setAuthenticated(false);
		} finally {
			setIsLoading(false);
		}
	};

	// Check for existing auth on mount
	useEffect(() => {
		checkAuthStatus();
	}, []);

	if (isLoading) {
		return <Loading />;
	}

	const logout = async () => {
		try {
			await client.v1.web.authentication.logout.get();
			setAuthenticated(false);
		} catch {
			toast.error("Logout failed. Please try again.");
		}
	};

	return (
		<AuthContext.Provider
			value={{
				user,
				logout,
				isAuthenticated: authenticated,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
}

export function useAuth(shouldNavigate = true) {
	const context = useContext(AuthContext);
	const navigate = useNavigate();

	if (!context) {
		throw new Error("useAuth must be used within an AuthProvider");
	}

	// Navigate to login if not authenticated and shouldNavigate is true
	useEffect(() => {
		if (shouldNavigate && !context.isAuthenticated) {
			navigate({
				to: "/auth/login",
				search: {
					redirectTo: undefined,
				},
			});
		}
	}, [shouldNavigate, context.isAuthenticated, navigate]);

	return context;
}
