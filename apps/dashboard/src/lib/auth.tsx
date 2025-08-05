import {
	createContext,
	type ReactNode,
	useContext,
	useEffect,
	useState,
} from "react";
import { client } from "./client";

export interface User {
	id: string;
	email: string;
	name: string;
}

export interface AuthContextType {
	user: User | null;
	isLoading: boolean;
	login: (email: string, password: string) => Promise<void>;
	register: (email: string, password: string, name: string) => Promise<void>;
	logout: () => Promise<void>;
	isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
	children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
	const [user, setUser] = useState<User | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	// Check for existing auth on mount
	useEffect(() => {
		checkAuthStatus();
	}, []);

	const checkAuthStatus = async () => {
		setIsLoading(true);
		try {
			const response = await client.v1.web.authentication.me.get();

			if (response.data && !response.error) {
				setUser(response.data.user);
			} else {
				setUser(null);
			}
		} catch (error) {
			console.error("Auth check error:", error);
			setUser(null);
		} finally {
			setIsLoading(false);
		}
	};

	const login = async (email: string, password: string) => {
		setIsLoading(true);
		try {
			const response = await client.v1.web.authentication.login.post({
				email,
				password,
			});

			if (response.data?.success) {
				setUser(response.data.user);
			} else {
				const errorMessage =
					typeof response.error?.value === "string"
						? response.error.value
						: response.error?.value?.message || "Login failed";
				throw new Error(errorMessage);
			}
		} catch (error) {
			console.error("Login error:", error);
			throw error;
		} finally {
			setIsLoading(false);
		}
	};

	const register = async (email: string, password: string, name: string) => {
		setIsLoading(true);
		try {
			const response = await client.v1.web.authentication.register.post({
				email,
				password,
				name,
			});

			if (response.data?.success) {
				setUser(response.data.user);
			} else {
				const errorMessage =
					typeof response.error?.value === "string"
						? response.error.value
						: response.error?.value?.message || "Registration failed";
				throw new Error(errorMessage);
			}
		} catch (error) {
			console.error("Registration error:", error);
			throw error;
		} finally {
			setIsLoading(false);
		}
	};

	const logout = async () => {
		try {
			await client.v1.web.authentication.logout.post();
		} catch (error) {
			console.error("Logout error:", error);
		} finally {
			setUser(null);
		}
	};

	const isAuthenticated = !!user;

	return (
		<AuthContext.Provider
			value={{
				user,
				isLoading,
				login,
				register,
				logout,
				isAuthenticated,
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
