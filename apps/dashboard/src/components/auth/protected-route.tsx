import { Navigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";

interface ProtectedRouteProps {
	children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
	const { isAuthenticated, isLoading } = useAuth();

	if (isLoading) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<div className="text-lg">Loading...</div>
			</div>
		);
	}

	if (!isAuthenticated) {
		return <Navigate to="/auth/login" />;
	}

	return <>{children}</>;
}
