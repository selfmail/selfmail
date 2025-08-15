import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/")({
	component: IndexComponent,
});

function IndexComponent() {
	const { isAuthenticated } = useAuth();

	if (!isAuthenticated) {
		return <Navigate to="/auth/login" />;
	}

	return (
		<div>
			<h1>Welcome to the Dashboard</h1>
		</div>
	);
}
