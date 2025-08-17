import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/")({
	component: IndexComponent,
});

function IndexComponent() {
	const auth = useAuth();

	return (
		<div className="flex min-h-screen flex-col items-center justify-center">
			<h1>Choose your workspace</h1>
		</div>
	);
}
