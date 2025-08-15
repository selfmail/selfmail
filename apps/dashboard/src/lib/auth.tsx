import { useNavigate } from "@tanstack/react-router";
import {
	createContext,
	type ReactNode,
	useContext,
	useEffect,
	useState,
} from "react";
import { toast } from "sonner";
import { client } from "./client";

export interface User {
	id: string;
	email: string;
	name: string;
}

export interface AuthContextType {
	isLoading: boolean;
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

	const navigate = useNavigate();

	const checkAuthStatus = async () => {
		setIsLoading(true);
		try {
			const response = await client.v1.web.authentication.me.get();

			if (response.data && !response.error) {
				setAuthenticated(true);
			} else {
				setAuthenticated(false);
				navigate({
					to: "/auth/login",
				});
			}
		} catch (error) {
			toast.error("Failed to check authentication status. Please try again.");
			setAuthenticated(false);
			navigate({
				to: "/auth/login",
			});
		}
	};

	// Check for existing auth on mount
	useEffect(() => {
		checkAuthStatus();
	}, []);

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
				isLoading,
				logout,
				isAuthenticated: authenticated,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
}

export function useAuth() {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
}
