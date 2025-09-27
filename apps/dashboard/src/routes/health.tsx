import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/health")({
	component: IndexComponent,
});
function IndexComponent() {
	return <div>OK</div>;
}
