import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/")({
	component: IndexComponent,
});

function IndexComponent() {
	const { isAuthenticated, isLoading } = useAuth();

	if (isLoading) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<div className="text-lg">Loading...</div>
			</div>
		);
	}

	if (isAuthenticated) {
		return <Navigate to="/second-inbox" />;
	}

	return <Navigate to="/auth/login" />;
}
