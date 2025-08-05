import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/mail/$mailId")({
	component: RouteComponent,
});

function RouteComponent() {
	const mailId = Route.useParams().mailId;
	const { isAuthenticated, isLoading } = useAuth();

	// Show loading state
	if (isLoading) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<div className="text-lg">Loading...</div>
			</div>
		);
	}

	// Redirect to login if not authenticated
	if (!isAuthenticated) {
		window.location.href = "/auth/login";
		return null;
	}

	return <div>Hello {mailId}!</div>;
}
