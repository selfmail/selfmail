import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/third-inbox")({
	component: RouteComponent,
});

function RouteComponent() {
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

	return (
		<div className="grid h-screen w-full grid-cols-6 gap-3 bg-white p-3">
			<div className="col-span-1 h-full rounded-xl bg-neutral-50" />
			<div className="col-span-2 h-full rounded-xl bg-neutral-50" />
			<div className="col-span-3 h-full rounded-xl bg-neutral-50" />
		</div>
	);
}
