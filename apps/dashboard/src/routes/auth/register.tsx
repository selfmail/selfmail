import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/auth/register")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div className="flex min-h-screen items-center justify-center">
			<div className="flex w-74 flex-col space-y-3"></div>
		</div>
	);
}
